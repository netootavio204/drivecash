-- Migração 0107: Views analíticas de saldo por local e conciliação
-- 100% aditiva, segura e retrocompatível

-- View com saldo em centavos por local
create or replace view public.vw_saldo_locais with (security_invoker = true) as
select
  l.id as local_id,
  l.user_id,
  l.tipo,
  l.nome,
  l.banco_codigo,
  l.cor,
  l.ativo,
  l.ordem,
  (
    l.saldo_inicial_centavos
    -- Entradas via partes
    + coalesce((
        select sum(p.valor_centavos)
        from public.lancamento_partes p
        join public.lancamentos x on x.id = p.lancamento_id
        where p.local_id = l.id and x.excluido_em is null and x.tipo = 'entrada'
      ), 0)
    -- Entradas diretas vinculadas ao local (ex.: quando não usa partes ou entradas com local_id explícito)
    + coalesce((
        select sum(x.valor_centavos)
        from public.lancamentos x
        where x.local_id = l.id and x.modo_partes is false and x.excluido_em is null and x.tipo = 'entrada'
      ), 0)
    -- Ajustes de entrada
    + coalesce((
        select sum(s.valor_centavos)
        from public.lancamentos s
        where s.local_id = l.id and s.excluido_em is null and s.tipo = 'ajuste_entrada'
      ), 0)
    -- Saídas e ajustes de saída
    - coalesce((
        select sum(s.valor_centavos)
        from public.lancamentos s
        where s.local_id = l.id and s.excluido_em is null and s.tipo in ('saida', 'ajuste_saida')
      ), 0)
    -- Transferências recebidas (líquido da taxa paga)
    + coalesce((
        select sum(t.valor_centavos - t.taxa_centavos)
        from public.locais_transferencias t
        where t.local_destino_id = l.id and t.excluido_em is null
      ), 0)
    -- Transferências enviadas (valor bruto debitado da origem)
    - coalesce((
        select sum(t.valor_centavos)
        from public.locais_transferencias t
        where t.local_origem_id = l.id and t.excluido_em is null
      ), 0)
  )::bigint as saldo_centavos
from public.locais_dinheiro l;

-- View de conciliação: Locais x Caixas
create or replace view public.vw_conciliacao with (security_invoker = true) as
select
  u.user_id,
  (select coalesce(sum(saldo_centavos), 0) from public.vw_saldo_locais where user_id = u.user_id and ativo = true) as total_locais_centavos,
  (select coalesce(sum(saldo_centavos), 0) from public.vw_saldo_caixas where user_id = u.user_id and ativo = true) as total_caixas_centavos,
  (
    (select coalesce(sum(saldo_centavos), 0) from public.vw_saldo_locais where user_id = u.user_id and ativo = true)
    - (select coalesce(sum(saldo_centavos), 0) from public.vw_saldo_caixas where user_id = u.user_id and ativo = true)
  )::bigint as diferenca_centavos
from (
  select distinct user_id from public.locais_dinheiro
  union
  select distinct user_id from public.caixas
) u;

-- View analítica de corridas e receita por meio e por local no dia
create or replace view public.vw_dia_por_meio with (security_invoker = true) as
select
  x.dia_id,
  p.meio,
  p.local_id,
  sum(p.valor_centavos)::bigint as valor_centavos
from public.lancamento_partes p
join public.lancamentos x on x.id = p.lancamento_id
where x.excluido_em is null and x.tipo = 'entrada'
group by x.dia_id, p.meio, p.local_id;
