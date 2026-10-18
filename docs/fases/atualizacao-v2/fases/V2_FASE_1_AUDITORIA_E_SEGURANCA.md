# FASE V2.1 de 6 — Auditoria, backup e rede de segurança

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_1_AUDITORIA_E_SEGURANCA.md.
> Execute a Fase V2.1 seguindo o ciclo das regras. Esta fase NÃO muda o comportamento do app. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Montar a **rede de segurança** antes de mexer no sistema: **entender como tudo foi realmente construído**, **provar os defeitos com testes**, **fazer backup**, **criar ambiente de testes**, **tirar a "foto antes"** dos números e **coletar as informações de negócio da 99** que definem o resto da atualização. **Nenhuma funcionalidade nova** nesta fase.

## 2. O que ler (contexto mínimo)
- `docs/atualizacao-v2/PRD_ATUALIZACAO_V2.md`: **0, 1, 2, 3, 4, 8.1, 8.8, 8.9, 12.2, 14, 15.2**.
- `docs/atualizacao-v2/RELATORIO_PESQUISA_99_TAXAS_E_PAGAMENTOS.md`: **seções 1, 3 e 10**.
- Código: estrutura de pastas, `src/lib/supabase.ts`, componentes de **metas** (barra/anel), tela de **lançar entrada** (inclusive a **divisão de ganhos**), `supabase/migrations/`.

## 3. O que existirá no final
- **`docs/atualizacao-v2/AUDITORIA_V2.md`** com: mapa do código e do banco **reais**, diferenças em relação ao PRD v1, **causa provável do BUG-01** e **como o BUG-02 foi implementado**, **quantos casos de corrida dividida** existem no histórico, lacunas e riscos.
- **Backup do banco** (2 cópias) e **tag `pre-v2`** no Git; **branch** `v2-atualizacao`.
- **Ambiente de testes** (Supabase de testes) com a mesma estrutura, funcionando.
- **Chaves liga/desliga** (`configuracoes.recursos`) criadas (migração `0101`), **tudo desligado**.
- **Foto antes** (golden master) criada e exportada em arquivo.
- **Testes que reproduzem BUG-01 e BUG-02** (falhando de propósito, documentados).
- **Lista de testes atuais** (baseline) todos verdes.
- **Decisões de negócio** da 99 registradas em `DECISOES_V2.md`.

## 4. Entrevista inicial
> Diga ao dono, em uma frase: *"Antes de mexer, vou conhecer o app como ele está hoje e fazer um backup, para nada do que já funciona se perder."*

**Rodada 1 — Como o sistema está hoje**
1. **Onde o app é usado hoje?** A) Só no site  B) ★ Site **e** APK instalado no meu celular  C) Outras pessoas também usam
2. **Ambientes:** hoje existe **um Supabase só** (o de verdade) ou também um de **testes**? A) ★ Só o de verdade (vamos criar um de testes, gratuito)  B) Já tenho um de testes
3. **Código:** está no **GitHub**? Qual a branch principal? Existe backup do código? (A) ★ Sim, GitHub  B) Só no computador (vamos subir)
4. **Posso ler os seus dados reais em modo somente leitura** para a auditoria (contar corridas divididas, locais sem classificação)? A) ★ Sim, somente leitura  B) Não, só estrutura

**Rodada 2 — Seu trabalho na 99**
5. **Em qual cidade você roda?** Ela aparece na lista oficial do **Pacote Taxa Zero**? Você compra **pacote**? Qual (**diário, 3 dias ou por ganhos**) e **quanto custa no seu app**?
6. **Quais modalidades** você faz? (99Pop, Pop Expresso, Negocia, Plus, Entrega)
7. **Qual valor você digita hoje como "valor da corrida"?** A) O **líquido** que o app mostra antes de aceitar ("Saiba quanto vai ganhar")  B) ★ O **total do recibo** ("Valor da corrida")  C) Depende
8. **Taxa99:** você consegue ver em cada recibo/Central de Ganhos? Prefere A) ★ **digitar quando quiser** (opcional)  B) **estimar por %** (informe o % que você observa)  C) Não controlar taxa por corrida

**Rodada 3 — Como o dinheiro entra e sai**
9. **Como você recebe dos passageiros?** (marque): dinheiro · **Pix direto na minha chave** · **cartão na minha maquininha** (qual?) · tudo pelo app.
10. **Quais bancos/contas você usa** e quer ver nos saldos? (ex.: Inter, Mercado Pago, Santander, outros) E **qual recebe o Pix direto**?
11. **"Crédito no app":** o que é para você? A) ★ **Recarga** que faço no app para cobrir taxas (dinheiro **meu** indo para o app)  B) Uma **despesa** mesmo  C) Outra coisa (explique)
12. **Saque do app:** como e quando você tira o dinheiro do app para o banco? (automático toda quarta · manual · quanto paga de taxa, se pagar)

**Rodada 4 — Prioridades e dificuldades**
13. **Ordene o que mais incomoda hoje** (1 = mais urgente): barra de metas · corrida contada duas vezes · saldos por bolso/app/banco · botões no topo · PDF do dia · taxas e ganho líquido.
14. Qual **dia/horário** é melhor para publicar mudanças sem atrapalhar o seu trabalho?
15. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` (**D-V2-01, 02, 06, 09, 15** e as demais respostas) → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Confirmar a branch e o estado do Git** (`git status` limpo). Criar a **tag `pre-v2`** e a branch **`v2-atualizacao`**; subir ao GitHub se a pergunta 3 for A.
2. **Backup do banco de produção** (exportação completa pelo caminho mais simples ao dono: painel do Supabase ou CLI) e **teste de abertura** do arquivo. **Duas cópias** fora do repositório (guie o dono: pen drive + nuvem privada). **Nada de dados reais no Git.**
3. **Criar o Supabase de testes** (projeto gratuito separado) e **aplicar todas as migrações existentes** nele; conferir que o app roda apontando para ele (arquivo `.env.test`, **fora do Git**). Se o dono concordar (pergunta 4 A), copiar **uma amostra** dos dados para testar.
4. **Auditoria do código e do banco** (somente leitura) e escrita de `AUDITORIA_V2.md`:
   - tabelas, colunas, views, funções e **trigger/regras** reais (inclusive o **nome real da CHECK `origem`**);
   - telas e hooks de **metas** (como calcula e desenha a barra/anel) e de **lançar entrada/divisão de ganhos**;
   - **chamadas de `rpc_atualizar_metas`** (quando acontecem) e **invalidações de cache**;
   - **como o APK** está montado (se existir `APK/`).
5. **BUG-01:** reproduzir; testar as hipóteses **H1 a H9** (PRD 4.1) e **anotar a causa real**. Escrever **teste automatizado que falha** hoje (casos 1 a 5 do PRD 12.3).
6. **BUG-02:** reproduzir; **escrever teste que falha** (dividir R$ 30 em 3 partes → hoje `corridas ≠ 1`). Rodar a **consulta 8.8 (1)** no ambiente **real, só leitura** (ou nos testes) e **mostrar ao dono** a lista de **candidatos a corrida dividida** em linguagem simples.
7. **Baseline:** rodar **toda a suíte atual** (unitários, componente, E2E, SQL) e **registrar o resultado** (tudo verde). Se algo já falhava, **registrar** (não corrigir agora sem avisar).
8. **Chaves liga/desliga:** preparar e aplicar a **migração `0101`** (PRD 8.1) **primeiro no ambiente de testes**, depois em produção (**aditiva**, sem efeito visível). Criar a leitura das chaves no app (**todas desligadas**).
9. **Foto antes:** criar `v2_snapshot_antes` e `v2_snapshot_antes_caixas` (PRD 8.1) em **produção** e **exportar uma cópia em arquivo**. Conferir que as consultas **8.9** retornam **vazio** agora.
10. **Checagem de segurança inicial:** RLS de todas as tabelas atuais (lista), `.env` fora do Git, **nenhuma `service_role`** no projeto; relatório curto no `AUDITORIA_V2.md`.
11. **Plano ajustado:** se a auditoria mostrar diferenças relevantes, **propor ajustes** às fases V2.2–V2.6 e pedir aprovação.
12. **Documentos:** atualizar `PROGRESSO_V2.md` e `DECISOES_V2.md`.

## 6. Testes obrigatórios
- Suíte atual **100% verde** (ou falhas anteriores **listadas**).
- Testes novos de BUG-01 e BUG-02 **falham pelo motivo certo** (e estão marcados como "esperado falhar até a fase X").
- Consultas **8.9** → **vazio**. Backup **abre** e foi **restaurado em ambiente de testes** ao menos uma vez.

## 7. Roteiro de teste prático para o dono
1. Abra `AUDITORIA_V2.md` (ou o resumo que o agente mostrar): confira se o **resumo do seu app** faz sentido.
2. Veja o **arquivo de backup** e confirme que existem **duas cópias** (pen drive e nuvem).
3. Abra o app **como sempre**: **nada deve ter mudado**.
4. Confira a lista de **corridas candidatas a divididas**: reconhece algumas?

## 8. Entrevista final e aprovação
Pergunte: *"A auditoria descreveu o seu app direito? As corridas divididas que apareceram são mesmo suas? Posso seguir para as correções rápidas?"* Use o **modelo de aprovação** (REGRAS, seção 8). *(Como esta fase não publica mudanças visíveis, o "SIM" libera a V2.2.)*

## 9. Fora do escopo desta fase
Qualquer mudança visível, correções de bug, novas telas, novas tabelas (exceto `0101`), reparo de dados.

## 10. Definição de pronto
- [ ] `AUDITORIA_V2.md` completo; causas dos bugs documentadas.
- [ ] Backup **testado** e em **2 cópias**; tag `pre-v2`; branch `v2-atualizacao`.
- [ ] Ambiente de testes funcionando; `.env.test` fora do Git.
- [ ] Migração `0101` aplicada (testes e produção) com **recursos desligados**.
- [ ] Foto antes criada e exportada; consultas 8.9 vazias.
- [ ] Testes dos bugs escritos (falhando de propósito) e suíte base verde.
- [ ] `PROGRESSO_V2.md` e `DECISOES_V2.md` atualizados; tag `v2-1-aprovada` após o SIM.

## 11. Plano de volta
Esta fase só **adiciona** coluna de chaves e tabelas de foto. Para voltar: remover o uso das chaves no app e, se necessário, apagar as tabelas `v2_snapshot_*` e a coluna `recursos` (nada depende delas ainda).
