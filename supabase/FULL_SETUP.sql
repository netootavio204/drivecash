-- =====================================================================
-- META DRIVER — SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN
-- =====================================================================

-- 1. EXTENSÃO E ENUMS
create extension if not exists pgcrypto;

do $$ begin
  create type public.tipo_caixa as enum ('principal', 'manutencao', 'personalizado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_lancamento as enum ('entrada', 'saida', 'transferencia_entrada', 'transferencia_saida', 'ajuste_entrada', 'ajuste_saida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_dia as enum ('aberto', 'fechado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.periodo_meta as enum ('diaria', 'semanal', 'mensal', 'anual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.metrica_meta as enum ('receita_bruta', 'lucro_liquido', 'corridas', 'dias_trabalhados', 'reserva_manutencao', 'km_rodados', 'minutos_online');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.nivel_medalha as enum ('nenhum', 'bronze', 'prata', 'ouro');
exception when duplicate_object then null; end $$;

-- 2. UTILITÁRIOS
create or replace function public.fn_set_atualizado_em() returns trigger
language plpgsql as $$ begin new.atualizado_em := now(); return new; end $$;

-- 3. TABELAS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  avatar_url text,
  fuso_horario text not null default 'America/Sao_Paulo',
  onboarding_concluido boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.configuracoes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  inicio_semana smallint not null default 1 check (inicio_semana between 0 and 6),
  dias_trabalho_semana smallint not null default 6 check (dias_trabalho_semana between 1 and 7),
  dias_folga smallint[] not null default '{}',
  manutencao_modo text not null default 'fixo' check (manutencao_modo in ('fixo','percentual','desativado')),
  manutencao_valor_centavos bigint not null default 2000 check (manutencao_valor_centavos >= 0),
  manutencao_percentual numeric(5,2) not null default 0 check (manutencao_percentual between 0 and 100),
  efeitos_ativos boolean not null default true,
  som_ativo boolean not null default false,
  vibracao_ativa boolean not null default true,
  lembretes jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  apelido text not null,
  marca text,
  modelo text,
  ano smallint,
  placa text,
  combustivel text,
  km_atual integer check (km_atual >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.plataformas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  cor text not null default '#FF7A00',
  icone text,
  ordem smallint not null default 0,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (user_id, nome)
);

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('entrada','saida')),
  nome text not null,
  icone text,
  cor text default '#FF7A00',
  natureza text not null default 'operacional' check (natureza in ('operacional','retirada_pessoal')),
  sistema boolean not null default false,
  ativa boolean not null default true,
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  unique (user_id, tipo, nome)
);

create table if not exists public.caixas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo public.tipo_caixa not null,
  nome text not null,
  saldo_inicial_centavos bigint not null default 0,
  meta_saldo_centavos bigint check (meta_saldo_centavos is null or meta_saldo_centavos > 0),
  cor text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create unique index if not exists ux_caixa_unico_sistema on public.caixas (user_id, tipo) where tipo in ('principal','manutencao');

create table if not exists public.dias_trabalho (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data_referencia date not null,
  status public.status_dia not null default 'aberto',
  aberto_em timestamptz not null default now(),
  fechado_em timestamptz,
  saldo_abertura_centavos bigint not null,
  saldo_calculado_centavos bigint,
  saldo_informado_centavos bigint,
  saldo_fechamento_centavos bigint,
  diferenca_conferencia_centavos bigint not null default 0,
  reserva_manutencao_centavos bigint not null default 0,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  km_inicial integer check (km_inicial >= 0),
  km_final integer check (km_final >= 0),
  minutos_online integer check (minutos_online >= 0),
  observacoes text,
  resumo jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (user_id, data_referencia)
);
create unique index if not exists ux_um_dia_aberto on public.dias_trabalho (user_id) where status = 'aberto';
create index if not exists ix_dias_user_data on public.dias_trabalho (user_id, data_referencia desc);

create table if not exists public.transferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caixa_origem_id uuid not null references public.caixas(id),
  caixa_destino_id uuid not null references public.caixas(id),
  valor_centavos bigint not null check (valor_centavos > 0),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  observacao text,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  check (caixa_origem_id <> caixa_destino_id)
);

create table if not exists public.prioridades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  valor_centavos bigint not null check (valor_centavos > 0),
  vencimento date not null,
  nivel text not null default 'media' check (nivel in ('alta','media','baixa')),
  recorrencia text not null default 'nenhuma' check (recorrencia in ('nenhuma','diaria','semanal','mensal','anual')),
  status text not null default 'pendente' check (status in ('pendente','pago','cancelada')),
  observacao text,
  pago_em timestamptz,
  lancamento_id uuid,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists ix_prioridades_user on public.prioridades (user_id, status, vencimento);

create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caixa_id uuid not null references public.caixas(id),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  tipo public.tipo_lancamento not null,
  valor_centavos bigint not null check (valor_centavos > 0 and valor_centavos <= 100000000),
  categoria_id uuid references public.categorias(id),
  plataforma_id uuid references public.plataformas(id),
  descricao text,
  qtd_corridas integer not null default 0 check (qtd_corridas between 0 and 999),
  km numeric(6,1) check (km >= 0),
  duracao_min integer check (duracao_min >= 0),
  meio_pagamento text check (meio_pagamento in ('dinheiro','pix','saldo_app','outro')),
  ocorrido_em timestamptz not null default now(),
  data_referencia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  origem text not null default 'manual' check (origem in
    ('manual','resumo_dia','deposito_manutencao','ajuste_abertura','conferencia','prioridade','transferencia','sistema')),
  transferencia_id uuid references public.transferencias(id) on delete set null,
  prioridade_id uuid references public.prioridades(id) on delete set null,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint ck_categoria_obrigatoria check (tipo not in ('entrada','saida') or categoria_id is not null)
);
create index if not exists ix_lanc_user_data on public.lancamentos (user_id, data_referencia) where excluido_em is null;
create index if not exists ix_lanc_caixa on public.lancamentos (caixa_id) where excluido_em is null;
create index if not exists ix_lanc_dia on public.lancamentos (dia_id);

create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  periodo public.periodo_meta not null,
  metrica public.metrica_meta not null,
  valor_alvo bigint not null check (valor_alvo > 0),
  pct_bronze smallint not null default 70,
  pct_prata smallint not null default 100,
  pct_ouro smallint not null default 130,
  recorrente boolean not null default true,
  ativa boolean not null default true,
  inicio date,
  fim date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (pct_bronze > 0 and pct_bronze < pct_prata and pct_prata < pct_ouro)
);
create index if not exists ix_metas_user on public.metas (user_id, ativa);

create table if not exists public.meta_ciclos (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references public.metas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  valor_alvo_snapshot bigint not null,
  pct_bronze smallint not null,
  pct_prata smallint not null,
  pct_ouro smallint not null,
  valor_alcancado bigint not null default 0,
  nivel_atual public.nivel_medalha not null default 'nenhum',
  nivel_maximo public.nivel_medalha not null default 'nenhum',
  estrelas_ganhas integer not null default 0,
  status text not null default 'em_andamento' check (status in ('em_andamento','consolidado')),
  consolidado_em timestamptz,
  atualizado_em timestamptz not null default now(),
  unique (meta_id, periodo_inicio)
);
create index if not exists ix_ciclos_user on public.meta_ciclos (user_id, periodo_inicio desc);

create table if not exists public.fases (
  numero smallint primary key,
  nome text not null,
  estrelas_minimas integer not null,
  cor text
);

create table if not exists public.conquistas_catalogo (
  codigo text primary key,
  titulo text not null,
  descricao text not null,
  icone text,
  estrelas_bonus integer not null default 0,
  ordem smallint not null default 0
);

create table if not exists public.conquistas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  codigo text not null references public.conquistas_catalogo(codigo),
  desbloqueada_em timestamptz not null default now(),
  contexto jsonb,
  unique (user_id, codigo)
);

create table if not exists public.gamificacao_usuario (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  estrelas_totais integer not null default 0,
  fase_atual smallint not null default 1 references public.fases(numero),
  sequencia_atual integer not null default 0,
  maior_sequencia integer not null default 0,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.auditoria (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  tabela text not null,
  registro_id uuid,
  acao text not null,
  antes jsonb,
  depois jsonb,
  criado_em timestamptz not null default now()
);

-- 4. TRIGGERS DE ATUALIZADO_EM
drop trigger if exists trg_profiles_upd on public.profiles;
create trigger trg_profiles_upd before update on public.profiles for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_config_upd on public.configuracoes;
create trigger trg_config_upd before update on public.configuracoes for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_veiculos_upd on public.veiculos;
create trigger trg_veiculos_upd before update on public.veiculos for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_lanc_upd on public.lancamentos;
create trigger trg_lanc_upd before update on public.lancamentos for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_dias_upd on public.dias_trabalho;
create trigger trg_dias_upd before update on public.dias_trabalho for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_metas_upd on public.metas;
create trigger trg_metas_upd before update on public.metas for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_prior_upd on public.prioridades;
create trigger trg_prior_upd before update on public.prioridades for each row execute function public.fn_set_atualizado_em();

-- 5. REGRAS DE INTEGRIDADE DE LANÇAMENTOS
create or replace function public.fn_lancamento_regras() returns trigger
language plpgsql set search_path = public as $$
declare
  v_dia public.dias_trabalho;
begin
  if new.dia_id is not null then
    select * into v_dia from dias_trabalho where id = new.dia_id;
    if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
    if v_dia.status = 'fechado' then raise exception 'DIA_FECHADO'; end if;
    new.data_referencia := v_dia.data_referencia;
  end if;
  if tg_op = 'UPDATE' and old.dia_id is not null and old.dia_id is distinct from new.dia_id then
    if exists (select 1 from dias_trabalho where id = old.dia_id and status = 'fechado') then
      raise exception 'DIA_FECHADO';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_lanc_regras on public.lancamentos;
create trigger trg_lanc_regras before insert or update on public.lancamentos
for each row execute function public.fn_lancamento_regras();

-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
alter table public.profiles enable row level security;
drop policy if exists profiles_sel on public.profiles;
drop policy if exists profiles_ins on public.profiles;
drop policy if exists profiles_upd on public.profiles;
create policy profiles_sel on public.profiles for select using (id = auth.uid());
create policy profiles_ins on public.profiles for insert with check (id = auth.uid());
create policy profiles_upd on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

do $$ declare t text; begin
  foreach t in array array['configuracoes','gamificacao_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I', t||'_ins', t);
    execute format('drop policy if exists %I on public.%I', t||'_upd', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['veiculos','plataformas','categorias','prioridades','metas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I', t||'_ins', t);
    execute format('drop policy if exists %I on public.%I', t||'_upd', t);
    execute format('drop policy if exists %I on public.%I', t||'_del', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
    execute format('create policy %I on public.%I for delete using (user_id = auth.uid())', t||'_del', t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['caixas','dias_trabalho','lancamentos','transferencias','meta_ciclos','conquistas_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I', t||'_ins', t);
    execute format('drop policy if exists %I on public.%I', t||'_upd', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

alter table public.auditoria enable row level security;
drop policy if exists auditoria_sel on public.auditoria;
create policy auditoria_sel on public.auditoria for select using (user_id = auth.uid());

alter table public.fases enable row level security;
alter table public.conquistas_catalogo enable row level security;
drop policy if exists fases_sel on public.fases;
drop policy if exists conquistas_cat_sel on public.conquistas_catalogo;
create policy fases_sel on public.fases for select to authenticated using (true);
create policy conquistas_cat_sel on public.conquistas_catalogo for select to authenticated using (true);

-- 7. VIEWS DE SALDO E RESUMO
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

-- 8. FUNÇÕES RPC
create or replace function public.fn_estrelas_nivel(n public.nivel_medalha) returns integer
language sql immutable as $$ select case n when 'bronze' then 1 when 'prata' then 3 when 'ouro' then 5 else 0 end; $$;

create or replace function public.fn_mult_periodo(p public.periodo_meta) returns integer
language sql immutable as $$ select case p when 'diaria' then 1 when 'semanal' then 3 when 'mensal' then 10 else 50 end; $$;

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
  select b.ini,
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
declare v bigint;
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

create or replace function public.rpc_transferir(
  p_origem uuid, p_destino uuid, p_valor_centavos bigint,
  p_observacao text default null, p_dia_id uuid default null, p_origem_lancamento text default 'transferencia'
) returns uuid language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_saldo bigint; v_id uuid := gen_random_uuid();
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

create or replace function public.rpc_abrir_dia(
  p_data_referencia date, p_km_inicial integer default null, p_saldo_confirmado_centavos bigint default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_caixa uuid; v_saldo bigint; v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia = p_data_referencia) then
    raise exception 'DIA_JA_EXISTE_NESTA_DATA'; end if;

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

create or replace function public.rpc_fechar_dia(
  p_dia_id uuid, p_saldo_informado_centavos bigint default null, p_deposito_manutencao_centavos bigint default 0,
  p_km_final integer default null, p_minutos_online integer default null, p_observacoes text default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_dia public.dias_trabalho; v_principal uuid; v_reserva uuid;
  v_saldo_calc bigint; v_dif bigint := 0; v_resumo jsonb;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_JA_FECHADO'; end if;
  if p_km_final is not null and v_dia.km_inicial is not null and p_km_final < v_dia.km_inicial then
    raise exception 'KM_FINAL_INVALIDO'; end if;

  select id into v_principal from caixas where user_id = v_user and tipo = 'principal';
  select id into v_reserva from caixas where user_id = v_user and tipo = 'manutencao';

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

  if coalesce(p_deposito_manutencao_centavos, 0) > 0 then
    perform public.rpc_transferir(
      v_principal, v_reserva, p_deposito_manutencao_centavos,
      'Depósito diário de manutenção', v_dia.id, 'deposito_manutencao'
    );
  end if;

  select to_jsonb(r) into v_resumo from vw_resumo_dia r where r.dia_id = v_dia.id;

  update dias_trabalho set
    status = 'fechado', fechado_em = now(),
    saldo_calculado_centavos = v_saldo_calc,
    saldo_informado_centavos = p_saldo_informado_centavos,
    saldo_fechamento_centavos = v_saldo_calc + v_dif - coalesce(p_deposito_manutencao_centavos, 0),
    diferenca_conferencia_centavos = v_dif,
    reserva_manutencao_centavos = coalesce(p_deposito_manutencao_centavos, 0),
    km_final = p_km_final, minutos_online = p_minutos_online, observacoes = p_observacoes,
    resumo = coalesce(v_resumo, '{}'::jsonb)
  where id = v_dia.id returning * into v_dia;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'fechar_dia', to_jsonb(v_dia));
  return v_dia;
end $$;

create or replace function public.rpc_reabrir_dia(p_dia_id uuid)
returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'fechado' then raise exception 'DIA_NAO_ESTA_FECHADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia > v_dia.data_referencia) then
    raise exception 'APENAS_ULTIMO_DIA'; end if;

  update dias_trabalho set
    status = 'aberto', fechado_em = null, saldo_calculado_centavos = null,
    saldo_informado_centavos = null, saldo_fechamento_centavos = null,
    diferenca_conferencia_centavos = 0, reserva_manutencao_centavos = 0, resumo = null
  where id = v_dia.id returning * into v_dia;

  update lancamentos set excluido_em = now()
  where dia_id = v_dia.id and excluido_em is null and origem in ('deposito_manutencao', 'conferencia');

  update transferencias set excluido_em = now()
  where dia_id = v_dia.id and excluido_em is null;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'reabrir_dia', to_jsonb(v_dia));
  return v_dia;
end $$;

create or replace function public.rpc_atualizar_metas(p_ref date default null)
returns table (
  o_meta_id uuid, o_ciclo_id uuid, o_periodo text, o_nivel_anterior text, o_nivel_novo text, o_estrelas integer
) language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_ref date; v_semana smallint; v_tz text;
  m record; lim record; c public.meta_ciclos; v_valor bigint; v_nivel public.nivel_medalha; v_delta integer;
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
      valor_alcancado = v_valor, nivel_atual = v_nivel,
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

      o_meta_id := m.id; o_ciclo_id := c.id; o_periodo := m.periodo::text;
      o_nivel_anterior := c.nivel_maximo::text; o_nivel_novo := v_nivel::text; o_estrelas := v_delta;
      return next;
    end if;
  end loop;
end $$;

create or replace function public.rpc_pagar_prioridade(
  p_prioridade_id uuid, p_caixa_id uuid, p_categoria_id uuid
) returns uuid language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_p public.prioridades; v_lanc_id uuid := gen_random_uuid(); v_prox_venc date;
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

  update prioridades set status = 'pago', pago_em = now(), lancamento_id = v_lanc_id, atualizado_em = now()
  where id = v_p.id;

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

-- 9. DADOS DE CATÁLOGO (FASES E CONQUISTAS)
insert into public.fases (numero, nome, estrelas_minimas, cor) values
  (1, 'Aprendiz', 0, '#B4B4BB'),
  (2, 'Estradeiro', 25, '#CD7F32'),
  (3, 'Profissional', 100, '#C9CED6'),
  (4, 'Veterano', 300, '#FFC83D'),
  (5, 'Mestre do Volante', 700, '#FF7A00'),
  (6, 'Elite', 1500, '#FF2D2D'),
  (7, 'Lenda', 3000, '#FF2D2D')
on conflict (numero) do update set
  nome = excluded.nome, estrelas_minimas = excluded.estrelas_minimas, cor = excluded.cor;

insert into public.conquistas_catalogo (codigo, titulo, descricao, icone, estrelas_bonus, ordem) values
  ('primeiro_dia', 'Ponto batido', 'Abrir o primeiro dia', 'clock', 2, 1),
  ('primeira_entrada', 'Primeira corrida', 'Registrar a primeira entrada', 'car', 1, 2),
  ('primeiro_fechamento', 'Dia encerrado', 'Fechar o primeiro dia', 'check-circle', 2, 3),
  ('primeira_meta', 'Meta batida', 'Atingir qualquer nível em uma meta', 'award', 3, 4),
  ('primeiro_ouro', 'Ouro puro', 'Conquistar a primeira medalha de ouro', 'sparkles', 5, 5),
  ('sequencia_3', 'Pegando ritmo', '3 dias seguidos abertos e fechados', 'flame', 3, 6),
  ('sequencia_7', 'Semana de ferro', '7 dias seguidos', 'flame', 8, 7),
  ('sequencia_14', 'Quinzena firme', '14 dias seguidos', 'flame', 15, 8),
  ('sequencia_30', 'Mês imparável', '30 dias seguidos', 'flame', 40, 9),
  ('semana_perfeita', 'Semana perfeita', 'Prata ou mais na meta diária em todos os dias de trabalho da semana', 'star', 15, 10),
  ('mes_perfeito', 'Mês perfeito', 'Ouro na meta mensal', 'crown', 30, 11),
  ('reserva_100', 'Cofre aberto', 'R$ 100 na Manutenção', 'shield', 2, 12),
  ('reserva_500', 'Cofre recheado', 'R$ 500 na Manutenção', 'shield', 5, 13),
  ('reserva_1000', 'Reserva de ouro', 'R$ 1.000 na Manutenção', 'shield', 10, 14),
  ('reserva_meta', 'Reserva completa', 'Atingir a meta de reserva', 'shield-check', 10, 15),
  ('dia_500', 'Dia de 500', 'Receita ≥ R$ 500 em um dia', 'zap', 5, 16),
  ('corridas_100', 'Centurião', '100 corridas acumuladas', 'target', 5, 17),
  ('corridas_1000', 'Mil corridas', '1.000 corridas acumuladas', 'trophy', 20, 18),
  ('contas_certas', 'Contas certas', '7 conferências seguidas sem diferença', 'check', 8, 19),
  ('primeira_conta_paga', 'Conta paga', 'Pagar a primeira prioridade', 'credit-card', 2, 20),
  ('contas_em_dia', 'Organizado', 'Pagar todas as prioridades do mês em dia', 'calendar-check', 8, 21),
  ('madrugador', 'Madrugador', 'Abrir o dia antes das 05:00', 'sunrise', 2, 22)
on conflict (codigo) do update set
  titulo = excluded.titulo, descricao = excluded.descricao, icone = excluded.icone,
  estrelas_bonus = excluded.estrelas_bonus, ordem = excluded.ordem;

-- 10. TRIGGER AUTOMÁTICO DE NOVO USUÁRIO
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, fuso_horario, onboarding_concluido)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)),
    'America/Sao_Paulo',
    false
  );

  insert into public.configuracoes (user_id, manutencao_modo, manutencao_valor_centavos)
  values (new.id, 'fixo', 2000);

  insert into public.gamificacao_usuario (user_id, estrelas_totais, fase_atual)
  values (new.id, 0, 1);

  insert into public.caixas (user_id, tipo, nome, saldo_inicial_centavos, cor) values
    (new.id, 'principal'::public.tipo_caixa, 'Caixa do dia', 0, '#FF7A00'),
    (new.id, 'manutencao'::public.tipo_caixa, 'Caixa Manutenção', 0, '#22C55E');

  insert into public.plataformas (user_id, nome, cor, ordem) values
    (new.id, 'Uber', '#FFFFFF', 1),
    (new.id, '99', '#FFC83D', 2),
    (new.id, 'inDrive', '#22C55E', 3),
    (new.id, 'Particular', '#FF7A00', 4),
    (new.id, 'Outros', '#B4B4BB', 5);

  insert into public.categorias (user_id, tipo, nome, icone, natureza, sistema, ordem) values
    (new.id, 'entrada', 'Corridas', 'car', 'operacional', true, 1),
    (new.id, 'entrada', 'Gorjeta', 'coins', 'operacional', true, 2),
    (new.id, 'entrada', 'Bônus / Promoção', 'gift', 'operacional', true, 3),
    (new.id, 'entrada', 'Outras receitas', 'plus-circle', 'operacional', true, 4),
    (new.id, 'saida', 'Combustível', 'fuel', 'operacional', true, 1),
    (new.id, 'saida', 'Alimentação', 'utensils', 'operacional', true, 2),
    (new.id, 'saida', 'Crédito no app', 'smartphone', 'operacional', true, 3),
    (new.id, 'saida', 'Manutenção', 'wrench', 'operacional', true, 4),
    (new.id, 'saida', 'Lavagem', 'droplets', 'operacional', true, 5),
    (new.id, 'saida', 'Pedágio / Estacionamento', 'ticket', 'operacional', true, 6),
    (new.id, 'saida', 'Multa', 'alert-triangle', 'operacional', true, 7),
    (new.id, 'saida', 'Outras despesas', 'more-horizontal', 'operacional', true, 8),
    (new.id, 'saida', 'Retirada pessoal', 'wallet', 'retirada_pessoal', true, 9);

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ===== RPC: Avaliar Conquistas (RN-21, Anexo C) =====
create or replace function public.rpc_avaliar_conquistas()
returns table (
  o_codigo text,
  o_titulo text,
  o_descricao text,
  o_icone text,
  o_estrelas_bonus integer
) language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_dias_count integer;
  v_dias_fechados integer;
  v_entradas_count integer;
  v_corridas_total integer;
  v_saldo_reserva bigint;
  v_meta_reserva bigint;
  v_tem_bronze boolean;
  v_tem_ouro boolean;
  v_tem_dia_500 boolean;
  v_tem_prioridade_paga boolean;
  v_tem_madrugador boolean;
  v_seq integer;
  c record;
begin
  if v_user is null then return; end if;

  select count(*), count(*) filter (where status = 'fechado')
  into v_dias_count, v_dias_fechados
  from public.dias_trabalho where user_id = v_user;

  select count(*), coalesce(sum(qtd_corridas), 0)
  into v_entradas_count, v_corridas_total
  from public.lancamentos
  where user_id = v_user and tipo = 'entrada' and excluido_em is null;

  select coalesce(saldo_centavos, 0) into v_saldo_reserva
  from public.vw_saldo_caixas
  where user_id = v_user and tipo = 'manutencao';

  select coalesce(meta_saldo_centavos, 150000) into v_meta_reserva
  from public.caixas
  where user_id = v_user and tipo = 'manutencao';

  select exists(select 1 from public.meta_ciclos where user_id = v_user and nivel_maximo in ('bronze', 'prata', 'ouro'))
  into v_tem_bronze;

  select exists(select 1 from public.meta_ciclos where user_id = v_user and nivel_maximo = 'ouro')
  into v_tem_ouro;

  select exists(
    select 1 from public.dias_trabalho
    where user_id = v_user and coalesce((resumo->>'receita_centavos')::bigint, 0) >= 50000
  ) into v_tem_dia_500;

  select exists(select 1 from public.prioridades where user_id = v_user and status = 'pago')
  into v_tem_prioridade_paga;

  select exists(
    select 1 from public.dias_trabalho
    where user_id = v_user and extract(hour from (aberto_em at time zone 'America/Sao_Paulo')) < 5
  ) into v_tem_madrugador;

  select coalesce(sequencia_atual, 0) into v_seq
  from public.gamificacao_usuario where user_id = v_user;

  for c in select * from public.conquistas_catalogo order by ordem loop
    if exists (select 1 from public.conquistas_usuario where user_id = v_user and codigo = c.codigo) then
      continue;
    end if;

    if (c.codigo = 'primeiro_dia' and v_dias_count >= 1) or
       (c.codigo = 'primeira_entrada' and v_entradas_count >= 1) or
       (c.codigo = 'primeiro_fechamento' and v_dias_fechados >= 1) or
       (c.codigo = 'primeira_meta' and v_tem_bronze) or
       (c.codigo = 'primeiro_ouro' and v_tem_ouro) or
       (c.codigo = 'sequencia_3' and v_seq >= 3) or
       (c.codigo = 'sequencia_7' and v_seq >= 7) or
       (c.codigo = 'sequencia_14' and v_seq >= 14) or
       (c.codigo = 'sequencia_30' and v_seq >= 30) or
       (c.codigo = 'reserva_100' and v_saldo_reserva >= 10000) or
       (c.codigo = 'reserva_500' and v_saldo_reserva >= 50000) or
       (c.codigo = 'reserva_1000' and v_saldo_reserva >= 100000) or
       (c.codigo = 'reserva_meta' and v_saldo_reserva >= v_meta_reserva) or
       (c.codigo = 'dia_500' and v_tem_dia_500) or
       (c.codigo = 'corridas_100' and v_corridas_total >= 100) or
       (c.codigo = 'corridas_1000' and v_corridas_total >= 1000) or
       (c.codigo = 'primeira_conta_paga' and v_tem_prioridade_paga) or
       (c.codigo = 'madrugador' and v_tem_madrugador)
    then
      insert into public.conquistas_usuario (user_id, codigo)
      values (v_user, c.codigo)
      on conflict (user_id, codigo) do nothing;

      update public.gamificacao_usuario g
      set
        estrelas_totais = g.estrelas_totais + c.estrelas_bonus,
        fase_atual = coalesce(
          (select max(numero) from public.fases where estrelas_minimas <= g.estrelas_totais + c.estrelas_bonus),
          1
        ),
        atualizado_em = now()
      where g.user_id = v_user;

      o_codigo := c.codigo;
      o_titulo := c.titulo;
      o_descricao := c.descricao;
      o_icone := c.icone;
      o_estrelas_bonus := c.estrelas_bonus;
      return next;
    end if;
  end loop;
end $$;

