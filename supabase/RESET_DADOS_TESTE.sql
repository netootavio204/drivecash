-- Script para Resetar Dados de Testes / Registros Operacionais (Meta Driver)
-- Mantém: Usuários (auth/profiles), Plataformas, Categorias do Sistema e Catálogo de Conquistas/Fases.
-- Limpa: Lançamentos, Dias de Trabalho, Transferências, Ciclos de Metas, Histórico de Auditoria e Mensagens de Suporte.
-- Reseta: Saldos dos Caixas para R$ 0,00 e Gamificação para 0 estrelas / Fase 1.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Se quiser rodar para TODOS os usuários de teste:
  -- Limpa lançamentos e movimentações
  DELETE FROM public.lancamentos;
  DELETE FROM public.transferencias;
  
  -- Limpa dias de trabalho
  DELETE FROM public.dias_trabalho;
  
  -- Limpa ciclos de metas
  DELETE FROM public.meta_ciclos;
  
  -- Limpa conquistas desbloqueadas em testes
  DELETE FROM public.conquistas_usuario;
  
  -- Limpa mensagens de teste de suporte
  DELETE FROM public.suporte_mensagens;
  
  -- Limpa auditoria de testes
  DELETE FROM public.auditoria;

  -- Reseta dados de gamificação dos usuários para o estado inicial
  UPDATE public.gamificacao_usuario
  SET
    estrelas_totais = 0,
    fase_atual = 1,
    sequencia_atual = 0,
    maior_sequencia = 0,
    atualizado_em = now();

  RAISE NOTICE 'Dados operacionais de teste resetados com sucesso!';
END $$;
