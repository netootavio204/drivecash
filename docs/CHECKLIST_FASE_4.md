# Checklist da Fase 4 — Fechamento do Dia, Caixa Manutenção e Prioridades

## 1. Entrevistas e Decisões
- [x] Rodada 1: Fechamento do dia (conferência, lote por plataforma, km final, observações)
- [x] Rodada 2: Caixa Manutenção (depósito, pular, meta de reserva, divisão de custos)
- [x] Rodada 3: Prioridades financeiras (contas reais, recorrência, importância)
- [x] Registrar decisões no `docs/DECISOES.md`

## 2. Fechamento do Dia (Stepper de 4 passos)
- [x] Passo 1: Resumo do dia e Lançamentos em lote por plataforma
- [x] Passo 2: Conferência de dinheiro em mãos e km final (sobra/falta com textos do Anexo B)
- [x] Passo 3: Depósito na Reserva de Manutenção (sugestão configurada, editar, pular)
- [x] Passo 4: Confirmação e Tela "Dia Fechado!" com números finais
- [x] Integração com `rpc_fechar_dia`
- [x] Ação de Reabrir Último Dia (`rpc_reabrir_dia`)

## 3. Gestão da Reserva de Manutenção
- [x] Tela/Visão de Caixa Manutenção com saldo atual
- [x] Barra de progresso para a meta de manutenção com projeção
- [x] Histórico de depósitos e resgates
- [x] Ação "Gastar da Reserva" (com divisão caso saldo seja insuficiente)
- [x] Configuração do depósito diário (fixo, percentual, desativado)

## 4. Gestão de Prioridades (Contas e Obrigações)
- [x] CRUD de Prioridades (nome, valor, vencimento, nível de importância, recorrência)
- [x] Ordenação inteligente (vencidas primeiro com badge ⚠️, depois por data)
- [x] Card "Próximas Contas" na tela de Início (3 próximas)
- [x] Ação "Pagar Conta" com integração atômica via `rpc_pagar_prioridade`
- [x] Suporte a próxima ocorrência para contas recorrentes

## 5. Validação, Qualidade e E2E
- [x] Teste E2E do Anexo A do PRD
- [x] Testes unitários com Vitest (24 testes passando)
- [x] `npm run typecheck` (0 erros)
- [x] `npm run lint` (0 erros)
- [x] `npm run build` (sucesso em 831ms)
- [x] Atualização de `docs/PROGRESSO.md` e commit da branch
