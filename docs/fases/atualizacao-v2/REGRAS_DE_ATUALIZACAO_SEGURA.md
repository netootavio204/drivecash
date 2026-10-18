# REGRAS DE ATUALIZAÇÃO SEGURA — DriveCash v2

> Valem para **todas as fases V2.1 a V2.6**. Leia **junto** com `docs/REGRAS_DO_AGENTE.md` (regras gerais do projeto). Em caso de conflito, **vale a regra mais segura**.

## 1. Situação
- O sistema **já está funcionando** (e pode ter o **APK** instalado). Tudo o que existe é **precioso**: dados reais de dinheiro do dono.
- O dono é **motorista da 99**, **não programador**, fala **português** e prefere **respostas curtas e passo a passo**, com **comandos prontos para colar**.
- **Objetivo desta atualização:** os pedidos do `PRD_ATUALIZACAO_V2.md` **sem quebrar nada** e **sem reduzir a segurança**.

## 2. A realidade do código manda
- O PRD descreve o que **deveria** existir; o **código e o banco reais** dizem o que **existe**. Se houver diferença (nomes de tabelas/colunas/funções, telas, regras), **registre em `docs/atualizacao-v2/AUDITORIA_V2.md`**, **adapte o plano** e **avise o dono**.
- SQL do PRD é **referência**. Adapte nomes reais. **Nunca** rode SQL sem entender o efeito.

## 3. Ciclo obrigatório de CADA fase
1. **Preparar:** leia `PROGRESSO_V2.md`, `DECISOES_V2.md` e **só as seções do PRD indicadas** na fase.
2. **Verificar a rede de segurança:** existe **backup recente**? Existe **ambiente de testes**? Estamos na **branch certa**? Se faltar algo, **pare e resolva**.
3. **Entrevista inicial** (arquivo da fase): **até 4 perguntas por vez**, com opções **A/B/C** e **★ recomendada**; "não sei" = adotar ★ e **registrar**.
4. **Resumo das decisões** → grave em `DECISOES_V2.md` → peça **"Está correto? (SIM / AJUSTAR)"**.
5. **Plano curto** (arquivos, migrações, comandos que o dono vai rodar, riscos, **como voltar atrás**) → **aguarde aprovação**.
6. **Testes que falham primeiro** (defeitos) → **executar** em commits pequenos.
7. **Ambiente de testes primeiro** → rodar **toda a suíte antiga + nova** + **foto antes × depois** (golden master).
8. **Prévia** (preview) para o dono testar com o **roteiro prático**.
9. **Entrevista final** (dificuldades, estranhezas, algo diferente do imaginado) e correções **dentro da fase**.
10. **SIM do dono** → publicar em produção seguindo o PRD 14.1 → atualizar `PROGRESSO_V2.md` → tag `v2-N-aprovada`.
11. **Pedir autorização** para a próxima fase com o **modelo da seção 8**. **Sem SIM, não avance.**

## 4. Antes de QUALQUER migração (checklist de 5 itens)
- [ ] **Backup** de produção feito hoje e **testado** (abre/restaura em ambiente de testes).
- [ ] Migração **rodada primeiro no ambiente de testes** sem erro.
- [ ] Migração é **aditiva** (nada apagado, renomeado ou com tipo alterado).
- [ ] Recurso novo está **atrás de chave liga/desliga**, **desligada** em produção.
- [ ] **Plano de volta** escrito e conhecido pelo dono.

## 5. Proibições
- ❌ SQL experimental em produção. ❌ Apagar lançamentos para "arrumar" números.
- ❌ Alterar o significado de campos que já existem (`valor_centavos`, `qtd_corridas`).
- ❌ Desativar RLS, dar permissões amplas ou usar `service_role` no cliente.
- ❌ Adicionar scripts/CDN externos, analytics novos ou envio de dados financeiros a terceiros.
- ❌ Publicar sem **SIM** e sem **backup do dia**.
- ❌ Misturar várias fases na mesma publicação.

## 6. Reparos de dados (quando permitidos)
1. **Dry-run:** mostrar **quantos** registros serão afetados, com **exemplos** em linguagem simples.
2. **Aprovação** do dono (**casos ambíguos, um a um**).
3. **Backup** das linhas afetadas em tabela `..._pre_v2` (com RLS) e registro em `auditoria`.
4. Executar **em transação**; conferir **antes × depois**.
5. Entregar **script de desfazer** testado.
6. **Dias fechados** são protegidos por regra do banco. Reparos que precisem tocar neles usam **função de reparo própria**, restrita ao dono (`auth.uid()`), documentada e **registrada na auditoria** — **nunca** desativando a proteção para todos.

## 7. Segurança e privacidade
- RLS em **todas** as tabelas novas; **duas contas** provam o isolamento.
- Chaves: só **Project URL** e **anon key** no cliente. Se o dono colar `service_role`, **avise na hora** e peça para gerar outra.
- PDF e relatórios: **gerados no aparelho**; compartilhar só por **ação explícita** do dono; **sem número de conta/agência**.
- Dependências novas: versões **fixas**, **sem pacotes com menos de 14 dias**, `npm audit` sem falhas críticas.
- Se existir `APK/`: **sem novas permissões** Android; rodar `npm run android:sync`; testar em celular real; **aumentar `versionCode`**.

## 8. Modelo da pergunta de aprovação (use sempre)
```
✅ A FASE V2.N está pronta (em PRÉVIA — ainda não afetou seus dados reais).

O que foi feito: (3 a 6 itens curtos)
Como testar agora: (roteiro curto)
Conferências de segurança: backup ✔ · testes antigos ✔ · antes×depois ✔ · RLS ✔
Como voltar atrás: (1 frase)
Pendências ou limitações: (se houver)

Posso publicar em PRODUÇÃO e seguir para a FASE V2.N+1?
Responda: SIM  |  AJUSTAR (diga o que mudar)  |  PARAR
```
> Na **V2.6** (última), pergunte: **"Atualização v2 concluída? (SIM / AJUSTAR)"**.

## 9. Segurança do contexto
- Leia **só** o que a fase indica. `PROGRESSO_V2.md` é a memória da atualização.
- Conversa longa? Atualize `PROGRESSO_V2.md` e sugira **abrir conversa nova** com o comando da fase.

## 10. Quando algo der erro
1. Explique em **uma frase simples**.
2. **Erro de código/tela:** até 2 tentativas de correção; depois resumo + 2 opções.
3. **Erro envolvendo dados/dinheiro:** **PARE imediatamente**, **não tente "consertar"**, avise o dono, mostre o que aconteceu e **proponha o plano de volta**.
4. Nunca esconda erro nem marque tarefa como concluída sem testar.

## 11. Git
- Branch principal da atualização: `v2-atualizacao`; uma branch por fase: `v2-fase-1-auditoria`, `v2-fase-2-correcoes`, `v2-fase-3-locais`, `v2-fase-4-partes`, `v2-fase-5-taxas`, `v2-fase-6-pdf`.
- Commits pequenos e em português. Tag `pre-v2` **antes de tudo**; `v2-N-aprovada` ao final de cada fase aprovada.
