# FASE V2.4 de 6 — Corrida única com pagamento em partes (e fim da corrida dobrada)

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_4_CORRIDA_UNICA_COM_PARTES.md.
> Execute a Fase V2.4 seguindo o ciclo das regras. Esta fase mexe no núcleo financeiro: backup do dia, ambiente de testes primeiro e nenhum reparo de dados sem simulação e aprovação.
> ```

## 1. Objetivo
Garantir que **uma corrida seja sempre uma corrida**: ao dividir o valor entre **bolso, Pix e cartão**, o **restante fica no app** e o sistema registra **1 lançamento (`qtd_corridas = 1`)** com **partes**. Corrigir o **BUG-02** daqui para frente e **reparar o histórico** das corridas já contadas em dobro (com aprovação).

## 2. O que ler (contexto mínimo)
`PRD_ATUALIZACAO_V2.md`: **4.2**, **5.1**, **6.5**, **6.9** (RF-V2-MIG-04 a 06), **7.2**, **8.4**, **8.5**, **8.6**, **8.8**, **9**, **12.3** (casos 6 a 8, 12, 14, 22 a 25), **Anexo A** (A.1 a A.3), **Anexo B**. `RELATORIO...` **seções 3, 4 e 8**. `AUDITORIA_V2.md` (como a divisão foi feita e a lista de candidatos).

## 3. O que existirá no final
- **Tela "Como você recebeu?"** (valor, Taxa99 opcional, partes Bolso/Pix→banco/Cartão→banco; **restante → App 99** como **Pago no app** ou **Cupom 99**).
- **RPC `rpc_lancar_corrida`** (e `rpc_substituir_corrida`, `rpc_excluir_corrida`): **1 lançamento + partes + taxas filhas, numa transação**, idempotente.
- **Atalhos** de 1 toque (**Tudo no app**, **Tudo dinheiro**, **Dinheiro + app**, **Pix + app**, **Repetir última divisão**) e **lançamento rápido de 3 toques** preservado.
- **Lista do dia** mostrando a corrida **uma vez**, com resumo das partes.
- **Contagem de corridas** correta em Início, metas, relatórios e fechamento.
- **Reparo do histórico** (opção **A** fundir ou **B** zerar contagem das extras) com simulação, backup e desfazer.
- Migrações `0105` (categorias v2) e `0106` (RPCs). Chave **`partes`**.

## 4. Entrevista inicial

**Rodada 1 — Como você lança hoje**
1. **Como é a divisão que você faz hoje?** (explique com um exemplo real) E **como você gostaria que fosse** na tela?
2. **Lançamento rápido (3 toques):** o padrão deve ser A) ★ **Tudo no app** (pago no app)  B) **Tudo em dinheiro**  C) **Repetir o último**
3. **O restante no app** costuma ser: A) ★ **Pago no app** (cartão/Pix/99Pay)  B) **Cupom**  C) Varia (perguntar sempre). *(Em qualquer caso, 1 toque troca.)*
4. **Taxa99 na tela de corrida:** A) ★ Campo opcional "Taxa99 (do recibo)" ou "Você recebe"  B) Só estimar  C) Não mostrar agora

**Rodada 2 — Bancos e meios**
5. **Pix direto:** qual banco recebe **na maioria das vezes**? A) ★ Inter  B) Mercado Pago  C) Santander  D) Outro
6. **Cartão na maquininha:** qual **maquininha/banco** você usa e **débito ou crédito** na maioria? *(As taxas ficam para a próxima fase.)*
7. **Gorjetas, bônus e devoluções de taxa** (entradas que **não são corrida**): A) ★ Usam a mesma tela, com **corridas = 0**  B) Tela simples separada
8. **Lote do dia (resumo por plataforma):** o total de cada plataforma deve entrar por padrão: A) ★ **No app**  B) **No bolso**  C) Perguntar (com divisão)

**Rodada 3 — Histórico (corridas divididas)**
9. O agente vai mostrar a lista de **corridas que parecem ter sido divididas em mais de um lançamento**. **Como prefere reparar?** A) ★ **B — manter as linhas e zerar a contagem das extras** (mais seguro)  B) **A — fundir em uma corrida só com partes** (mais limpo)  C) **Não reparar o histórico**, só corrigir daqui para frente
10. **Casos duvidosos:** revisar **um a um** comigo? A) ★ Sim  B) Aplicar só nos óbvios
11. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` (**D-V2-07, D-V2-08**) → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Checklist de segurança** (REGRAS, seção 4); branch `v2-fase-4-partes`; **backup de produção de hoje**.
2. **Testes que falham primeiro:** casos **6 a 8** (dividir R$ 30 em bolso 8 + Pix 7 + cartão 5 + app 10 → **1 lançamento**, **`corridas = 1`**; soma ≠ valor → erro; 100% dinheiro sem parte no app).
3. **Migrações no ambiente de testes primeiro:** `0105` (função de categorias v2: **Taxa 99, Taxa de maquininha, Pacote Taxa 99, Taxa de saque, Devolução de taxa 99, Taxa de cancelamento recebida**) e `0106` (**`rpc_lancar_corrida`**). Adaptar ao banco real. **Parametrizar `p_qtd_corridas` (0 ou 1)** para gorjeta/bônus. Criar `rpc_substituir_corrida` e `rpc_excluir_corrida` (exclui **corrida + partes + filhos**, com desfazer).
4. **Aplicar em produção** (chave `partes` **desligada**); conferir **8.9 vazio**.
5. **Tela "Como você recebeu?"** (PRD 7.2): validação em tempo real (soma, restante, erro ao exceder), **atalhos**, seletor **Pago no app / Cupom 99**, **ganho líquido estimado** na tela, botão **Salvar** só habilitado quando válido. Manter o **lançamento rápido de 3 toques**.
6. **Lista do dia e extrato:** mostrar a corrida **uma vez** com ícones das partes; expandir para ver partes e taxas; **editar/excluir** com **desfazer**.
7. **Contagem:** conferir Início, metas por corrida, ticket médio, relatórios e fechamento usando **corridas reais** (`qtd_corridas` de **entradas**; filhos = 0).
8. **Lote do dia e outras entradas** gerando partes conforme respostas 7 e 8 (**sem regressão** no lote).
9. **Saldos por local:** conferir **Anexo A (A.1)**: Bolso **+8,00** · Inter **+7,00** · MP **+5,00** (sem taxa nesta fase) · App **+10,00**; e a **conciliação**.
10. **Reparo do histórico (somente se a pergunta 9 for A ou B):**
    - **Simulação:** usar a consulta **8.8 (1)**; mostrar ao dono, em tabela simples, cada grupo (dia, plataforma, pedaços, total, corridas hoje × corridas após reparo).
    - **Aprovação** (casos duvidosos **um a um**).
    - **Backup** das linhas afetadas (`lancamentos_pre_v2`), **`auditoria`**, **transação**, **script de desfazer testado**. Respeitar a proteção de **dias fechados** (função de reparo própria; REGRAS 6).
    - **Conferir:** receita e caixas **idênticos** (8.9); só **`corridas`** muda nos grupos aprovados.
11. **Testes:** casos 6–8, 12 (parcial), 22, 24; **suíte antiga inteira**; **E2E**: lançar corrida mista → conferir lista, saldos, corridas = 1 → editar → excluir → desfazer.
12. **APK (se existir):** `android:sync`, testar a tela de corrida no celular; `versionCode`.
13. **Prévia → SIM → ligar a chave `partes`** (só para o dono). **Documentos.**

## 6. Roteiro de teste prático para o dono
1. **Lance uma corrida de R$ 30** e divida: **R$ 8 dinheiro, R$ 7 Pix (Inter), R$ 5 cartão (Mercado Pago)**. O restante (**R$ 10**) vai **sozinho** para o **App 99**.
2. Confira: a lista mostra **uma** corrida; o Início mostra **corridas +1** (não +4).
3. Em **Meu dinheiro**: Bolso +8, Inter +7, Mercado Pago +5, App +10.
4. Tente passar do valor (R$ 31 nas partes): o app **não deixa salvar** e explica.
5. **Edite** e **exclua** a corrida (e use **Desfazer**).
6. Veja a **lista de corridas antigas divididas** e aprove o reparo; confira que **o dinheiro total não mudou**, só a **contagem de corridas**.

## 7. Entrevista final e aprovação
Pergunte: *"Dividir ficou do jeito que você queria? A corrida agora conta uma vez só? O reparo do histórico ficou certo?"* Ajuste e use o **modelo de aprovação** para o SIM da **V2.5**.

## 8. Fora do escopo desta fase
Taxa99 como despesa automática (a tela já aceita o valor; o **cálculo completo** e as **taxas de maquininha** vêm na V2.5), Pacote Taxa Zero, fechamento v2, PDF.

## 9. Definição de pronto
- [ ] Dividir em N partes = **1 lançamento**, `qtd_corridas = 1`, soma validada **no banco** (inclusive escrita direta).
- [ ] Contagem de corridas correta em todas as telas; lote e gorjeta funcionando.
- [ ] Reparo do histórico (se escolhido) **aprovado, reversível e com antes × depois** conferido.
- [ ] Suíte antiga verde; RLS com **duas contas**; APK testado (se existir).
- [ ] `PROGRESSO_V2.md`/`DECISOES_V2.md` atualizados; tag `v2-4-aprovada` após o SIM.

## 10. Plano de volta
**Desligar a chave `partes`** (volta o lançamento antigo). Reparo de histórico: **script de desfazer** (restaura de `lancamentos_pre_v2` e `auditoria`). Corridas lançadas **com partes** continuam válidas e visíveis nos saldos por local.
