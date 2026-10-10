# FASE 3 de 6 — Núcleo do caixa (abrir o dia, lançamentos e extrato)

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_3_NUCLEO_DO_CAIXA.md.
> Execute a Fase 3 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Entregar o **coração do app**: o motorista **abre o dia (bater ponto)**, vê o **caixa atual**, **lança entradas e saídas em até 3 toques**, edita/exclui com desfazer e consulta o **extrato**.

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: **6.1** (RN-01 a 03), **6.2** (RN-04 a 07, 09, 10, 15), **6.3** (RN-16), **7.3** (RF-DIA-01 a 04), **7.4** (exceto RF-LAN-04, 09, 12, 13), **7.5** (RF-CAI-01 a 03), **8.2**, **8.3**, **8.6**, **9.7**, **11.1** e **11.2**, **13.2** e **13.3**, **Anexo B**.

## 3. O que existirá no final
- **Início** com dois modos: sem dia aberto (cartão "Bater ponto — Abrir dia") e com dia aberto (Caixa Atual, tempo aberto, cartões de receita/despesas/lucro, últimos lançamentos).
- **Abrir dia:** saldo acumulado do dia anterior, opção "Ajustar valor", km inicial, animação de ponto batido.
- **Entrada rápida** e **Saída rápida** (teclado numérico próprio, chips, "mais detalhes").
- **Lista do dia** com editar, excluir e **desfazer por 6 s**.
- Aviso de **caixa negativo** e de **dia fechado**; banner de **dia esquecido aberto**.
- Tela **Caixa** (extrato por dia, seletor Principal/Manutenção, saldo).
- Menu **"+"** com Entrada e Saída.

## 4. Entrevista inicial

**Rodada 1 — Sua rotina**
1. **Como você prefere lançar?** A) Corrida a corrida durante o dia  B) Só o total no fim do dia  C) ★ Os dois, conforme o dia. *(Define o que fica em destaque na tela.)*
2. **Você trabalha de madrugada** (o dia vira depois da meia-noite)? A) ★ Às vezes  B) Sempre  C) Nunca. *(O app já suporta; quero saber o quanto testar.)*
3. **Quais plataformas aparecem primeiro** nos botões de lançamento, e em que ordem? (A última usada fica pré-selecionada ★)
4. **Valores rápidos** nos botões. A) ★ R$ 5, 10, 20, 50, 100  B) Outros valores (quais?)

**Rodada 2 — Tela e detalhes**
5. **No topo do Início, o número maior deve ser:** A) ★ Caixa atual  B) Lucro do dia  C) Receita do dia
6. **Km ao abrir o dia:** A) ★ Perguntar (opcional, dá para pular)  B) Não perguntar  C) Só se eu cadastrar o carro
7. **Aviso quando o caixa ficar negativo:** A) ★ Sim, aviso discreto  B) Não avisar
8. **Quer "repetir último lançamento" e modelos prontos** (ex.: "Almoço R$ 25")? A) ★ Repetir último agora, modelos depois  B) Os dois agora  C) Nenhum
9. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo das decisões → `docs/DECISOES.md` → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Camada de dados** (`features/dia`, `lancamentos`, `caixa`): hooks com TanStack Query usando `vw_saldo_caixas`, `vw_resumo_dia`, `rpc_abrir_dia` e `insert/update` em `lancamentos` (UUID gerado no cliente, atualização otimista). Chaves de cache do PRD 11.2.
2. **Início sem dia aberto:** cartão com saldo acumulado + botão **"⏱ Bater ponto — Abrir dia"**.
3. **Sheet de abertura:** saldo anterior, "Ajustar valor" (gera ajuste), km inicial conforme pergunta 6, animação de ponto batido, tratamento de erros (`DIA_ABERTO_EXISTENTE`, `DIA_JA_EXISTE_NESTA_DATA`).
4. **Início com dia aberto:** Caixa Atual com contador animado (`aria-live`), tempo aberto, cartões Receita/Despesas/Lucro/Reserva (RN-16), últimos lançamentos. Reserva aparece zerada até a Fase 4.
5. **Entrada rápida:** valor, chips de plataforma, stepper de corridas, valores rápidos, "mais detalhes" recolhido, botão Salvar, animação "+R$". Meta: **≤ 3 toques**.
6. **Saída rápida:** valor, grade de categorias com ícones, caixa de origem (Principal/Manutenção), observação. Saída da Manutenção **limitada ao saldo da reserva** com opção de **dividir** com o caixa principal (RN-09).
7. **Lista do dia:** deslizar para editar/excluir, **desfazer por 6 s**, ordenada do mais recente.
8. **Regras e avisos:** bloqueio em dia fechado (mensagem `DIA_FECHADO`; o atalho "Reabrir dia" leva à ação que existirá na Fase 4), alerta de caixa negativo, **banner de dia esquecido** (RN-06; o botão "Fechar agora" leva à rota `/dia/fechar`, implementada na Fase 4).
9. **Tela Caixa:** saldo, extrato agrupado por dia, seletor de caixa, filtros básicos por período e tipo.
10. **Menu "+"** no centro da barra inferior (Entrada, Saída). *O item "Lote por plataforma" entra na Fase 4.*
11. **Testes:** unitários e de componente (MoneyInput/NumericKeypad nos fluxos de lançamento); instalar **Playwright** e criar o E2E "abrir dia → 2 entradas → 1 saída → editar → excluir → desfazer", em tela de 390×844.
12. **Documentos:** atualizar `PROGRESSO.md` e `DECISOES.md`.

## 6. Testes obrigatórios
- PRD 13.2 (casos 1 a 5) e 13.3 (casos 6 a 10) confirmados também pela interface.
- Lançamento após a meia-noite herda a data do dia aberto (caso 9).
- Saldo do Início, da tela Caixa e das views do banco **sempre iguais**.
- E2E descrito na tarefa 11.

## 7. Roteiro de teste prático para o dono
1. Entre no app: aparece **"Bater ponto — Abrir dia"** com o saldo que você informou no onboarding.
2. **Abra o dia.** Confira a animação e o horário.
3. Lance **3 entradas** em plataformas diferentes e **2 saídas** (combustível e alimentação). Conte os toques: no máximo 3 por lançamento.
4. Confira o **Caixa Atual** depois de cada lançamento.
5. **Edite** um valor, **exclua** outro e use **Desfazer**.
6. Lance uma saída maior que o caixa: deve aparecer o **aviso de negativo**.
7. Abra a tela **Caixa** e confira o extrato. Tente abrir outro dia: o app deve avisar que já existe um aberto.

## 8. Entrevista final e aprovação
Pergunte: *"Lançar ficou rápido? Algum botão pequeno, confuso ou fora do lugar? O Início mostra o que você mais quer ver?"* Ajuste e use o **modelo de aprovação** para pedir o SIM para a **Fase 4**.

## 9. Fora do escopo desta fase
Fechar o dia, depósito de manutenção, lote por plataforma, prioridades, metas, medalhas, relatórios.

## 10. Definição de pronto
- [ ] Abrir dia e lançar entradas/saídas funcionando com dados reais no Supabase.
- [ ] Lançar em ≤ 3 toques; responde visualmente em < 100 ms.
- [ ] Estados de carregando, vazio e erro tratados; 360 px sem quebra.
- [ ] Testes (unitários, componente, E2E) passando.
- [ ] `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-3-aprovada` após o SIM.
