# REGRAS DO AGENTE — Projeto DriveCash (Web App)

> Este arquivo vale para **todas as 6 fases**. Leia no início de cada fase, junto com `docs/PROGRESSO.md` e `docs/DECISOES.md`.

## 1. Quem é o dono do projeto
- **Não é programador.** Você (agente) é quem programa.
- Fala **português do Brasil**. Responda sempre em português, simples e direto.
- Prefere **respostas curtas, passo a passo**, sem explicação teórica longa.
- Quando precisar que ele rode algo, entregue **comandos prontos para colar**, em bloco de código, **um passo por vez**, dizendo **onde rodar** e **o que deve aparecer** como resultado.

## 2. Escopo do projeto
- Entregamos **somente o Web App** (PWA). **NÃO crie APK, NÃO instale Capacitor** agora; isso é futuro.
- A fonte da verdade é `docs/PRD.md`. Não invente funcionalidades fora dele. Boas ideias vão para `docs/IDEIAS.md` e você **pergunta** antes de fazer.
- Itens marcados **P2** no PRD ficam **fora** das 6 fases (backlog pós-lançamento).

## 3. Ciclo obrigatório de CADA fase
1. **Preparar:** leia `docs/PROGRESSO.md`, `docs/DECISOES.md` e **somente as seções do PRD indicadas no arquivo da fase** (não releia o PRD inteiro).
2. **Entrevista inicial:** faça as perguntas do arquivo da fase (ver seção 4). Não escreva código antes de concluir.
3. **Resumo das decisões:** devolva um resumo curto do que entendeu, grave em `docs/DECISOES.md` e peça: **"Está correto? (SIM / AJUSTAR)"**.
4. **Plano curto:** liste arquivos que vai criar/alterar, comandos que ele vai rodar e riscos. **Espere aprovação.**
5. **Execução:** faça as tarefas da fase, em ordem, com commits pequenos em português (`feat: abrir dia`).
6. **Teste prático:** rode lint, typecheck e testes. Depois entregue o **roteiro de teste para o dono** (o que clicar, o que deve aparecer).
7. **Entrevista final:** pergunte se encontrou dificuldade, algo estranho ou algo que imaginou diferente. Corrija o que ele pedir **dentro da fase**.
8. **Fechar a fase:** atualize `docs/PROGRESSO.md`, faça commit final e crie a tag `fase-N-aprovada` (só depois do SIM dele).
9. **Pedir autorização:** use exatamente o modelo da seção 6. **Nunca comece a próxima fase sem o SIM.**

## 4. Como conduzir entrevistas
- Faça **no máximo 4 perguntas por vez** (em "rodadas"), e espere a resposta antes da rodada seguinte.
- Use linguagem de leigo. Explique em **uma frase** por que a pergunta importa.
- Sempre ofereça **opções (A, B, C)** com a **recomendada marcada com ★**.
- Se ele responder **"não sei"** ou **"você escolhe"**, adote a opção ★ e **registre** em `docs/DECISOES.md` como "padrão adotado".
- Se uma resposta mudar algo do PRD, **avise** e registre. Se contradisser uma regra de negócio, **alerte** antes de seguir.
- Antes de encerrar a entrevista, sempre pergunte: **"Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?"**

## 5. Regras técnicas inegociáveis
1. **Dinheiro sempre em centavos (inteiro).** Nunca `float`. (PRD RN-01)
2. **RLS ativo em todas as tabelas** de usuário. Nunca expor a chave `service_role`. Nunca commitar `.env`.
3. **Cálculos financeiros no banco** (views e funções RPC). O front só exibe e formata. (PRD 5.2)
4. **Regras de negócio (PRD seção 6) são normativas.** Cálculo financeiro sem teste não está pronto.
5. **Textos de tela em português**, conforme Anexo B do PRD, centralizados em `src/lib/textos.ts`.
6. **Todo estado tratado:** carregando (skeleton), vazio, erro e sucesso. Responsivo a partir de **360 px**.
7. **Acessibilidade:** foco visível, contraste AA, respeitar "reduzir movimento".
8. **Nada de acesso direto ao Supabase dentro de componentes visuais**; use hooks em `features/*/api.ts`.

## 6. Modelo da pergunta de aprovação (use sempre)
```
✅ A FASE N está pronta.

O que foi feito: (3 a 6 itens curtos)
Como testar agora: (roteiro curto)
Decisões registradas: (se houver)
Pendências ou limitações: (se houver)

Você aprova seguir para a FASE N+1?
Responda: SIM  |  AJUSTAR (diga o que mudar)  |  PARAR
```

## 7. Segurança das chaves (Supabase)
- Peça **apenas** a **Project URL** e a **anon/publishable key** (são públicas, protegidas por RLS).
- Se o dono colar a `service_role` por engano, **avise na hora** para não compartilhar e orientar a gerar uma nova no painel. Nunca a grave em arquivo do projeto.
- Guarde as chaves em `.env.local` (fora do Git) e mantenha `.env.example` sem valores reais.

## 8. Cuidado com o contexto (para não sobrecarregar)
- Em cada fase leia **só** o que o arquivo da fase manda. Use `docs/PROGRESSO.md` como memória do que já existe.
- Se a conversa ficar muito longa, **atualize `docs/PROGRESSO.md`** e diga ao dono: *"Sugiro abrir uma conversa nova e colar o comando da Fase N."*
- Prefira editar arquivos existentes a recriar. Não despeje arquivos grandes no chat; mostre só o essencial.

## 9. Quando algo der erro
1. Explique **em uma frase simples** o que aconteceu.
2. Tente corrigir (até 2 tentativas). 
3. Se não resolver, entregue um **resumo do erro** e **2 opções** de caminho, e pergunte qual seguir.
Nunca esconda um erro nem marque tarefa como concluída sem testar.

## 10. Git
- Branch por fase: `fase-1-fundacao`, `fase-2-banco-acesso`, etc.
- Commits pequenos e em português. Ao final da fase aprovada: tag `fase-N-aprovada` e merge na `main`.
- Se o dono não usa GitHub ainda, mantenha Git local e avise do risco de não ter backup.

## 11. Modelo de `docs/PROGRESSO.md` (atualize ao fechar cada fase)
```
## Status das fases   (tabela: fase · status · data de aprovação)
## Como rodar o projeto   (comandos atuais)
## O que já existe   (módulos e telas prontas, em linguagem simples)
## Decisões importantes   (resumo; detalhes em DECISOES.md)
## Pendências e dificuldades registradas
## Próximo passo
```
