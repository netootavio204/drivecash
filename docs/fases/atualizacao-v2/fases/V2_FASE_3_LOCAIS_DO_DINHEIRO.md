# FASE V2.3 de 6 — Locais do dinheiro: bolso, app 99 e bancos

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_3_LOCAIS_DO_DINHEIRO.md.
> Execute a Fase V2.3 seguindo o ciclo das regras. Esta fase mexe na estrutura do banco: pergunte tudo ANTES de criar tabelas e não toque nos dados reais sem simulação e aprovação.
> ```

## 1. Objetivo
Mostrar **quanto dinheiro está no bolso, no app da 99 e em cada banco** (Inter, Mercado Pago, Santander e outros), com **saldos corretos**, **transferências entre locais** (saque do app, depósito, recarga) e **conciliação** com os caixas atuais. Também **classificar o histórico** para que os saldos por local fechem.

## 2. O que ler (contexto mínimo)
`PRD_ATUALIZACAO_V2.md`: **5.3**, **6.4**, **6.9** (RF-V2-MIG-01 a 03, 06, 07), **7.3**, **8.3**, **8.4**, **8.7**, **8.8** (e a nota sobre dias fechados), **8.9**, **11**, **12.3** (casos 9 a 11, 21 a 24), **Anexo A** (A.4, A.5), **Anexo B**. `RELATORIO...` **seções 3, 5 e 8**. `AUDITORIA_V2.md`.

## 3. O que existirá no final
- Tabelas `bancos_catalogo`, `locais_dinheiro`, `locais_transferencias` e (estrutura) `lancamento_partes` + colunas novas em lançamentos (**migrações `0103`, `0104`, `0107`**) — **aditivas**.
- **Bolso** e **App 99** criados para todos; **bancos escolhidos** pelo dono, com **saldo inicial** real.
- **Cartões de saldo** no Início: **Bolso · App 99 · Bancos · Total**; tela **"Meu dinheiro"** com extrato por local.
- **Saída com "pago com"** (local) e **Transferência entre locais** (com taxa opcional).
- **Conciliação** locais × caixas e **classificação do histórico** (com simulação, aprovação, backup e desfazer).
- Tudo atrás da chave **`locais`**.

## 4. Entrevista inicial

**Rodada 1 — Seus locais**
1. **Quais bancos/contas** você quer ver? Padrão: **Inter, Mercado Pago, Santander**. Adicionar/remover? (Nubank, Itaú, Bradesco, Caixa, BB, C6, PicPay, PagBank, Neon, Sicoob, Sicredi, Will, **Outro**)
2. **Nomes na tela:** A) ★ "Bolso", "App 99" e o nome do banco  B) Outros nomes (quais?)
3. **Saldos de hoje (para começar certo).** Me diga, **neste momento**: quanto tem no **bolso**, no **app da 99** (pode ser **negativo**) e em **cada banco**. *(Vou pedir para você conferir nos apps.)*
4. **Onde está a sua reserva de manutenção?** A) ★ Em um banco (qual?)  B) No bolso  C) No app

**Rodada 2 — Histórico (como classificar o que já foi lançado)**
5. **Entradas antigas com forma de pagamento "dinheiro":** A) ★ Bolso  B) Outro
6. **Entradas antigas "Pix":** A) ★ Banco padrão (qual?)  B) App 99  C) Perguntar uma a uma
7. **Entradas antigas "saldo do app":** A) ★ App 99
8. **Entradas antigas sem informação de pagamento:** A) ★ Bolso  B) App 99  C) Perguntar uma a uma
9. **Despesas antigas** (saídas): de onde saíram? A) ★ Bolso  B) Banco padrão (qual?)  C) Perguntar por categoria (ex.: combustível = Bolso)
10. **"Crédito no app"** antigo: A) ★ Tratar como **recarga** (transferência para o App 99)  B) Manter como despesa. *(Muda os saldos; vamos simular antes.)*

**Rodada 3 — Transferências**
11. **Movimentos que você faz:** saque do app para banco (automático quarta/manual) · depósito do bolso no banco · retirada do banco para o bolso · recarga do app. Quais **taxas** você paga (ex.: **R$ 1,00** no saque manual)?
12. **Saldo do app negativo:** avisar? A) ★ Sim, aviso discreto  B) Não
13. **Início da tela:** A) ★ Cartões Bolso/App/Bancos logo abaixo do **Caixa atual**  B) Só dentro de "Meu dinheiro"
14. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` (**D-V2-03, 04, 05, 06**) → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Checklist de segurança** (REGRAS, seção 4) e branch `v2-fase-3-locais`. **Novo backup de produção** antes de qualquer reparo.
2. **Migrações no ambiente de testes primeiro:** `0103` (locais, bancos, transferências), `0104` (colunas novas em `lancamentos`, `lancamento_partes`, **trigger de soma**) e `0107` (views `vw_saldo_locais`, `vw_conciliacao`, `vw_dia_por_meio`). Adaptar ao banco real (nomes, **CHECK `origem`**, políticas). Rodar a suíte antiga e os casos **9–11, 21–22**.
3. **Funções:** `rpc_inicializar_locais()` (idempotente), **`rpc_transferir_local`** (valida saldo da origem; destino recebe **valor − taxa**; **não** infla receita) e **trigger de novos usuários** para criar Bolso e App 99.
4. **Aplicar em produção** (chave `locais` **desligada**) e conferir **antes × depois** (8.9 vazio).
5. **Configuração:** tela para **escolher bancos**, nomes/cores, **saldo inicial** de cada local (respostas da pergunta 3) e **ocultar** (nunca excluir) locais.
6. **Telas:** **cartões de saldo** no Início (negativo do App em vermelho com aviso), tela **"Meu dinheiro"** (extrato por local, gráfico simples), botão **Transferir**.
7. **Saídas com "pago com"** (local; padrão = último usado) — **somente com a chave ligada**; saídas antigas seguem como estão até a classificação.
8. **Classificação do histórico (com cuidado máximo):**
   - **Simulação (dry-run):** relatório simples ao dono — quantas entradas/saídas serão classificadas em cada local e o **efeito nos saldos**; **conciliação** antes e depois.
   - **Aprovação** do dono (itens "perguntar um a um" ficam para revisão manual).
   - **Backup** das linhas afetadas (`..._pre_v2`), registro em **`auditoria`**, execução **em transação**, **script de desfazer testado**.
   - **Dias fechados:** a proteção do banco impede alterar lançamentos de dias fechados. Use **função de reparo própria**, restrita ao dono e registrada (REGRAS, seção 6), ou **tabela lateral** de classificação — **apresente as duas opções ao dono e registre a escolha**; **nunca** desative a proteção para todos.
9. **Conciliação:** `Σ saldos dos locais = Σ saldos dos caixas`; mostrar diferença (se houver) e **ajuda para explicá-la**.
10. **Testes:** casos **9, 10, 11, 21, 22, 23, 24** + Anexo A (**A.4** e **A.5**: soma dos locais = abertura + ganho líquido, na parte já possível); **suíte antiga inteira**; **E2E**: transferir app → banco com taxa R$ 1.
11. **APK (se existir):** `android:sync`, testar tela "Meu dinheiro" e transferência; **`versionCode`**.
12. **Prévia → SIM → ligar a chave `locais`** em produção (**primeiro só para o dono**). **Documentos.**

## 6. Roteiro de teste prático para o dono
1. Abra **Meu dinheiro**: confira se **Bolso, App 99 e cada banco** mostram **os saldos que você informou**.
2. Faça uma **transferência** (ex.: saque do app para o Inter, R$ 100 com taxa R$ 1): o app cai R$ 100, o banco sobe R$ 99, e a **receita não muda**.
3. Lance uma **despesa** escolhendo "pago com" (ex.: combustível no bolso): o saldo do **bolso** diminui.
4. Veja a **conciliação**: deve mostrar **"Tudo conferido ✔"** depois da classificação do histórico.
5. Confirme que **caixa atual, metas e relatórios antigos não mudaram**.

## 7. Entrevista final e aprovação
Pergunte: *"Os saldos de cada lugar batem com o que você vê nos apps e no bolso? Faltou algum banco? A classificação do histórico ficou razoável?"* Ajuste e use o **modelo de aprovação** para o SIM da **V2.4**.

## 8. Fora do escopo desta fase
Dividir corridas em partes, Taxa99, maquininha, Pacote Taxa Zero, fechamento v2, PDF.

## 9. Definição de pronto
- [ ] Migrações `0103/0104/0107` aplicadas (testes e produção) sem tocar nos dados existentes.
- [ ] Saldos por local corretos; conciliação **sem diferença**; classificação do histórico aprovada e reversível.
- [ ] Foto antes × depois **vazia**; suíte antiga verde; RLS testado com **duas contas**.
- [ ] APK testado (se existir); `PROGRESSO_V2.md`/`DECISOES_V2.md` atualizados; tag `v2-3-aprovada` após o SIM.

## 10. Plano de volta
**Desligar a chave `locais`** (o app volta a mostrar só os caixas). Se a classificação do histórico precisar ser desfeita: rodar o **script de desfazer** (restaura das tabelas `..._pre_v2` e remove partes `legado = true`) e conferir **8.9**.
