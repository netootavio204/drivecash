-- =====================================================================
-- 0003_funcoes.sql — Views e Funções RPC (Cálculos no Banco)
-- =====================================================================

-- ===== Views de Saldo e Resumo do Dia =====
create or replace view public.vw_saldo_caixas with (security_invoker = true) as
select
  c.id as caixa_id,
  c.user_id,
  c.tipo,
  c.nome,
  c.saldo_inicial_centavos + coalesce(sum(
    case
      when l.tipo in ('entrada', 'transferencia_entrada', 'ajuste_entrada') then l.valor_centavos
      else -l.valor_centavos
    end
  ), 0)::bigint as saldo_centavos
from public.caixas c
left join public.lancamentos l on l.caixa_id = c.id and l.excluido_em is null
group by c.id, c.user_id, c.tipo, c.nome, c.saldo_inicial_centavos;

create or replace view public.vw_resumo_dia with (security_invoker = true) as
select
  d.id as dia_id,
  d.user_id,
  d.data_referencia,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0)::bigint as receita_centavos,
  coalesce(sum(l.qtd_corridas) filter (where l.tipo = 'entrada'), 0)::bigint as corridas,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and c.tipo = 'principal' and cat.natureza = 'operacional'), 0)::bigint as despesas_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and c.tipo = 'manutencao'), 0)::bigint as despesas_reserva_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and cat.natureza = 'retirada_pessoal'), 0)::bigint as retiradas_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'transferencia_entrada' and c.tipo = 'manutencao'), 0)::bigint as reserva_centavos,
  (coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_entrada'), 0) -
   coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_saida'), 0))::bigint as ajustes_centavos
from public.dias_trabalho d
left join public.lancamentos l on l.dia_id = d.id and l.excluido_em is null
left join public.caixas c on c.id = l.caixa_id
left join public.categorias cat on cat.id = l.categoria_id
group by d.id, d.user_id, d.data_referencia;

-- ===== Funções Utilitárias de Metas =====
create or replace function public.fn_estrelas_nivel(n public.nivel_medalha) returns integer
language sql immutable as $$
  select case n when 'bronze' then 1 when 'prata' then 3 when 'ouro' then 5 else 0 end;
$$;

create or replace function public.fn_mult_periodo(p public.periodo_meta) returns integer
language sql immutable as $$
  select case p when 'diaria' then 1 when 'semanal' then 3 when 'mensal' then 10 else 50 end;
$$;

create or replace function public.fn_limites_periodo(p_periodo public.periodo_meta, p_ref date, p_inicio_semana smallint default 1)
returns table (ini date, fim date) language sql immutable as $$
  with b as (
    select case p_periodo
      when 'diaria' then p_ref
      when 'semanal' then (p_ref - (((extract(dow from p_ref)::int - p_inicio_semana) + 7) % 7))
      when 'mensal' then date_trunc('month', p_ref)::date
      else date_trunc('year', p_ref)::date
    end as ini
  )
  select
    b.ini,
    case p_periodo
      when 'diaria' then b.ini
      when 'semanal' then b.ini + 6
      when 'mensal' then (b.ini + interval '1 month' - interval '1 day')::date
      else (b.ini + interval '1 year' - interval '1 day')::date
    end as fim
  from b;
$$;

create or replace function public.fn_valor_metrica(p_user uuid, p_metrica public.metrica_meta, p_ini date, p_fim date)
returns bigint language plpgsql stable set search_path = public as $$
declare
  v bigint;
begin
  if p_metrica = 'receita_bruta' then
    select coalesce(sum(valor_centavos), 0)::bigint into v from lancamentos
    where user_id = p_user and excluido_em is null and tipo = 'entrada' and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'corridas' then
    select coalesce(sum(qtd_corridas), 0)::bigint into v from lancamentos
    where user_id = p_user and excluido_em is null and tipo = 'entrada' and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'lucro_liquido' then
    select coalesce(sum(case when l.tipo = 'entrada' then l.valor_centavos else -l.valor_centavos end), 0)::bigint into v
    from lancamentos l
    join caixas c on c.id = l.caixa_id
    left join categorias cat on cat.id = l.categoria_id
    where l.user_id = p_user and l.excluido_em is null and l.data_referencia between p_ini and p_fim
      and (l.tipo = 'entrada' or (l.tipo = 'saida' and c.tipo = 'principal' and cat.natureza = 'operacional'));
  elsif p_metrica = 'reserva_manutencao' then
    select coalesce(sum(l.valor_centavos), 0)::bigint into v
    from lancamentos l
    join caixas c on c.id = l.caixa_id
    where l.user_id = p_user and l.excluido_em is null and c.tipo = 'manutencao'
      and l.tipo = 'transferencia_entrada' and l.data_referencia between p_ini and p_fim;
  elsif p_metrica = 'dias_trabalhados' then
    select count(*)::bigint into v from dias_trabalho
    where user_id = p_user and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'km_rodados' then
    select coalesce(sum(km_final - km_inicial), 0)::bigint into v from dias_trabalho
    where user_id = p_user and km_final is not null and km_inicial is not null and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'minutos_online' then
    select coalesce(sum(minutos_online), 0)::bigint into v from dias_trabalho
    where user_id = p_user and data_referencia between p_ini and p_fim;
  end if;
  return coalesce(v, 0);
end $$;

-- ===== RPC: Transferir Entre Caixas (RN-10) =====
create or replace function public.rpc_transferir(
  p_origem uuid,
  p_destino uuid,
  p_valor_centavos bigint,
  p_observacao text default null,
  p_dia_id uuid default null,
  p_origem_lancamento text default 'transferencia'
) returns uuid language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_saldo bigint;
  v_id uuid := gen_random_uuid();
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if p_origem = p_destino then raise exception 'CAIXAS_IGUAIS'; end if;
  if p_valor_centavos is null or p_valor_centavos <= 0 then raise exception 'VALOR_INVALIDO'; end if;

  if (select count(*) from caixas where user_id = v_user and id in (p_origem, p_destino)) <> 2 then
    raise exception 'CAIXA_INVALIDO';
  end if;

  select saldo_centavos into v_saldo from vw_saldo_caixas where caixa_id = p_origem;
  if v_saldo < p_valor_centavos then raise exception 'SALDO_INSUFICIENTE'; end if;

  insert into transferencias (id, user_id, caixa_origem_id, caixa_destino_id, valor_centavos, dia_id, observacao)
  values (v_id, v_user, p_origem, p_destino, p_valor_centavos, p_dia_id, p_observacao);

  insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem, transferencia_id)
  values
    (v_user, p_origem, p_dia_id, 'transferencia_saida'::tipo_lancamento, p_valor_centavos,
     coalesce(p_observacao, 'Transferência entre caixas'), p_origem_lancamento, v_id),
    (v_user, p_destino, p_dia_id, 'transferencia_entrada'::tipo_lancamento, p_valor_centavos,
     coalesce(p_observacao, 'Transferência entre caixas'), p_origem_lancamento, v_id);

  return v_id;
end $$;

-- ===== RPC: Abrir Dia (RN-04/05) =====
create or replace function public.rpc_abrir_dia(
  p_data_referencia date,
  p_km_inicial integer default null,
  p_saldo_confirmado_centavos bigint default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_caixa uuid;
  v_saldo bigint;
  v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE';
  end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia = p_data_referencia) then
    raise exception 'DIA_JA_EXISTE_NESTA_DATA';
  end if;

  select id into v_caixa from caixas where user_id = v_user and tipo = 'principal';
  select saldo_centavos into v_saldo from vw_saldo_caixas where caixa_id = v_caixa;

  insert into dias_trabalho (user_id, data_referencia, status, saldo_abertura_centavos, km_inicial)
  values (v_user, p_data_referencia, 'aberto', coalesce(p_saldo_confirmado_centavos, v_saldo), p_km_inicial)
  returning * into v_dia;

  if p_saldo_confirmado_centavos is not null and p_saldo_confirmado_centavos <> v_saldo then
    insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem)
    values (
      v_user, v_caixa, v_dia.id,
      (case when p_saldo_confirmado_centavos > v_saldo then 'ajuste_entrada' else 'ajuste_saida' end)::tipo_lancamento,
      abs(p_saldo_confirmado_centavos - v_saldo),
      'Ajuste na abertura do dia',
      'ajuste_abertura'
    );
  end if;

  return v_dia;
end $$;

-- ===== RPC: Fechar Dia (RN-12/13) =====
create or replace function public.rpc_fechar_dia(
  p_dia_id uuid,
  p_saldo_informado_centavos bigint default null,
  p_deposito_manutencao_centavos bigint default 0,
  p_km_final integer default null,
  p_minutos_online integer default null,
  p_observacoes text default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_dia public.dias_trabalho;
  v_principal uuid;
  v_reserva uuid;
  v_saldo_calc bigint;
  v_dif bigint := 0;
  v_resumo jsonb;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_JA_FECHADO'; end if;
  if p_km_final is not null and v_dia.km_inicial is not null and p_km_final < v_dia.km_inicial then
    raise exception 'KM_FINAL_INVALIDO';
  end if;

  select id into v_principal from caixas where user_id = v_user and tipo = 'principal';
  select id into v_reserva from caixas where user_id = v_user and tipo = 'manutencao';

  -- 1) Conferência: compara o valor informado com o calculado
  select saldo_centavos into v_saldo_calc from vw_saldo_caixas where caixa_id = v_principal;

  if p_saldo_informado_centavos is not null and p_saldo_informado_centavos <> v_saldo_calc then
    v_dif := p_saldo_informado_centavos - v_saldo_calc;
    insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem)
    values (
      v_user, v_principal, v_dia.id,
      (case when v_dif > 0 then 'ajuste_entrada' else 'ajuste_saida' end)::tipo_lancamento,
      abs(v_dif),
      case when v_dif > 0 then 'Sobra na conferência do caixa' else 'Falta na conferência do caixa' end,
      'conferencia'
    );
  end if;

  -- 2) Depósito de manutenção (reserva do carro)
  if coalesce(p_deposito_manutencao_centavos, 0) > 0 then
    perform public.rpc_transferir(
      v_principal, v_reserva, p_deposito_manutencao_centavos,
      'Depósito diário de manutenção', v_dia.id, 'deposito_manutencao'
    );
  end if;

  select to_jsonb(r) into v_resumo from vw_resumo_dia r where r.dia_id = v_dia.id;

  update dias_trabalho set
    status = 'fechado',
    fechado_em = now(),
    saldo_calculado_centavos = v_saldo_calc,
    saldo_informado_centavos = p_saldo_informado_centavos,
    saldo_fechamento_centavos = v_saldo_calc + v_dif - coalesce(p_deposito_manutencao_centavos, 0),
    diferenca_conferencia_centavos = v_dif,
    reserva_manutencao_centavos = coalesce(p_deposito_manutencao_centavos, 0),
    km_final = p_km_final,
    minutos_online = p_minutos_online,
    observacoes = p_observacoes,
    resumo = coalesce(v_resumo, '{}'::jsonb)
  where id = v_dia.id
  returning * into v_dia;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'fechar_dia', to_jsonb(v_dia));

  return v_dia;
end $$;

-- ===== RPC: Reabrir Dia (RN-14) =====
create or replace function public.rpc_reabrir_dia(p_dia_id uuid)
returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'fechado' then raise exception 'DIA_NAO_ESTA_FECHADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE';
  end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia > v_dia.data_referencia) then
    raise exception 'APENAS_ULTIMO_DIA';
  end if;

  update dias_trabalho set
    status = 'aberto',
    fechado_em = null,
    saldo_calculado_centavos = null,
    saldo_informado_centavos = null,
    saldo_fechamento_centavos = null,
    diferenca_conferencia_centavos = 0,
    reserva_manutencao_centavos = 0,
    resumo = null
  where id = v_dia.id
  returning * into v_dia;

  update lancamentos set excluido_em = now()
  where dia_id = v_dia.id and excluido_em is null and origem in ('deposito_manutencao', 'conferencia');

  update transferencias set excluido_em = now()
  where dia_id = v_dia.id and excluido_em is null;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'reabrir_dia', to_jsonb(v_dia));

  return v_dia;
end $$;

-- ===== RPC: Atualizar Metas (RN-18/19) =====
create or replace function public.rpc_atualizar_metas(p_ref date default null)
returns table (
  o_meta_id uuid,
  o_ciclo_id uuid,
  o_periodo text,
  o_nivel_anterior text,
  o_nivel_novo text,
  o_estrelas integer
)
language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_ref date;
  v_semana smallint;
  v_tz text;
  m record;
  lim record;
  c public.meta_ciclos;
  v_valor bigint;
  v_nivel public.nivel_medalha;
  v_delta integer;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select fuso_horario into v_tz from profiles where id = v_user;
  select inicio_semana into v_semana from configuracoes where user_id = v_user;
  v_ref := coalesce(p_ref, (now() at time zone coalesce(v_tz, 'America/Sao_Paulo'))::date);

  update meta_ciclos set status = 'consolidado', consolidado_em = now()
  where user_id = v_user and status = 'em_andamento' and periodo_fim < v_ref;

  for m in select * from metas where user_id = v_user and ativa
            and (inicio is null or inicio <= v_ref) and (fim is null or fim >= v_ref) loop
    select * into lim from fn_limites_periodo(m.periodo, v_ref, coalesce(v_semana, 1));

    insert into meta_ciclos (meta_id, user_id, periodo_inicio, periodo_fim, valor_alvo_snapshot, pct_bronze, pct_prata, pct_ouro)
    values (m.id, v_user, lim.ini, lim.fim, m.valor_alvo, m.pct_bronze, m.pct_prata, m.pct_ouro)
    on conflict (meta_id, periodo_inicio) do nothing;

    select * into c from meta_ciclos where meta_id = m.id and periodo_inicio = lim.ini;
    v_valor := fn_valor_metrica(v_user, m.metrica, lim.ini, lim.fim);
    v_nivel := case
      when v_valor >= c.valor_alvo_snapshot * c.pct_ouro / 100.0 then 'ouro'::nivel_medalha
      when v_valor >= c.valor_alvo_snapshot * c.pct_prata / 100.0 then 'prata'::nivel_medalha
      when v_valor >= c.valor_alvo_snapshot * c.pct_bronze / 100.0 then 'bronze'::nivel_medalha
      else 'nenhum'::nivel_medalha
    end;

    v_delta := 0;
    if v_nivel > c.nivel_maximo then
      v_delta := (fn_estrelas_nivel(v_nivel) - fn_estrelas_nivel(c.nivel_maximo)) * fn_mult_periodo(m.periodo);
    end if;

    update meta_ciclos set
      valor_alcancado = v_valor,
      nivel_atual = v_nivel,
      nivel_maximo = greatest(nivel_maximo, v_nivel),
      estrelas_ganhas = estrelas_ganhas + v_delta,
      atualizado_em = now()
    where id = c.id;

    if v_delta > 0 then
      update gamificacao_usuario g set
        estrelas_totais = g.estrelas_totais + v_delta,
        fase_atual = coalesce((select max(numero) from fases where estrelas_minimas <= g.estrelas_totais + v_delta), 1),
        atualizado_em = now()
      where g.user_id = v_user;

      o_meta_id := m.id;
      o_ciclo_id := c.id;
      o_periodo := m.periodo::text;
      o_nivel_anterior := c.nivel_maximo::text;
      o_nivel_novo := v_nivel::text;
      o_estrelas := v_delta;
      return next;
    end if;
  end loop;
end $$;

-- ===== RPC: Pagar Prioridade (RN-24) =====
create or replace function public.rpc_pagar_prioridade(
  p_prioridade_id uuid,
  p_caixa_id uuid,
  p_categoria_id uuid
) returns uuid language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_p public.prioridades;
  v_lanc_id uuid := gen_random_uuid();
  v_prox_venc date;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_p from prioridades where id = p_prioridade_id and user_id = v_user for update;
  if not found then raise exception 'PRIORIDADE_NAO_ENCONTRADA'; end if;
  if v_p.status = 'pago' then raise exception 'PRIORIDADE_JA_PAGA'; end if;

  insert into lancamentos (
    id, user_id, caixa_id, tipo, valor_centavos, categoria_id, descricao, origem, prioridade_id
  ) values (
    v_lanc_id, v_user, p_caixa_id, 'saida'::tipo_lancamento, v_p.valor_centavos, p_categoria_id,
    'Pagamento: ' || v_p.titulo, 'prioridade', v_p.id
  );

  update prioridades set
    status = 'pago', pago_em = now(), lancamento_id = v_lanc_id, atualizado_em = now()
  where id = v_p.id;

  -- Criar próxima ocorrência se for recorrente
  if v_p.recorrencia <> 'nenhuma' then
    v_prox_venc := case v_p.recorrencia
      when 'diaria' then v_p.vencimento + 1
      when 'semanal' then v_p.vencimento + 7
      when 'mensal' then (v_p.vencimento + interval '1 month')::date
      when 'anual' then (v_p.vencimento + interval '1 year')::date
      else null
    end;

    if v_prox_venc is not null then
      insert into prioridades (
        user_id, titulo, valor_centavos, vencimento, nivel, recorrencia, status, observacao
      ) values (
        v_user, v_p.titulo, v_p.valor_centavos, v_prox_venc, v_p.nivel, v_p.recorrencia, 'pendente', v_p.observacao
      );
    end if;
  end if;

  return v_lanc_id;
end $$;
