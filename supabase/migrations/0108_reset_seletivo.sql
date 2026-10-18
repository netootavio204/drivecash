-- Migração 0108: RPC de Reset Seletivo com confirmação de segurança
-- Permite ao motorista limpar lançamentos antigos de teste de forma seletiva para recomeçar com datas retroativas limpas

create or replace function public.rpc_reset_seletivo(
  p_opcoes jsonb,
  p_palavra_seguranca text
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_resumo jsonb := '{}'::jsonb;
  v_qtd integer;
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  if upper(trim(p_palavra_seguranca)) <> 'ZERAR' then
    raise exception 'PALAVRA_SEGURANCA_INVALIDA';
  end if;

  -- 1. Reset de Entradas / Corridas
  if (p_opcoes->>'entradas')::boolean is true then
    update public.lancamentos
    set excluido_em = now()
    where user_id = v_user and tipo in ('entrada', 'ajuste_entrada') and excluido_em is null;
    get diagnostics v_qtd = row_count;
    v_resumo := jsonb_set(v_resumo, '{entradas_removidas}', to_jsonb(v_qtd));
  end if;

  -- 2. Reset de Saídas / Despesas
  if (p_opcoes->>'saidas')::boolean is true then
    update public.lancamentos
    set excluido_em = now()
    where user_id = v_user and tipo in ('saida', 'ajuste_saida') and excluido_em is null;
    get diagnostics v_qtd = row_count;
    v_resumo := jsonb_set(v_resumo, '{saidas_removidas}', to_jsonb(v_qtd));
  end if;

  -- 3. Reset de Transferências entre locais
  if (p_opcoes->>'transferencias')::boolean is true then
    update public.locais_transferencias
    set excluido_em = now()
    where user_id = v_user and excluido_em is null;
    get diagnostics v_qtd = row_count;
    v_resumo := jsonb_set(v_resumo, '{transferencias_removidas}', to_jsonb(v_qtd));
  end if;

  -- 4. Reset de Intervalos / Pausas
  if (p_opcoes->>'pausas')::boolean is true then
    delete from public.pausas
    where user_id = v_user;
    get diagnostics v_qtd = row_count;
    v_resumo := jsonb_set(v_resumo, '{pausas_removidas}', to_jsonb(v_qtd));
  end if;

  return v_resumo;
end $$;
