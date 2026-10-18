-- Migração 0104: Estrutura de partes, colunas auxiliares e constraints
-- 100% aditiva, segura e retrocompatível com todo o histórico

alter table public.lancamentos
  add column if not exists local_id uuid references public.locais_dinheiro(id),
  add column if not exists lancamento_pai_id uuid references public.lancamentos(id),
  add column if not exists modo_partes boolean not null default false,
  add column if not exists taxa_origem text not null default 'nenhuma';

-- Adicionar constraint de taxa_origem de forma idempotente
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ck_lanc_taxa_origem'
  ) then
    alter table public.lancamentos
      add constraint ck_lanc_taxa_origem check (taxa_origem in ('nenhuma', 'informada', 'estimada', 'zero_pacote'));
  end if;
end $$;

-- Atualizar valores permitidos em "origem"
alter table public.lancamentos drop constraint if exists lancamentos_origem_check;
alter table public.lancamentos drop constraint if exists ck_lanc_origem;
alter table public.lancamentos add constraint ck_lanc_origem check (origem in
  ('manual', 'resumo_dia', 'deposito_manutencao', 'ajuste_abertura', 'conferencia', 'prioridade', 'transferencia', 'sistema',
   'taxa_plataforma', 'taxa_meio', 'pacote_taxa_zero', 'devolucao_taxa'));

create index if not exists ix_lanc_local on public.lancamentos (local_id) where local_id is not null;
create index if not exists ix_lanc_pai on public.lancamentos (lancamento_pai_id) where lancamento_pai_id is not null;

-- Tabela de partes de lançamento (divisão de corrida por múltiplos locais/meios)
create table if not exists public.lancamento_partes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lancamento_id uuid not null references public.lancamentos(id) on delete cascade,
  local_id uuid not null references public.locais_dinheiro(id),
  meio text not null check (meio in ('dinheiro', 'pix', 'debito', 'credito', 'app', 'cupom')),
  valor_centavos bigint not null check (valor_centavos > 0 and valor_centavos <= 100000000),
  legado boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (lancamento_id, local_id, meio)
);

create index if not exists ix_partes_user on public.lancamento_partes (user_id);
create index if not exists ix_partes_lanc on public.lancamento_partes (lancamento_id);
create index if not exists ix_partes_local on public.lancamento_partes (local_id);

alter table public.lancamento_partes enable row level security;
drop policy if exists partes_sel on public.lancamento_partes;
create policy partes_sel on public.lancamento_partes for select using (user_id = auth.uid());

drop policy if exists partes_ins on public.lancamento_partes;
create policy partes_ins on public.lancamento_partes for insert with check (user_id = auth.uid());

drop policy if exists partes_upd on public.lancamento_partes;
create policy partes_upd on public.lancamento_partes for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists partes_del on public.lancamento_partes;
create policy partes_del on public.lancamento_partes for delete using (user_id = auth.uid());

-- Trigger para validar no COMMIT que a soma das partes fecha com o valor total
create or replace function public.fn_checa_soma_partes()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
  v_valor bigint;
  v_modo boolean;
  v_soma bigint;
begin
  v_id := case tg_table_name
            when 'lancamentos' then coalesce(new.id, old.id)
            else coalesce(new.lancamento_id, old.lancamento_id)
          end;

  select valor_centavos, modo_partes into v_valor, v_modo
  from public.lancamentos
  where id = v_id and excluido_em is null;

  if not found or v_modo is not true then
    return null;
  end if;

  select coalesce(sum(valor_centavos), 0) into v_soma
  from public.lancamento_partes
  where lancamento_id = v_id;

  if v_soma <> v_valor then
    raise exception 'PARTES_NAO_FECHAM' using detail = format('lancamento %s valor %s partes %s', v_id, v_valor, v_soma);
  end if;

  return null;
end $$;

drop trigger if exists trg_partes_soma on public.lancamento_partes;
create constraint trigger trg_partes_soma
  after insert or update or delete on public.lancamento_partes
  deferrable initially deferred
  for each row execute function public.fn_checa_soma_partes();

drop trigger if exists trg_lanc_soma on public.lancamentos;
create constraint trigger trg_lanc_soma
  after insert or update of valor_centavos, modo_partes on public.lancamentos
  deferrable initially deferred
  for each row execute function public.fn_checa_soma_partes();
