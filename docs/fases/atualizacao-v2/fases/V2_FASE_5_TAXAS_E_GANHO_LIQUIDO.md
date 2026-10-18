# FASE V2.5 de 6 — Taxas, ganho líquido plausível e fechamento v2

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_5_TAXAS_E_GANHO_LIQUIDO.md.
> Execute a Fase V2.5 seguindo o ciclo das regras. Esta fase mexe no cálculo do lucro e no fechamento do dia: backup do dia, ambiente de testes primeiro e o Anexo A do PRD v1 precisa continuar idêntico.
> ```

## 1. Objetivo
Entregar o **ganho líquido plausível**: **Taxa99** por corrida (informada ou estimada), **taxa de maquininha** automática, **Pacote Taxa Zero**, **devolução de taxa**, **indicadores novos** e o **fechamento v2** com **conferência por local** (bolso, app e bancos), mantendo **tudo o que o fechamento v1 já faz**.

## 2. O que ler (contexto mínimo)
`PRD_ATUALIZACAO_V2.md`: **5.2**, **5.5**, **5.6**, **6.6**, **6.7**, **7.4**, **7.5**, **8.6** (nota final), **9**, **12.3** (casos 12 a 14, 17, 18), **Anexo A** (A.1 a A.5), **Anexo B**. `RELATORIO...` **seções 2, 3, 4, 6 e 8**. PRD v1: **RN-11 a RN-14** e **Anexo A**. `AUDITORIA_V2.md`.

## 3. O que existirá no final
- **Taxa99 por corrida:** digitar o valor ou o **"Você recebe"** (taxa = valor − recebe); gera **saída filha "Taxa 99" paga pelo App 99**.
- **Modo estimado** (% configurável) com selo **"estimada"** e **"~"**.
- **Taxas de maquininha** por banco (débito %, crédito %, Pix %, prazo) aplicadas **automaticamente** na parte do cartão.
- **Pacote Taxa Zero** (cadastro, vigência, custo como despesa paga pelo app, Taxa99 = 0 na vigência) e **devolução da Taxa99** (receita no app).
- **Indicadores:** ganho bruto, **taxas**, **taxa efetiva %**, **ganho líquido**, **ganho/hora líquido**, **lucro/km**; **meta `ganho_liquido`**; painel **"Taxas da semana"**.
- **`rpc_fechar_dia_v2`**: mesmo comportamento do v1 + **conferência por local** + **snapshot** do dia com partes, taxas, saldos por local, intervalos e tempo líquido.
- Chave **`taxas`** (e uso do `rpc_fechar_dia_v2` junto com `locais`/`partes`).

## 4. Entrevista inicial

**Rodada 1 — Taxa99**
1. **Como quer lidar com a Taxa99?** A) ★ **Digitar quando eu quiser** (do recibo/Central de Ganhos)  B) **Estimar por %** (informe o % que você vê na maioria das corridas: ____)  C) Os dois (estimativa quando eu não digitar)
2. **Campo "Você recebe"** (o app calcula a taxa): A) ★ Sim  B) Não
3. **Alerta de diferença** entre o valor do aceite e o que entrou (ajuda a conferir cupom): A) Ligar  B) ★ Deixar para depois
4. **Taxa99 devolvida na segunda-feira:** você costuma ver? A) ★ Quero lançar quando acontecer  B) Não preciso

**Rodada 2 — Pacote Taxa Zero e saques**
5. **Pacote Taxa Zero:** você compra? Qual tipo (**diário, 3 dias, por ganhos**) e **valor no seu app**? Quer **ratear o custo** pelos dias de vigência? A) ★ Sim  B) Lançar tudo no dia da compra
6. **Pagamento do pacote** sai do **saldo do app**? A) ★ Sim  B) De outro lugar (qual?)
7. **Taxa do saque manual do app** (ex.: **R$ 1,00**): quanto você paga? Quer que já venha preenchida nas transferências app → banco?

**Rodada 3 — Maquininha e bancos**
8. **Taxas da sua maquininha, por banco** (use as do **seu contrato**): **débito %**, **crédito à vista %**, **Pix %** e **prazo** (na hora, 1 dia, 14 ou 30 dias).
   *(Referências públicas de 2026, só para você conferir: Mercado Pago ≈ 0,74%–1,99% débito e 2,67%–4,98% crédito à vista; Getnet ≈ 0,95%–1,89% débito e 2,95%–3,79% crédito. **Não use como padrão sem confirmar.**)*
9. **Indicadores que você quer ver** (marque): ganho líquido · taxa efetiva % · ganho/hora líquido · lucro/km · corridas/hora · tudo.
10. **Meta em ganho líquido** (nova): quer criar? A) ★ Sim, diária e mensal  B) Depois

**Rodada 4 — Fechamento**
11. **Conferência por local no fechamento:** A) ★ **Bolso obrigatório** (se houve dinheiro); **App e bancos opcionais**  B) Sempre conferir todos  C) Só bolso
12. **Quando houver diferença no app/banco** (você digita o saldo que vê): A) ★ Gerar **ajuste no local** com motivo  B) Só avisar
13. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` (**D-V2-02, 09, 10, 11**) → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Checklist de segurança** (REGRAS, seção 4); branch `v2-fase-5-taxas`; **backup de produção de hoje**.
2. **Testes primeiro:** casos **12, 13, 14, 17, 18**; **Anexo A (A.1, A.2, A.3, A.5)** em teste de banco e **E2E**; manter o **Anexo A do PRD v1** (caixa final R$ 380 etc.) **intacto**.
3. **Taxa99:** campo "Taxa99/Você recebe" na tela da corrida (já existente da V2.4) agora **gerando a saída filha "Taxa 99"** (**local = App 99**, `qtd_corridas = 0`, `origem = taxa_plataforma`), com `taxa_origem` = `informada`/`estimada`/`zero_pacote`; **modo estimado** com **selo** e **"~"**.
4. **Taxas de maquininha:** tela de **configuração por banco** (débito %, crédito %, Pix %, prazo); `rpc_lancar_corrida` calcula `round(valor da parte × %)` e cria a **saída filha** "Taxa de maquininha" **paga pelo banco** (**Exemplo A.1: R$ 0,10**).
5. **Pacote Taxa Zero (tabela nova, `0108`, com RLS):** cadastro (tipo, valor, início, fim ou limite de ganhos), **despesa "Pacote Taxa 99" paga pelo App 99**, **rateio por dia** (se escolhido) e **Taxa99 = 0** na vigência. **Devolução de Taxa99** como entrada "Devolução de taxa 99" no App 99 (`qtd_corridas = 0`).
6. **Indicadores e metas:** implementar fórmulas da **RN-V2-11** e **5.4**; nova métrica **`ganho_liquido`** em **função versionada** (sem alterar a existente); painel **"Taxas da semana"**. Conferir que **`lucro_liquido` antigo** continua igual (taxas entram como despesa operacional).
7. **`rpc_fechar_dia_v2`** (nova; a antiga **permanece**): mantém **tudo do v1** (conferência, depósito de manutenção, snapshot, auditoria) e **acrescenta**: encerrar **intervalo aberto**; **conferência por local** (RN-V2-28); snapshot com **partes por meio/local, taxas, saldos por local (abertura/fechamento), intervalos e tempo líquido** (RN-V2-30). **Reabrir** continua só no último dia e estorna ajustes/depósito do fechamento.
8. **Fechamento (telas):** passos conforme PRD 7.4 — resumo **por forma de recebimento e por local**, conferência por local, km/horas/intervalos, manutenção e confirmação. **Tela final** com ganho líquido (o botão de PDF vem na V2.6).
9. **Testes:** casos 12–14, 17–18; **A.5** (soma dos locais = abertura + ganho líquido = R$ 197,10 no exemplo); **suíte antiga inteira**; **antes × depois (8.9) vazio**; **E2E**: dia completo com 3 corridas (A.1+A.2+A.3), despesa, intervalo, conferência com falta de R$ 5 no bolso, depósito e fechamento.
10. **APK (se existir):** `android:sync`; testar tela de corrida, taxas e fechamento no celular; `versionCode`.
11. **Prévia → SIM → ligar a chave `taxas`** (só para o dono). **Documentos.**

## 6. Roteiro de teste prático para o dono
1. Lance a **corrida do exemplo** (R$ 30 · cupom R$ 10 · Taxa99 R$ 6 · débito R$ 5 no Mercado Pago): o app mostra **ganho líquido R$ 23,90** e **1 corrida**.
2. Em **Meu dinheiro**: Bolso +8,00 · Inter +7,00 · Mercado Pago +4,90 · App 99 +4,00.
3. Lance uma corrida **100% dinheiro** com Taxa99: o **App 99 fica negativo** e o app **avisa**.
4. Cadastre um **Pacote Taxa Zero** e uma corrida na vigência: **Taxa99 = 0**.
5. **Feche o dia**: confira o **resumo por forma de recebimento e por local**, faça a **conferência do bolso** (teste uma falta de R$ 5) e veja o **ganho líquido** e o **ganho por hora líquido**.
6. Compare com o seu **recibo/Central de Ganhos** de **2 ou 3 corridas reais**: os números estão plausíveis?

## 7. Entrevista final e aprovação
Pergunte: *"O ganho líquido faz sentido comparado com o que a 99 mostra? As taxas da maquininha estão certas? O fechamento ficou claro?"* Ajuste e use o **modelo de aprovação** para o SIM da **V2.6**.

## 8. Fora do escopo desta fase
PDF, impressão e compartilhamento do relatório, relatórios semanais/mensais em PDF.

## 9. Definição de pronto
- [ ] Taxa99 e taxa de maquininha geram **despesas filhas** corretas; selo "estimada" onde couber.
- [ ] Indicadores e meta `ganho_liquido` corretos; **`lucro_liquido` antigo inalterado**.
- [ ] `rpc_fechar_dia_v2` reproduz o **Anexo A do v1** e acrescenta conferência por local.
- [ ] **A.1, A.2, A.3, A.5** conferidos; conciliação **sem diferença**.
- [ ] Suíte antiga verde; antes × depois vazio; RLS (tabela de pacote) com **duas contas**; APK testado (se existir).
- [ ] `PROGRESSO_V2.md`/`DECISOES_V2.md` atualizados; tag `v2-5-aprovada` após o SIM.

## 10. Plano de volta
**Desligar a chave `taxas`** (volta ao cálculo anterior, sem taxa automática) e usar o **`rpc_fechar_dia` antigo**. Taxas já lançadas como **saídas filhas** permanecem **visíveis** e podem ser excluídas junto com a corrida. Pacote e devoluções são tabelas/entradas aditivas.
