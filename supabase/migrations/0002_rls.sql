-- =====================================================================
-- 0002_rls.sql — Políticas de Segurança RLS (Row Level Security)
-- =====================================================================

-- Perfil: apenas o próprio usuário pode visualizar, criar e atualizar
alter table public.profiles enable row level security;
create policy profiles_sel on public.profiles for select using (id = auth.uid());
create policy profiles_ins on public.profiles for insert with check (id = auth.uid());
create policy profiles_upd on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Configurações e gamificação: select + insert + update (sem delete direto)
do $$
declare
  t text;
begin
  foreach t in array array['configuracoes','gamificacao_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

-- Cadastros do usuário: CRUD completo (select, insert, update, delete)
do $$
declare
  t text;
begin
  foreach t in array array['veiculos','plataformas','categorias','prioridades','metas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
    execute format('create policy %I on public.%I for delete using (user_id = auth.uid())', t||'_del', t);
  end loop;
end $$;

-- Dados financeiros e ciclos: sem DELETE direto do cliente (somente soft delete ou via RPC)
do $$
declare
  t text;
begin
  foreach t in array array['caixas','dias_trabalho','lancamentos','transferencias','meta_ciclos','conquistas_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

-- Auditoria: usuário logado só lê suas próprias ações
alter table public.auditoria enable row level security;
create policy auditoria_sel on public.auditoria for select using (user_id = auth.uid());

-- Catálogos globais: somente leitura para usuários autenticados
alter table public.fases enable row level security;
alter table public.conquistas_catalogo enable row level security;
create policy fases_sel on public.fases for select to authenticated using (true);
create policy conquistas_cat_sel on public.conquistas_catalogo for select to authenticated using (true);
