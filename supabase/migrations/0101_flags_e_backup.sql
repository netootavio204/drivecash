-- =====================================================================
-- 0101_flags_e_backup.sql — Chaves liga/desliga da V2 e Snapshots
-- DriveCash v2.1 (Totalmente aditiva e segura)
-- =====================================================================

-- 1. Chaves liga/desliga por usuário (todas desligadas por padrão em produção)
alter table public.configuracoes
  add column if not exists recursos jsonb not null default
  '{"intervalo":false,"locais":false,"partes":false,"taxas":false,"pdf":false}'::jsonb;

-- 2. Foto "antes" (golden master) dos totais por dia — para conferência matemática
create table if not exists public.v2_snapshot_antes as
select d.id as dia_id, d.user_id, d.data_referencia, d.status,
       d.saldo_abertura_centavos, d.saldo_fechamento_centavos,
       r.receita_centavos, r.despesas_centavos, r.reserva_centavos, r.corridas
from public.dias_trabalho d
join public.vw_resumo_dia r on r.dia_id = d.id;

-- 3. Foto "antes" dos saldos de cada caixa
create table if not exists public.v2_snapshot_antes_caixas as
select caixa_id, user_id, tipo, saldo_centavos from public.vw_saldo_caixas;

-- 4. RLS obrigatória nas tabelas de snapshot (isolamento por usuário)
alter table public.v2_snapshot_antes enable row level security;
alter table public.v2_snapshot_antes_caixas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'v2_snapshot_antes' and policyname = 'v2_snap_sel'
  ) then
    create policy v2_snap_sel on public.v2_snapshot_antes for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'v2_snapshot_antes_caixas' and policyname = 'v2_snap_caixas_sel'
  ) then
    create policy v2_snap_caixas_sel on public.v2_snapshot_antes_caixas for select using (user_id = auth.uid());
  end if;
end $$;
