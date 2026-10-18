-- =====================================================================
-- 0102_intervalos.sql — Suporte a Intervalos e Pausas de Trabalho
-- DriveCash v2.2 (Aditiva e protegida por RLS)
-- =====================================================================

create table if not exists public.pausas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia_id uuid not null references public.dias_trabalho(id) on delete cascade,
  inicio timestamptz not null default now(),
  fim timestamptz,
  tipo text not null default 'descanso' check (tipo in ('descanso','refeicao','abastecimento','outro')),
  observacao text,
  criado_em timestamptz not null default now(),
  check (fim is null or fim >= inicio)
);

create unique index if not exists ux_pausa_aberta on public.pausas (dia_id) where fim is null;
create index if not exists ix_pausas_dia on public.pausas (dia_id);

alter table public.pausas enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pausas' and policyname = 'pausas_sel') then
    create policy pausas_sel on public.pausas for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pausas' and policyname = 'pausas_ins') then
    create policy pausas_ins on public.pausas for insert with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pausas' and policyname = 'pausas_upd') then
    create policy pausas_upd on public.pausas for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pausas' and policyname = 'pausas_del') then
    create policy pausas_del on public.pausas for delete using (user_id = auth.uid());
  end if;
end $$;

-- Colunas de minutos de pausa e minutos trabalhados líquidos no dia
alter table public.dias_trabalho
  add column if not exists minutos_pausa integer not null default 0,
  add column if not exists minutos_trabalhados integer;

-- RPC para iniciar intervalo
create or replace function public.rpc_iniciar_intervalo(p_dia_id uuid, p_tipo text default 'descanso')
returns public.pausas language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_dia public.dias_trabalho;
  v_p public.pausas;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_FECHADO'; end if;
  if exists (select 1 from pausas where dia_id = p_dia_id and fim is null) then raise exception 'INTERVALO_JA_ABERTO'; end if;
  
  insert into pausas (user_id, dia_id, tipo)
  values (v_user, p_dia_id, coalesce(p_tipo, 'descanso'))
  returning * into v_p;
  
  return v_p;
end $$;

-- RPC para encerrar intervalo
create or replace function public.rpc_encerrar_intervalo(p_dia_id uuid)
returns public.pausas language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_p public.pausas;
  v_total_pausa_min integer;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  
  update pausas
  set fim = now()
  where dia_id = p_dia_id and user_id = v_user and fim is null
  returning * into v_p;
  
  if not found then raise exception 'SEM_INTERVALO_ABERTO'; end if;
  
  -- Recalcula e atualiza minutos_pausa no dia
  select coalesce(sum(extract(epoch from (coalesce(fim, now()) - inicio)) / 60)::integer, 0)
  into v_total_pausa_min
  from pausas
  where dia_id = p_dia_id and user_id = v_user;
  
  update dias_trabalho
  set minutos_pausa = v_total_pausa_min
  where id = p_dia_id and user_id = v_user;
  
  return v_p;
end $$;
