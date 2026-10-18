-- Migração 0109: Taxas, Pacotes Taxa Zero e Fechamento V2 com conferência por local
-- 100% aditiva, segura e idempotente

-- 1. Tabela de Pacotes Taxa Zero
create table if not exists public.pacotes_taxa_zero (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('diario', 'tres_dias', 'por_ganhos')),
  valor_centavos bigint not null check (valor_centavos >= 0),
  data_inicio date not null,
  data_fim date,
  limite_ganhos_centavos bigint,
  ganhos_acumulados_centavos bigint not null default 0,
  ativo boolean not null default true,
  observacao text,
  criado_em timestamptz not null default now()
);

create index if not exists ix_pacotes_taxa_zero_user on public.pacotes_taxa_zero (user_id, ativo, data_inicio);

alter table public.pacotes_taxa_zero enable row level security;
drop policy if exists pacotes_taxa_zero_sel on public.pacotes_taxa_zero;
create policy pacotes_taxa_zero_sel on public.pacotes_taxa_zero for select using (user_id = auth.uid());

drop policy if exists pacotes_taxa_zero_ins on public.pacotes_taxa_zero;
create policy pacotes_taxa_zero_ins on public.pacotes_taxa_zero for insert with check (user_id = auth.uid());

drop policy if exists pacotes_taxa_zero_upd on public.pacotes_taxa_zero;
create policy pacotes_taxa_zero_upd on public.pacotes_taxa_zero for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists pacotes_taxa_zero_del on public.pacotes_taxa_zero;
create policy pacotes_taxa_zero_del on public.pacotes_taxa_zero for delete using (user_id = auth.uid());

-- 2. View com resumo enriquecido v2 (ganho bruto, taxas discriminadas, ganho líquido e lucro líquido)
create or replace view public.vw_resumo_dia_v2 with (security_invoker = true) as
select
  d.id as dia_id,
  d.user_id,
  d.data_referencia,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0)::bigint as ganho_bruto_centavos,
  coalesce(sum(l.qtd_corridas) filter (where l.tipo = 'entrada'), 0)::bigint as corridas,
  -- Taxas de plataforma (99, Uber, etc)
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and l.origem = 'taxa_plataforma'), 0)::bigint as taxa_plataforma_centavos,
  -- Taxas de maquininha / meio
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and l.origem = 'taxa_meio'), 0)::bigint as taxa_maquininha_centavos,
  -- Total de taxas
  (
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and l.origem in ('taxa_plataforma', 'taxa_meio')), 0)
  )::bigint as taxas_total_centavos,
  -- Ganho líquido = bruto - taxas
  (
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0) -
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and l.origem in ('taxa_plataforma', 'taxa_meio')), 0)
  )::bigint as ganho_liquido_centavos,
  -- Percentual efetivo de taxas
  case
    when coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0) > 0 then
      round(
        (
          coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and l.origem in ('taxa_plataforma', 'taxa_meio')), 0) * 100.0
        ) / sum(l.valor_centavos) filter (where l.tipo = 'entrada'),
        2
      )
    else 0
  end::numeric as taxa_efetiva_pct,
  -- Despesas operacionais puras (excluindo taxas que já são tratadas no ganho líquido)
  coalesce(
    sum(l.valor_centavos) filter (
      where l.tipo = 'saida'
        and c.tipo = 'principal'
        and cat.natureza = 'operacional'
        and l.origem not in ('taxa_plataforma', 'taxa_meio')
    ), 0
  )::bigint as despesas_operacionais_centavos,
  -- Lucro Líquido final = ganho_liquido - despesas_operacionais
  (
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0) -
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and c.tipo = 'principal' and cat.natureza = 'operacional'), 0)
  )::bigint as lucro_liquido_centavos,
  -- Reserva de manutenção transferida
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'transferencia_entrada' and c.tipo = 'manutencao'), 0)::bigint as reserva_centavos,
  -- Ajustes de caixa
  (
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_entrada'), 0) -
    coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_saida'), 0)
  )::bigint as ajustes_centavos
from public.dias_trabalho d
left join public.lancamentos l on l.dia_id = d.id and l.excluido_em is null
left join public.caixas c on c.id = l.caixa_id
left join public.categorias cat on cat.id = l.categoria_id
group by d.id, d.user_id, d.data_referencia;

-- 3. Função para lançar Devolução de Taxa da 99
create or replace function public.rpc_lancar_devolucao_taxa(
  p_dia_id uuid,
  p_valor_centavos bigint,
  p_descricao text default 'Devolução de taxa 99',
  p_ocorrido_em timestamptz default now()
) returns public.lancamentos
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_caixa uuid;
  v_app uuid;
  v_cat uuid;
  v_lanc public.lancamentos;
  v_data_ref date;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if p_valor_centavos <= 0 then raise exception 'VALOR_INVALIDO'; end if;

  select id into v_caixa from public.caixas where user_id = v_user and tipo = 'principal';
  select id into v_app from public.locais_dinheiro where user_id = v_user and tipo = 'app' and ativo;
  if v_app is null then
    perform public.rpc_inicializar_locais();
    select id into v_app from public.locais_dinheiro where user_id = v_user and tipo = 'app' and ativo;
  end if;

  select id into v_cat from public.categorias where user_id = v_user and tipo = 'entrada' and nome = 'Devoluções';
  if v_cat is null then
    insert into public.categorias (user_id, tipo, nome, icone, cor, natureza, ordem, protegido)
    values (v_user, 'entrada', 'Devoluções', 'RotateCcw', '#10B981', 'outros', 95, true)
    returning id into v_cat;
  end if;

  v_data_ref := ((coalesce(p_ocorrido_em, now())) at time zone 'America/Sao_Paulo')::date;

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
    modo_partes
  ) values (
    v_user,
    v_caixa,
    p_dia_id,
    'entrada',
    p_valor_centavos,
    v_cat,
    coalesce(p_descricao, 'Devolução de taxa 99'),
    0, -- Não conta como corrida
    coalesce(p_ocorrido_em, now()),
    v_data_ref,
    'devolucoes',
    v_app,
    false
  ) returning * into v_lanc;

  return v_lanc;
end $$;

-- 4. Função RPC Fechar Dia V2 (retrocompatível com V1 + encerramento de intervalos + conferência por local)
create or replace function public.rpc_fechar_dia_v2(
  p_dia_id uuid,
  p_km_final integer default null,
  p_minutos_online integer default null,
  p_deposito_manutencao_centavos bigint default 0,
  p_conferencia_locais jsonb default '[]'::jsonb,
  p_observacoes text default null
) returns public.dias_trabalho
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_dia public.dias_trabalho;
  v_principal uuid;
  v_reserva uuid;
  v_saldo_calc_caixa bigint;
  v_resumo_v2 record;
  v_snapshot jsonb;
  v_dif_total bigint := 0;
  v_local_item record;
  v_saldo_local_calc bigint;
  v_dif_local bigint;
  v_local_nome text;
  v_intervalos_encerrados integer := 0;
  v_minutos_pausa_total integer := 0;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from public.dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_JA_FECHADO'; end if;
  if p_km_final is not null and v_dia.km_inicial is not null and p_km_final < v_dia.km_inicial then
    raise exception 'KM_FINAL_INVALIDO';
  end if;

  select id into v_principal from public.caixas where user_id = v_user and tipo = 'principal';
  select id into v_reserva from public.caixas where user_id = v_user and tipo = 'manutencao';

  -- 1. Encerrar automaticamente qualquer intervalo em aberto para o dia
  if exists (select 1 from public.intervalos where dia_id = v_dia.id and fim_em is null) then
    update public.intervalos
    set
      fim_em = now(),
      minutos = greatest(1, round(extract(epoch from (now() - inicio_em)) / 60.0)::integer)
    where dia_id = v_dia.id and fim_em is null;
    get diagnostics v_intervalos_encerrados = row_count;
  end if;

  select coalesce(sum(minutos), 0) into v_minutos_pausa_total
  from public.intervalos
  where dia_id = v_dia.id and excluido_em is null;

  -- 2. Conferência por Local (RN-V2-28 e Decisão D-V2-11)
  -- Para cada local informado, compara o saldo atual com o informado e gera ajuste no próprio local se houver diferença
  if p_conferencia_locais is not null and jsonb_array_length(p_conferencia_locais) > 0 then
    for v_local_item in
      select * from jsonb_to_recordset(p_conferencia_locais)
      as x(local_id uuid, saldo_informado_centavos bigint)
    loop
      if v_local_item.saldo_informado_centavos is not null then
        -- Busca saldo atual calculado do local
        select nome into v_local_nome from public.locais_dinheiro where id = v_local_item.local_id and user_id = v_user;
        select coalesce(saldo_centavos, 0) into v_saldo_local_calc
        from public.vw_saldo_locais
        where local_id = v_local_item.local_id and user_id = v_user;

        if v_saldo_local_calc is not null and v_local_item.saldo_informado_centavos <> v_saldo_local_calc then
          v_dif_local := v_local_item.saldo_informado_centavos - v_saldo_local_calc;
          v_dif_total := v_dif_total + v_dif_local;

          insert into public.lancamentos (
            user_id,
            caixa_id,
            dia_id,
            tipo,
            valor_centavos,
            descricao,
            origem,
            local_id
          ) values (
            v_user,
            v_principal,
            v_dia.id,
            (case when v_dif_local > 0 then 'ajuste_entrada' else 'ajuste_saida' end)::public.tipo_lancamento,
            abs(v_dif_local),
            case
              when v_dif_local > 0 then 'Sobra na conferência (' || coalesce(v_local_nome, 'Local') || ')'
              else 'Falta na conferência (' || coalesce(v_local_nome, 'Local') || ')'
            end,
            'conferencia',
            v_local_item.local_id
          );
        end if;
      end if;
    end loop;
  end if;

  -- 3. Depósito de Manutenção (Reserva do carro - mantido idêntico ao v1)
  if coalesce(p_deposito_manutencao_centavos, 0) > 0 then
    perform public.rpc_transferir(
      v_principal,
      v_reserva,
      p_deposito_manutencao_centavos,
      'Depósito diário de manutenção',
      v_dia.id,
      'deposito_manutencao'
    );
  end if;

  -- 4. Coletar dados e métricas para o Snapshot V2
  select * into v_resumo_v2 from public.vw_resumo_dia_v2 where dia_id = v_dia.id;
  select saldo_centavos into v_saldo_calc_caixa from public.vw_saldo_caixas where caixa_id = v_principal;

  v_snapshot := jsonb_build_object(
    'versao', 'v2',
    'ganho_bruto_centavos', coalesce(v_resumo_v2.ganho_bruto_centavos, 0),
    'corridas', coalesce(v_resumo_v2.corridas, 0),
    'taxa_plataforma_centavos', coalesce(v_resumo_v2.taxa_plataforma_centavos, 0),
    'taxa_maquininha_centavos', coalesce(v_resumo_v2.taxa_maquininha_centavos, 0),
    'taxas_total_centavos', coalesce(v_resumo_v2.taxas_total_centavos, 0),
    'ganho_liquido_centavos', coalesce(v_resumo_v2.ganho_liquido_centavos, 0),
    'taxa_efetiva_pct', coalesce(v_resumo_v2.taxa_efetiva_pct, 0),
    'despesas_operacionais_centavos', coalesce(v_resumo_v2.despesas_operacionais_centavos, 0),
    'lucro_liquido_centavos', coalesce(v_resumo_v2.lucro_liquido_centavos, 0),
    'reserva_manutencao_centavos', coalesce(p_deposito_manutencao_centavos, 0),
    'km_inicial', v_dia.km_inicial,
    'km_final', p_km_final,
    'km_rodados', case when p_km_final is not null and v_dia.km_inicial is not null then p_km_final - v_dia.km_inicial else null end,
    'minutos_online_bruto', p_minutos_online,
    'minutos_pausa', v_minutos_pausa_total,
    'minutos_online_liquido', case when p_minutos_online is not null then greatest(0, p_minutos_online - v_minutos_pausa_total) else null end,
    'saldos_locais', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'local_id', sl.local_id,
        'nome', sl.nome,
        'tipo', sl.tipo,
        'saldo_centavos', sl.saldo_centavos
      )), '[]'::jsonb)
      from public.vw_saldo_locais sl
      where sl.user_id = v_user and sl.ativo = true
    ),
    'fechado_em', now()
  );

  -- 5. Atualizar o dia de trabalho
  update public.dias_trabalho set
    status = 'fechado',
    fechado_em = now(),
    saldo_calculado_centavos = v_saldo_calc_caixa,
    saldo_fechamento_centavos = v_saldo_calc_caixa - coalesce(p_deposito_manutencao_centavos, 0),
    diferenca_conferencia_centavos = v_dif_total,
    reserva_manutencao_centavos = coalesce(p_deposito_manutencao_centavos, 0),
    km_final = p_km_final,
    minutos_online = p_minutos_online,
    observacoes = p_observacoes,
    resumo = v_snapshot
  where id = v_dia.id
  returning * into v_dia;

  -- 6. Auditoria obrigatória
  insert into public.auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'fechar_dia_v2', to_jsonb(v_dia));

  return v_dia;
end $$;
