-- Migração 0103: Locais do dinheiro (Bolso, App 99, Bancos e Transferências)
-- 100% aditiva, segura e idempotente

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_local') then
    create type public.tipo_local as enum ('bolso', 'app', 'banco');
  end if;
end $$;

-- Catálogo de bancos brasileiros mais usados
create table if not exists public.bancos_catalogo (
  codigo text primary key,
  nome text not null,
  cor text not null default '#B4B4BB',
  ordem smallint not null default 0
);

insert into public.bancos_catalogo (codigo, nome, cor, ordem) values
  ('inter', 'Inter', '#FF7A00', 1),
  ('mercado_pago', 'Mercado Pago', '#00B1EA', 2),
  ('santander', 'Santander', '#EC0000', 3),
  ('nubank', 'Nubank', '#820AD1', 4),
  ('itau', 'Itaú', '#FF6200', 5),
  ('bradesco', 'Bradesco', '#CC092F', 6),
  ('caixa', 'Caixa', '#0070AF', 7),
  ('banco_do_brasil', 'Banco do Brasil', '#FCDF00', 8),
  ('c6', 'C6 Bank', '#242424', 9),
  ('picpay', 'PicPay', '#21C25E', 10),
  ('pagbank', 'PagBank', '#41B649', 11),
  ('neon', 'Neon', '#00E1FF', 12),
  ('sicoob', 'Sicoob', '#00A68C', 13),
  ('sicredi', 'Sicredi', '#5FB946', 14),
  ('will', 'Will Bank', '#FFD400', 15),
  ('outro', 'Outro', '#6B7280', 99)
on conflict (codigo) do update set
  nome = excluded.nome,
  cor = excluded.cor,
  ordem = excluded.ordem;

alter table public.bancos_catalogo enable row level security;
drop policy if exists bancos_cat_sel on public.bancos_catalogo;
create policy bancos_cat_sel on public.bancos_catalogo for select to authenticated using (true);

-- Tabela de locais de dinheiro por usuário
create table if not exists public.locais_dinheiro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo public.tipo_local not null,
  nome text not null check (char_length(nome) between 1 and 40),
  banco_codigo text references public.bancos_catalogo(codigo),
  cor text,
  saldo_inicial_centavos bigint not null default 0,
  taxa_debito_pct numeric(5,2) not null default 0 check (taxa_debito_pct between 0 and 30),
  taxa_credito_pct numeric(5,2) not null default 0 check (taxa_credito_pct between 0 and 30),
  taxa_pix_pct numeric(5,2) not null default 0 check (taxa_pix_pct between 0 and 30),
  prazo_credito_dias integer not null default 0 check (prazo_credito_dias between 0 and 365),
  ativo boolean not null default true,
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  check ((tipo = 'banco') or banco_codigo is null)
);

create unique index if not exists ux_local_unico on public.locais_dinheiro (user_id, tipo) where tipo in ('bolso', 'app');
create index if not exists ix_locais_user on public.locais_dinheiro (user_id, ativo);

alter table public.locais_dinheiro enable row level security;
drop policy if exists locais_sel on public.locais_dinheiro;
create policy locais_sel on public.locais_dinheiro for select using (user_id = auth.uid());

drop policy if exists locais_ins on public.locais_dinheiro;
create policy locais_ins on public.locais_dinheiro for insert with check (user_id = auth.uid());

drop policy if exists locais_upd on public.locais_dinheiro;
create policy locais_upd on public.locais_dinheiro for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Tabela de transferências entre locais
create table if not exists public.locais_transferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_origem_id uuid not null references public.locais_dinheiro(id),
  local_destino_id uuid not null references public.locais_dinheiro(id),
  valor_centavos bigint not null check (valor_centavos > 0),
  taxa_centavos bigint not null default 0 check (taxa_centavos >= 0 and taxa_centavos <= valor_centavos),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  data_referencia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  observacao text,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  check (local_origem_id <> local_destino_id)
);

create index if not exists ix_loc_transf_user on public.locais_transferencias (user_id, data_referencia) where excluido_em is null;
create index if not exists ix_loc_transf_origem on public.locais_transferencias (local_origem_id);
create index if not exists ix_loc_transf_destino on public.locais_transferencias (local_destino_id);

alter table public.locais_transferencias enable row level security;
drop policy if exists loc_transf_sel on public.locais_transferencias;
create policy loc_transf_sel on public.locais_transferencias for select using (user_id = auth.uid());

drop policy if exists loc_transf_ins on public.locais_transferencias;
create policy loc_transf_ins on public.locais_transferencias for insert with check (user_id = auth.uid());

drop policy if exists loc_transf_upd on public.locais_transferencias;
create policy loc_transf_upd on public.locais_transferencias for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Função idempotente para inicializar os locais padrões do usuário (Bolso, App 99, Inter e Mercado Pago)
create or replace function public.rpc_inicializar_locais()
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

  -- 1. Bolso
  insert into public.locais_dinheiro (user_id, tipo, nome, ordem, cor)
  select v_user, 'bolso', 'Bolso', 1, '#10B981'
  where not exists (select 1 from public.locais_dinheiro where user_id = v_user and tipo = 'bolso');

  -- 2. App 99
  insert into public.locais_dinheiro (user_id, tipo, nome, ordem, cor)
  select v_user, 'app', 'App 99', 2, '#F59E0B'
  where not exists (select 1 from public.locais_dinheiro where user_id = v_user and tipo = 'app');

  -- 3. Banco Inter (Decisão V2.3)
  insert into public.locais_dinheiro (user_id, tipo, nome, banco_codigo, ordem, cor)
  select v_user, 'banco', 'Banco Inter', 'inter', 3, '#FF7A00'
  where not exists (
    select 1 from public.locais_dinheiro
    where user_id = v_user and tipo = 'banco' and banco_codigo = 'inter'
  );

  -- 4. Mercado Pago (Decisão V2.3)
  insert into public.locais_dinheiro (user_id, tipo, nome, banco_codigo, ordem, cor)
  select v_user, 'banco', 'Mercado Pago', 'mercado_pago', 4, '#00B1EA'
  where not exists (
    select 1 from public.locais_dinheiro
    where user_id = v_user and tipo = 'banco' and banco_codigo = 'mercado_pago'
  );
end $$;

-- Função para realizar transferência entre locais
create or replace function public.rpc_transferir_local(
  p_origem_id uuid,
  p_destino_id uuid,
  p_valor_centavos bigint,
  p_taxa_centavos bigint default 0,
  p_dia_id uuid default null,
  p_observacao text default null
)
returns public.locais_transferencias
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_transf public.locais_transferencias;
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  if p_origem_id = p_destino_id then
    raise exception 'ORIGEM_IGUAL_DESTINO';
  end if;

  if p_valor_centavos <= 0 then
    raise exception 'VALOR_INVALIDO';
  end if;

  if p_taxa_centavos < 0 or p_taxa_centavos > p_valor_centavos then
    raise exception 'TAXA_INVALIDA';
  end if;

  if not exists (select 1 from public.locais_dinheiro where id = p_origem_id and user_id = v_user and ativo) then
    raise exception 'ORIGEM_INVALIDA';
  end if;

  if not exists (select 1 from public.locais_dinheiro where id = p_destino_id and user_id = v_user and ativo) then
    raise exception 'DESTINO_INVALIDO';
  end if;

  insert into public.locais_transferencias (
    user_id,
    local_origem_id,
    local_destino_id,
    valor_centavos,
    taxa_centavos,
    dia_id,
    observacao
  ) values (
    v_user,
    p_origem_id,
    p_destino_id,
    p_valor_centavos,
    coalesce(p_taxa_centavos, 0),
    p_dia_id,
    p_observacao
  )
  returning * into v_transf;

  return v_transf;
end $$;
