-- =====================================================================
-- META DRIVER — SCRIPT DE RESET DE DADOS DE TESTES (SUPABASE)
-- Execute este script no SQL Editor do Supabase antes de ir para produção.
-- =====================================================================

-- ---------------------------------------------------------------------
-- OPÇÃO 1: RESET OPERACIONAL (Limpa dados de testes e mantém os usuários)
-- Reseta lançamentos, dias trabalhados, prioridades, metas, veículos de teste,
-- zera os saldos dos caixas e reinicia a gamificação e onboarding.
-- ---------------------------------------------------------------------

DO $$
BEGIN
  -- 1. Limpar lançamentos financeiros e transferências de testes
  DELETE FROM public.lancamentos;
  DELETE FROM public.transferencias;
  
  -- 2. Limpar dias de trabalho e turnos
  DELETE FROM public.dias_trabalho;
  
  -- 3. Limpar contas a pagar (prioridades) cadastradas em testes
  DELETE FROM public.prioridades;
  
  -- 4. Limpar metas e ciclos de metas de testes
  DELETE FROM public.meta_ciclos;
  DELETE FROM public.metas;
  
  -- 5. Limpar veículos de teste cadastrados
  DELETE FROM public.veiculos;
  
  -- 6. Limpar conquistas desbloqueadas durante testes
  DELETE FROM public.conquistas_usuario;
  
  -- 7. Limpar mensagens de suporte de teste
  DELETE FROM public.suporte_mensagens;
  
  -- 8. Limpar histórico de auditoria de testes
  DELETE FROM public.auditoria;

  -- 9. Zerar saldos iniciais dos caixas (Principal, Manutenção, etc.)
  UPDATE public.caixas
  SET
    saldo_inicial_centavos = 0,
    meta_saldo_centavos = NULL;

  -- 10. Resetar gamificação para nível inicial (Fase 1, 0 estrelas)
  UPDATE public.gamificacao_usuario
  SET
    estrelas_totais = 0,
    fase_atual = 1,
    sequencia_atual = 0,
    maior_sequencia = 0,
    atualizado_em = now();

  -- 11. Resetar status de onboarding dos perfis para permitir novo fluxo inicial limpo
  UPDATE public.profiles
  SET
    onboarding_concluido = false,
    atualizado_em = now();

  RAISE NOTICE 'Dados operacionais e pessoais de teste resetados com sucesso! O banco está pronto para produção.';
END $$;

-- ---------------------------------------------------------------------
-- OPÇÃO 2: RESET TOTAL DE USUÁRIOS (Opcional - caso queira apagar contas de teste)
-- Se você preferir excluir completamente as contas de email criadas nos testes,
-- descomente as 2 linhas abaixo e execute no SQL Editor:
-- ---------------------------------------------------------------------
-- DELETE FROM public.profiles;
-- DELETE FROM auth.users;
