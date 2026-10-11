# FASE 2 de 6 — Banco de dados (Supabase) e Acesso (login e onboarding)

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_2_BANCO_E_ACESSO.md.
> Execute a Fase 2 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> Esta fase define a estrutura do banco: pergunte tudo o que for necessário ANTES de criar qualquer tabela.
> ```

## 1. Objetivo
Criar o **banco de dados no Supabase** (tabelas, segurança e funções), validado com testes, e as telas de **cadastro, login, recuperar senha e onboarding**. É a fase mais importante para evitar retrabalho: o banco precisa refletir exatamente como o motorista trabalha.

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: seção **5.4**, **6.1** (RN-01 a 03), **6.2** (resumo), **6.6** (RN-26 e 27), **7.1** e **7.2**, **10 inteira** (modelo de dados e SQL), **11.3** (erros), **12.2** (segurança), **13.2 a 13.5** (testes), **Anexo A** (exemplo numérico).

## 3. O que existirá no final
- Projeto Supabase criado e conectado (região São Paulo).
- Migrações `0001` a `0004` aplicadas (tabelas, RLS, views, funções, seeds), **ajustadas às decisões da entrevista**.
- Tipos TypeScript gerados e `src/lib/supabase.ts` configurado.
- **Testes SQL** passando: isolamento entre usuários, saldos, transferência, abrir/fechar/reabrir dia, níveis de meta.
- Telas: cadastro, login, recuperar senha, nova senha, logout, rotas protegidas.
- **Onboarding de 5 passos** gravando perfil, veículo, plataformas, saldo inicial, depósito de manutenção e meta diária.
- Páginas provisórias de Termos e Privacidade.

## 4. Entrevista inicial

> Explique ao dono, em uma frase, que o banco é "o arquivo onde ficam guardados os dados de todos os dias" e que decisões erradas aqui custam caro depois.

**Rodada 1 — Supabase e quem vai usar**
1. **Você já tem conta no Supabase?** A) ★ Não, me guie na criação  B) Já tenho conta  C) Já tenho projeto criado (qual o nome?)
2. **Como conectamos o agente ao Supabase?** A) ★ Pelo Supabase CLI (eu guio o login pelo navegador)  B) Pelo Supabase MCP, se estiver configurado no Antigravity  C) Eu colo os arquivos SQL no "SQL Editor" do site, um por vez
3. **Quem vai usar o app?** A) Só eu  B) Eu e alguns conhecidos  C) ★ Qualquer motorista (público). *O banco já nasce multiusuário e seguro nos três casos.*
4. **Confirmação de e-mail ao cadastrar:** A) ★ Ligada em produção, desligada só durante os testes  B) Sempre ligada  C) Sempre desligada

**Rodada 2 — Como você trabalha (estrutura do banco)**
5. **Plataformas que você usa.** Padrão: Uber, 99, inDrive, Particular, Outros. Quer adicionar ou tirar alguma? (ex.: Garupa, Loggi, Lalamove)
6. **Categorias de entrada.** Padrão: Corridas, Gorjeta, Bônus/Promoção, Outras receitas. Falta alguma?
7. **Categorias de saída.** Padrão: Combustível, Alimentação, Crédito no app, Manutenção, Lavagem, Pedágio/Estacionamento, Multa, Outras despesas, Retirada pessoal. Falta ou sobra alguma?
8. **"Crédito no app":** explique com suas palavras o que é e quando você lança (é para pagar taxa da plataforma? é saldo que você coloca antes de rodar?). *Preciso entender para classificar certo como despesa.*

**Rodada 3 — Dinheiro e rotina (decisões que mudam tabelas)**
9. **Dinheiro físico × saldo no app:** como você controla hoje? A) ★ Tudo num caixa só (o que entrou, entrou)  B) Quero separar "dinheiro em mãos" de "a receber do app" *(o banco já guarda a forma de pagamento para uma versão futura; B aumenta o trabalho agora)*
10. **Você tem despesa fixa diária?** (ex.: aluguel diário do carro). A) ★ Não  B) Sim. *Se sim, adiciono recorrência "diária" na tabela de prioridades.*
11. **Quantos carros você usa?** A) ★ Um  B) Mais de um. *(O banco já aceita vários; a tela inicial usa um.)*
12. **O que você imaginou com "Prioridades"?** A) ★ Contas e obrigações a pagar, em ordem de importância (seguro, parcela, IPVA…)  B) Lista de objetivos/tarefas  C) Outra ideia (descreva). *Isso define a tabela de prioridades.*

**Rodada 4 — Detalhes finais**
13. **Fuso horário:** A) ★ Brasília (America/Sao_Paulo)  B) Outro (qual?)
14. **Depósito diário de manutenção (padrão inicial do onboarding):** A) ★ Valor fixo por dia — quanto? (sugestão: R$ 20)  B) Porcentagem do lucro — quantos %?  C) Desativado por enquanto
15. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

**Rodada 5 — Aprovação do desenho do banco**
Antes de criar qualquer tabela, mostre em **português simples** uma lista das tabelas com "o que guarda" cada uma (ex.: *dias de trabalho: cada vez que você abre e fecha o dia*), destacando **o que mudou em relação ao PRD** por causa das respostas. Pergunte: **"Posso criar o banco assim? (SIM / AJUSTAR)"**.

> As perguntas sobre **metas, níveis, medalhas e fases** ficam para a **Fase 5** (o banco já suporta qualquer valor).

## 5. Tarefas de execução (nesta ordem)
1. **Supabase:** criar/conectar o projeto na região **São Paulo (sa-east-1)** conforme a pergunta 2. Pegar **somente** Project URL e anon key; guardar em `.env.local` (ver REGRAS, seção 7).
2. **Migrações:** adaptar o SQL do PRD **seção 10** às decisões (plataformas, categorias, recorrência diária, etc.) e aplicar `0001_schema`, `0002_rls`, `0003_funcoes`, `0004_seeds` em arquivos versionados em `supabase/migrations/`. *Se o Postgres reclamar de alguma sintaxe, corrija sem mudar as regras de negócio e registre em `DECISOES.md`.*
3. **Configurar Auth** no Supabase: URL do site (`http://localhost:5173` por enquanto), URLs de redirecionamento, senha mínima de 8, confirmação de e-mail conforme pergunta 4, e-mails com textos em português.
4. **Tipos e cliente:** gerar `database.types.ts`; criar `src/lib/supabase.ts`; `src/lib/erros.ts` com `traduzirErro` (PRD 11.3).
5. **Testes SQL** (scripts em `supabase/tests/`), cobrindo PRD 13.2 (casos 3 a 5), 13.3 (casos 6 a 13), 13.4 (casos 14 a 16 e 20) e 13.5 (casos 21 a 23). Incluir o **Anexo A** (exemplo numérico): caixa final **R$ 380,00**, reserva **R$ 20,00**, lucro **R$ 255,00**.
6. **Front de acesso:** `AuthProvider`, rotas protegidas, telas de cadastro, login, recuperar senha, nova senha e logout (RF-AUT-01 a 06), usando o design system da Fase 1 e mensagens do PRD.
7. **Onboarding de 5 passos** (RF-ONB-01): nome → veículo → plataformas → dinheiro em mãos agora (vira saldo inicial do caixa principal) → depósito de manutenção e meta diária de receita (cria a linha em `metas`; a tela de metas vem na Fase 5). Passos opcionais podem ser pulados.
8. **Páginas** `/termos` e `/privacidade` provisórias (texto final na Fase 6).
9. **Documentos:** atualizar `PROGRESSO.md` (incluindo "como rodar" e onde ver os dados no Supabase) e `DECISOES.md` (todas as respostas da entrevista).

## 6. Roteiro de teste prático para o dono
1. Rode `npm run dev` e abra o app. Você deve cair na tela de **login**.
2. **Crie uma conta** (confirme o e-mail se estiver ligado). Passe pelo **onboarding**.
3. **Saia e entre de novo:** o onboarding não deve repetir e você deve ir direto para o Início.
4. Teste **"esqueci minha senha"** (o e-mail deve chegar em português).
5. Crie uma **segunda conta** (outro e-mail) e confirme que **não aparece nada da primeira**.
6. No painel do Supabase, o agente mostra onde clicar (*Table Editor*) para ver `profiles`, `caixas`, `plataformas`, `categorias` do seu usuário.
7. Rode os testes SQL e `npm test`: tudo verde.

## 7. Entrevista final e aprovação
Pergunte: *"Conseguiu criar conta e passar pelo onboarding sem travar? Algum texto ou passo confuso? A estrutura do banco ainda está de acordo com o seu jeito de trabalhar?"* Corrija e use o **modelo de aprovação** para pedir o SIM para a **Fase 3**.

## 8. Fora do escopo desta fase
Abrir dia, lançamentos, caixa, metas (telas), prioridades (telas), relatórios, APK.

## 9. Definição de pronto
- [ ] RLS comprovado por teste (usuário A não vê nem altera dados do B).
- [ ] Nenhuma chave secreta no repositório; `.env.local` fora do Git.
- [ ] Todos os testes SQL e do front passando; Anexo A reproduzido no banco.
- [ ] Cadastro, login, recuperar senha e onboarding funcionando de ponta a ponta.
- [ ] `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-2-aprovada` após o SIM.
