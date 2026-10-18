-- Migração 0106: RPCs atômicas para lançamento e exclusão de corridas com partes
-- Corrige definitivamente o BUG-02 garantindo que 1 corrida = 1 lançamento com partes

create or replace function public.rpc_lancar_corrida(
  p_id uuid,
  p_dia_id uuid,
  p_plataforma_id uuid,
  p_categoria_id uuid,
  p_valor_centavos bigint,
  p_partes jsonb default '[]'::jsonb,
  p_resto_tipo text default 'app',
  p_taxa_plataforma_centavos bigint default 0,
  p_taxa_origem text default 'nenhuma',
  p_qtd_corridas integer default 1,
  p_ocorrido_em timestamptz default now(),
  p_km numeric default null,
  p_descricao text default null,
  p_data_referencia date default null
) returns public.lancamentos
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_caixa uuid;
  v_app uuid;
  v_lanc public.lancamentos;
  v_cat_taxa99 uuid;
  v_cat_maq uuid;
  v_soma bigint := 0;
  v_resto bigint;
  p record;
  v_local public.locais_dinheiro;
  v_taxa bigint;
  v_pct numeric;
  v_data_ref date;
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  -- Idempotência: se já existe, retorna o existente
  select * into v_lanc from public.lancamentos where id = p_id and user_id = v_user;
  if found then
    return v_lanc;
  end if;

  if p_valor_centavos is null or p_valor_centavos <= 0 then
    raise exception 'VALOR_INVALIDO';
  end if;

  if p_resto_tipo not in ('app', 'cupom') then
    raise exception 'RESTO_TIPO_INVALIDO';
  end if;

  if p_taxa_plataforma_centavos < 0 or p_taxa_plataforma_centavos > p_valor_centavos then
    raise exception 'TAXA_INVALIDA';
  end if;

  if p_qtd_corridas not in (0, 1) then
    raise exception 'QTD_CORRIDAS_INVALIDA';
  end if;

  select id into v_caixa from public.caixas where user_id = v_user and tipo = 'principal';
  select id into v_app from public.locais_dinheiro where user_id = v_user and tipo = 'app' and ativo;

  -- Se local app ainda não existe, tenta inicializar
  if v_app is null then
    perform public.rpc_inicializar_locais();
    select id into v_app from public.locais_dinheiro where user_id = v_user and tipo = 'app' and ativo;
  end if;

  select id into v_cat_taxa99 from public.categorias where user_id = v_user and tipo = 'saida' and nome = 'Taxa 99';
  select id into v_cat_maq from public.categorias where user_id = v_user and tipo = 'saida' and nome = 'Taxa de maquininha';

  -- Validação das partes informadas
  if p_partes is not null and jsonb_array_length(p_partes) > 0 then
    for p in select * from jsonb_to_recordset(p_partes) as x(local_id uuid, meio text, valor_centavos bigint) loop
      if p.valor_centavos is null or p.valor_centavos <= 0 then
        raise exception 'PARTE_INVALIDA';
      end if;
      if p.meio not in ('dinheiro', 'pix', 'debito', 'credito', 'app', 'cupom') then
        raise exception 'MEIO_INVALIDO';
      end if;
      if not exists (select 1 from public.locais_dinheiro where id = p.local_id and user_id = v_user and ativo) then
        raise exception 'LOCAL_INVALIDO';
      end if;
      v_soma := v_soma + p.valor_centavos;
    end loop;
  end if;

  v_resto := p_valor_centavos - v_soma;
  if v_resto < 0 then
    raise exception 'PARTES_EXCEDEM_VALOR';
  end if;

  v_data_ref := coalesce(p_data_referencia, ((coalesce(p_ocorrido_em, now())) at time zone 'America/Sao_Paulo')::date);

  -- 1. Inserir o ÚNICO lançamento principal da corrida (BUG-02 corrigido)
  insert into public.lancamentos (
    id,
    user_id,
    caixa_id,
    dia_id,
    tipo,
    valor_centavos,
    categoria_id,
    plataforma_id,
    descricao,
    qtd_corridas,
    km,
    ocorrido_em,
    data_referencia,
    origem,
    modo_partes,
    taxa_origem
  ) values (
    p_id,
    v_user,
    v_caixa,
    p_dia_id,
    'entrada',
    p_valor_centavos,
    p_categoria_id,
    p_plataforma_id,
    p_descricao,
    p_qtd_corridas,
    p_km,
    coalesce(p_ocorrido_em, now()),
    v_data_ref,
    'manual',
    true,
    coalesce(p_taxa_origem, 'nenhuma')
  )
  returning * into v_lanc;

  -- 2. Inserir as partes informadas
  if p_partes is not null and jsonb_array_length(p_partes) > 0 then
    for p in select * from jsonb_to_recordset(p_partes) as x(local_id uuid, meio text, valor_centavos bigint) loop
      insert into public.lancamento_partes (user_id, lancamento_id, local_id, meio, valor_centavos)
      values (v_user, p_id, p.local_id, p.meio, p.valor_centavos);

      -- Se for maquininha (débito/crédito) e o local tiver taxa cadastrada, gera taxa automática filha
      select * into v_local from public.locais_dinheiro where id = p.local_id;
      if found then
        v_pct := case p.meio
                   when 'debito' then v_local.taxa_debito_pct
                   when 'credito' then v_local.taxa_credito_pct
                   when 'pix' then v_local.taxa_pix_pct
                   else 0
                 end;
        v_taxa := round(p.valor_centavos * v_pct / 100.0);
        if v_taxa > 0 and v_cat_maq is not null then
          insert into public.lancamentos (
            user_id,
            caixa_id,
            dia_id,
            tipo,
            valor_centavos,
            categoria_id,
            descricao,
            qtd_corridas,
            ocorrido_em,
            data_referencia,
            origem,
            local_id,
            lancamento_pai_id
          ) values (
            v_user,
            v_caixa,
            p_dia_id,
            'saida',
            v_taxa,
            v_cat_maq,
            'Taxa maquininha/meio',
            0,
            coalesce(p_ocorrido_em, now()),
            v_data_ref,
            'taxa_meio',
            p.local_id,
            p_id
          );
        end if;
      end if;
    end loop;
  end if;

  -- 3. Inserir o restante no App 99 (se houver e local app estiver disponível)
  if v_resto > 0 and v_app is not null then
    insert into public.lancamento_partes (user_id, lancamento_id, local_id, meio, valor_centavos)
    values (v_user, p_id, v_app, p_resto_tipo, v_resto);
  end if;

  -- 4. Inserir taxa da plataforma se informada (filha da corrida, debitada do app)
  if p_taxa_plataforma_centavos > 0 and v_app is not null and v_cat_taxa99 is not null then
    insert into public.lancamentos (
      user_id,
      caixa_id,
      dia_id,
      tipo,
      valor_centavos,
      categoria_id,
      descricao,
      qtd_corridas,
      ocorrido_em,
      data_referencia,
      origem,
      local_id,
      lancamento_pai_id
    ) values (
      v_user,
      v_caixa,
      p_dia_id,
      'saida',
      p_taxa_plataforma_centavos,
      v_cat_taxa99,
      'Taxa 99',
      0,
      coalesce(p_ocorrido_em, now()),
      v_data_ref,
      'taxa_plataforma',
      v_app,
      p_id
    );
  end if;

  return v_lanc;
end $$;

-- Função atômica para excluir corrida e todos os filhos/partes associados
create or replace function public.rpc_excluir_corrida(p_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  -- Exclui taxas filhas associadas
  update public.lancamentos
  set excluido_em = now()
  where user_id = v_user and lancamento_pai_id = p_id and excluido_em is null;

  -- Exclui o lançamento principal
  update public.lancamentos
  set excluido_em = now()
  where user_id = v_user and id = p_id and excluido_em is null;
end $$;

-- Função para desfazer exclusão de corrida
create or replace function public.rpc_desfazer_exclusao_corrida(p_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  -- Restaura taxas filhas
  update public.lancamentos
  set excluido_em = null
  where user_id = v_user and lancamento_pai_id = p_id;

  -- Restaura o lançamento principal
  update public.lancamentos
  set excluido_em = null
  where user_id = v_user and id = p_id;
end $$;
