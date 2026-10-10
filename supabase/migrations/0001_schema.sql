-- =====================================================================
-- 0001_schema.sql — Criação dos Tipos e Tabelas Base do Meta Driver
-- =====================================================================

create extension if not exists pgcrypto;

-- ===== Tipos Enumerados =====
create type public.tipo_caixa as enum ('principal', 'manutencao', 'personalizado');
create type public.tipo_lancamento as enum (
  'entrada',
  'saida',
  'transferencia_entrada',
  'transferencia_saida',
  'ajuste_entrada',
  'ajuste_saida'
);
create type public.status_dia as enum ('aberto', 'fechado');
create type public.periodo_meta as enum ('diaria', 'semanal', 'mensal', 'anual');
create type public.metrica_meta as enum (
  'receita_bruta',
  'lucro_liquido',
  'corridas',
  'dias_trabalhados',
  'reserva_manutencao',
  'km_rodados',
  'minutos_online'
);
create type public.nivel_medalha as enum ('nenhum', 'bronze', 'prata', 'ouro');

-- ===== Utilitário: atualizado_em =====
create or replace function public.fn_set_atualizado_em() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

-- ===== Perfil e Configurações =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  avatar_url text,
  fuso_horario text not null default 'America/Sao_Paulo',
  onboarding_concluido boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.configuracoes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  inicio_semana smallint not null default 1 check (inicio_semana between 0 and 6), -- 0=dom, 1=seg
  dias_trabalho_semana smallint not null default 6 check (dias_trabalho_semana between 1 and 7),
  dias_folga smallint[] not null default '{}',
  manutencao_modo text not null default 'fixo' check (manutencao_modo in ('fixo','percentual','desativado')),
  manutencao_valor_centavos bigint not null default 2000 check (manutencao_valor_centavos >= 0), -- Padrão R$ 20,00
  manutencao_percentual numeric(5,2) not null default 0 check (manutencao_percentual between 0 and 100),
  efeitos_ativos boolean not null default true,
  som_ativo boolean not null default false,
  vibracao_ativa boolean not null default true,
  lembretes jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- ===== Veículos =====
create table public.veiculos (
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

-- ===== Plataformas =====
create table public.plataformas (
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

-- ===== Categorias =====
create table public.categorias (
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

-- ===== Caixas =====
create table public.caixas (
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
create unique index ux_caixa_unico_sistema on public.caixas (user_id, tipo) where tipo in ('principal','manutencao');

-- ===== Dias de Trabalho =====
create table public.dias_trabalho (
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
create unique index ux_um_dia_aberto on public.dias_trabalho (user_id) where status = 'aberto';
create index ix_dias_user_data on public.dias_trabalho (user_id, data_referencia desc);

-- ===== Transferências e Prioridades =====
create table public.transferencias (
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

create table public.prioridades (
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
create index ix_prioridades_user on public.prioridades (user_id, status, vencimento);

-- ===== Lançamentos Financeiros =====
create table public.lancamentos (
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
create index ix_lanc_user_data on public.lancamentos (user_id, data_referencia) where excluido_em is null;
create index ix_lanc_caixa on public.lancamentos (caixa_id) where excluido_em is null;
create index ix_lanc_dia on public.lancamentos (dia_id);

-- ===== Metas e Gamificação =====
create table public.metas (
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
create index ix_metas_user on public.metas (user_id, ativa);

create table public.meta_ciclos (
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
create index ix_ciclos_user on public.meta_ciclos (user_id, periodo_inicio desc);

create table public.fases (
  numero smallint primary key,
  nome text not null,
  estrelas_minimas integer not null,
  cor text
);

create table public.conquistas_catalogo (
  codigo text primary key,
  titulo text not null,
  descricao text not null,
  icone text,
  estrelas_bonus integer not null default 0,
  ordem smallint not null default 0
);

create table public.conquistas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  codigo text not null references public.conquistas_catalogo(codigo),
  desbloqueada_em timestamptz not null default now(),
  contexto jsonb,
  unique (user_id, codigo)
);

create table public.gamificacao_usuario (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  estrelas_totais integer not null default 0,
  fase_atual smallint not null default 1 references public.fases(numero),
  sequencia_atual integer not null default 0,
  maior_sequencia integer not null default 0,
  atualizado_em timestamptz not null default now()
);

-- ===== Auditoria =====
create table public.auditoria (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  tabela text not null,
  registro_id uuid,
  acao text not null,
  antes jsonb,
  depois jsonb,
  criado_em timestamptz not null default now()
);

-- ===== Triggers de Atualizado_em =====
create trigger trg_profiles_upd before update on public.profiles for each row execute function public.fn_set_atualizado_em();
create trigger trg_config_upd before update on public.configuracoes for each row execute function public.fn_set_atualizado_em();
create trigger trg_veiculos_upd before update on public.veiculos for each row execute function public.fn_set_atualizado_em();
create trigger trg_lanc_upd before update on public.lancamentos for each row execute function public.fn_set_atualizado_em();
create trigger trg_dias_upd before update on public.dias_trabalho for each row execute function public.fn_set_atualizado_em();
create trigger trg_metas_upd before update on public.metas for each row execute function public.fn_set_atualizado_em();
create trigger trg_prior_upd before update on public.prioridades for each row execute function public.fn_set_atualizado_em();

-- ===== Integridade de Lançamentos =====
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

create trigger trg_lanc_regras before insert or update on public.lancamentos
for each row execute function public.fn_lancamento_regras();
