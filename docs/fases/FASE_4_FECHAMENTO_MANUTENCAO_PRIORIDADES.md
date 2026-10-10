# FASE 4 de 6 — Fechamento do dia, Caixa Manutenção e Prioridades

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_4_FECHAMENTO_MANUTENCAO_PRIORIDADES.md.
> Execute a Fase 4 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Permitir **fechar o dia** com resumo, conferência do dinheiro e **depósito na reserva de manutenção**; entregar a tela do **Caixa Manutenção** e as **Prioridades** (contas em ordem de importância).

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: **6.2** (RN-08, 10 a 14), **6.3** (RN-16), **6.5** (RN-24; RN-25 fica para a Fase 5), **7.3** (RF-DIA-05 a 09), **7.4** (RF-LAN-04), **7.6**, **7.9**, **8.4**, **10.4** (`rpc_fechar_dia`, `rpc_reabrir_dia`, `rpc_transferir`), **13.3** (casos 11 a 13), **Anexo A** e **Anexo B**.

## 3. O que existirá no final
- **Fechar o dia** em 4 passos: Resumo → Lote por plataforma → Conferência e km → Manutenção e confirmação.
- **Tela final** "Dia fechado!" com receita, despesas, lucro, reserva, sobra livre e caixa final.
- **Reabrir o último dia** fechado.
- **Lote por plataforma** (também pelo menu "+").
- **Caixa Manutenção:** saldo, histórico, configuração do depósito (fixo/percentual/desativado), meta de reserva com barra de progresso, gastar da reserva.
- **Prioridades:** cadastrar, ordenar, destacar vencidas, **marcar como paga** (cria a saída), recorrência, cartão "Próximas contas" no Início.
- Função de banco `rpc_pagar_prioridade` criada e testada.

## 4. Entrevista inicial

**Rodada 1 — Fechamento do dia**
1. **Conferir o dinheiro em mãos ao fechar:** A) ★ Opcional (posso pular)  B) Sempre obrigatório
2. **Lote por plataforma** (informar o total de cada app no fim do dia): se já lancei corridas individuais, o app deve: A) ★ Perguntar "somar ou substituir"  B) Sempre somar  C) Sempre substituir
3. **Perguntar km final e horas online ao fechar?** A) ★ Sim, opcional  B) Só km  C) Não perguntar
4. **Campo de observações do dia?** A) ★ Sim, opcional  B) Não

**Rodada 2 — Caixa Manutenção**
5. **Depósito diário:** confirme o que você quer. A) ★ Valor fixo — quanto? (sugestão: R$ 20)  B) Porcentagem do lucro — quantos %?  C) Desativado por enquanto
6. **Se num dia você não quiser guardar:** A) ★ Posso pular sem consequência  B) O app acumula "reposição" (fica para depois)
7. **Meta de reserva:** quanto você quer juntar para manutenção? (ex.: R$ 1.500) ou prefere sem meta?
8. **Quando pagar mecânico/peças:** A) ★ Sai da reserva (e se faltar, divide com o caixa principal)  B) Sempre do caixa principal

**Rodada 3 — Suas contas (Prioridades)**
9. **Liste de 3 a 5 contas reais** que você tem (ex.: parcela do carro, seguro, IPVA, internet, celular) com **valor aproximado e dia de vencimento**. *Vou cadastrá-las como dados de teste.*
10. **Recorrência:** quais se repetem? A) Mensal  B) Anual  C) Semanal  D) Diária (só se você escolheu essa opção na Fase 2)
11. **Nível de importância:** A) ★ Alta/Média/Baixa como no PRD  B) Outro formato (descreva)
12. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo das decisões → `docs/DECISOES.md` → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Fechar o dia (stepper de 4 passos)** conforme PRD 8.4 e RN-12, chamando `rpc_fechar_dia`. Ordem real: **conferência primeiro, depois o depósito** (como na função do banco). Barra de progresso e botão voltar.
2. **Lote por plataforma:** tela/sheet com valor e nº de corridas por plataforma, gerando lançamentos com origem `resumo_dia`; regra somar/substituir conforme pergunta 2; item no menu "+".
3. **Conferência:** mostra calculado × informado × diferença (**sobra/falta**) com textos do Anexo B.
4. **Sugestão de depósito** (RN-11): valor sugerido pelo modo configurado, limitado ao saldo disponível; editar, confirmar ou **"Pular hoje"**.
5. **Tela final do fechamento:** números do dia, caixa final e aviso "Amanhã você começa com R$ X". *(Celebrações de metas entram na Fase 5; deixe o ponto de encaixe pronto.)*
6. **Reabrir último dia** (RF-DIA-09) com confirmação e tratamento de `APENAS_ULTIMO_DIA` e `DIA_ABERTO_EXISTENTE`. Conectar o atalho "Reabrir dia" e o banner "dia esquecido" da Fase 3 ao fluxo de fechamento.
7. **Caixa Manutenção:** saldo, histórico paginado, configuração do depósito, **meta de reserva** com barra e projeção (média dos últimos 14 depósitos), botão **"Gastar da reserva"** (saída com divisão automática se exceder).
8. **Prioridades:** CRUD completo, ordenação (vencidas → vencimento → nível), destaque vermelho com ⚠️ nas vencidas, cartão "Próximas contas" (3 itens) no Início.
9. **Banco:** criar e testar `rpc_pagar_prioridade(prioridade_id, caixa_id, categoria_id)`: cria a **saída vinculada**, marca como paga, gera a **próxima ocorrência** se recorrente. Criar a migração `0006` e testes SQL.
10. **Testes:** PRD 13.3 (casos 11 a 13) e o **E2E do Anexo A**: abrir com R$ 150 → entradas Uber 220 (8), 99 130 (5), Particular 50 (1) → saídas 90, 25, 30 → conferência informando R$ 400 (falta de R$ 5) → depósito R$ 20 → **caixa final R$ 380**, **reserva R$ 20**, **lucro R$ 255**, **sobra livre R$ 235**; no dia seguinte a abertura mostra R$ 380.
11. **Documentos:** atualizar `PROGRESSO.md` e `DECISOES.md`.

## 6. Roteiro de teste prático para o dono
1. Com o dia aberto e lançamentos feitos, toque em **"Fechar o dia"** e percorra os 4 passos.
2. No passo de conferência, informe um valor **R$ 5 menor** que o calculado: deve aparecer **"Faltam R$ 5,00"**.
3. Confirme o depósito de manutenção e conclua. Confira a **tela final** e o **Caixa Manutenção** com o valor guardado.
4. Volte ao Início: deve aparecer **"Abrir o dia"** com o saldo de fechamento.
5. Teste **reabrir o último dia**, edite um lançamento e feche de novo.
6. Cadastre suas **contas** em Prioridades, **marque uma como paga** e veja a saída no extrato e o novo vencimento (se recorrente).

## 7. Entrevista final e aprovação
Pergunte: *"O fechamento ficou claro? Os valores batem com o que você esperava? Alguma conta ou tela de reserva que faltou?"* Ajuste e use o **modelo de aprovação** para pedir o SIM para a **Fase 5**.

## 8. Fora do escopo desta fase
Metas, medalhas, confete, conquistas, "meta mínima sugerida" (Fase 5), relatórios, configurações completas.

## 9. Definição de pronto
- [ ] Fechamento **atômico**: nenhum fechamento deixa dados pela metade (testado).
- [ ] Anexo A reproduzido de ponta a ponta na interface e no banco.
- [ ] Reabrir funciona só no último dia; depósito e conferência são estornados e recalculados.
- [ ] Prioridades pagas geram saída vinculada e saldo correto.
- [ ] Testes passando; 360 px sem quebra; `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-4-aprovada` após o SIM.
