# FASE 1 de 6 — Fundação do projeto e Design System

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_1_FUNDACAO_E_DESIGN.md.
> Execute a Fase 1 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Deixar o projeto **rodando no navegador** com a base técnica e o **visual vermelho/laranja/preto** pronto para uso: tokens de design, componentes base e uma tela de demonstração. **Ainda sem banco de dados e sem login.**

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: seção **0**, **5** (arquitetura e stack), **8.1** (mapa de navegação), **8.6** (estados das telas), **9** (design system completo), **12.1** e **12.4** (desempenho e acessibilidade), **Anexo B** (textos).

## 3. O que existirá no final
- Projeto React + TypeScript + Vite + Tailwind funcionando (`npm run dev`).
- Design tokens (cores, tipografia, sombras, raios) e fontes locais.
- Componentes base: Button (todas as variantes), Card, StatCard, Input, MoneyInput, NumericKeypad, Chip, Switch, Sheet, Modal, Toast (com "Desfazer"), Tabs, BottomNav, SidebarNav, ProgressRing, ProgressBar, Skeleton, EmptyState, ErrorState, ConfirmDialog.
- Navegação com as rotas do PRD 8.1 (páginas vazias com EmptyState).
- Rota **`/design-system`** mostrando todos os componentes e estados.
- Utilitários testados: `money.ts`, `datas.ts`, `config.ts` (nome do app), `textos.ts`.
- Git iniciado, `.env.example`, README curto em português.

## 4. Entrevista inicial

**Rodada 1 — Ambiente e projeto**
1. **Seu computador é Windows, Mac ou Linux?** Vou verificar se Node.js e Git estão instalados e, se faltar, guio a instalação passo a passo.
2. **Nome do app:** A) ★ DriveCash  B) outro nome (qual?)
3. **Guardar o código no GitHub** (backup e publicação futura)? A) ★ Sim, me ajude a criar  B) Já tenho conta e repositório  C) Só no computador por enquanto
4. **Pasta do projeto:** já criou uma pasta e abriu no Antigravity? Se não, eu explico como.

**Rodada 2 — Visual**
5. **Intensidade de brilho e animação:** A) Suave  B) ★ Média  C) Intensa (bem "neon")
6. **Cantos dos botões e cartões:** A) ★ Bem arredondados  B) Médios  C) Quase retos
7. **Tem algum app ou site de referência de visual que você gosta?** (pode só descrever)
8. **Logo/ícone:** A) ★ Proponha 3 ideias simples para eu escolher  B) Tenho meu logo (vou enviar)  C) Deixar para depois

**Rodada 3 — Fechamento**
9. Confirmar: **tema escuro único** (preto) por enquanto? A) ★ Sim  B) Quero opção de tema claro também (entra como melhoria futura)
10. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo das decisões → grave em `docs/DECISOES.md` → peça confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Verificar ferramentas:** Node.js (versão LTS atual) e Git. Orientar instalação se faltar.
2. **Criar o projeto** Vite + React + TypeScript. Instalar: Tailwind, React Router, TanStack Query, Zustand, React Hook Form, Zod, Framer Motion, lucide-react, canvas-confetti, date-fns, date-fns-tz, Vitest, Testing Library, ESLint, Prettier. *(Supabase, Recharts e PWA ficam para fases futuras.)*
3. **Estrutura de pastas** conforme PRD 5.3, com atalho de importação `@/`.
4. **Tokens e fontes:** variáveis CSS do PRD 9.2, tipografia do 9.3 (fontes **locais**), configuração do Tailwind apontando para os tokens. Respeitar as escolhas das perguntas 5 e 6.
5. **Componentes base** da lista da seção 3, com os estados *hover, foco, ativo, desabilitado, carregando*. Botões com borda animada e sombra (PRD 9.5), respeitando "reduzir movimento".
6. **Utilitários:**
   - `money.ts`: formatar/ler moeda e máscara estilo banco (PRD RN-01).
   - `datas.ts`: fuso `America/Sao_Paulo`, início de semana configurável.
   - `config.ts` (`APP_NAME`) e `textos.ts` (textos do Anexo B).
7. **Layout e rotas:** BottomNav (Início · Caixa · [+] · Metas · Mais), SidebarNav no desktop, rotas do PRD 8.1 com páginas vazias usando EmptyState.
8. **Rota `/design-system`** com todos os componentes, variantes e estados lado a lado.
9. **Qualidade:** scripts `dev`, `build`, `test`, `lint`, `typecheck`; `.gitignore`, `.env.example`; README curto em português com "como rodar"; `git init` e primeiro commit; subir ao GitHub se escolhido.
10. **Logo:** se escolhido A, gerar 3 opções em SVG e aguardar a escolha.
11. **Documentos:** confirmar que `docs/PRD.md` existe; atualizar `docs/PROGRESSO.md` e `docs/DECISOES.md`.

## 6. Testes obrigatórios
- Unitários de `money.ts`: `formatarMoeda(123456)` → `R$ 1.234,56`; ler `1.234,56` → `123456`; digitar `1,2,3,4,5` no MoneyInput → `R$ 123,45` e apagar remove o último dígito.
- Componente: NumericKeypad e MoneyInput.
- `npm run build`, `lint` e `typecheck` sem erros.

## 7. Roteiro de teste prático para o dono
1. Rode `npm install` e depois `npm run dev`; abra o endereço mostrado (normalmente `http://localhost:5173`).
2. Entre em `/design-system` e confira botões, cartões, teclado numérico e anel de progresso.
3. Passe o mouse e use `Tab` nos botões: devem brilhar e mostrar foco visível.
4. Diminua a janela até ~360 px de largura: nada deve quebrar; a barra inferior aparece.
5. Rode `npm test`: tudo deve ficar verde.

## 8. Entrevista final e aprovação
Pergunte: *"O visual está como você imaginou? Algo para ajustar em cores, brilho, botões ou tamanhos?"* Corrija o que pedir. Depois use o **modelo de aprovação** (REGRAS, seção 6) para pedir o SIM para a **Fase 2**.

## 9. Fora do escopo desta fase
Supabase, login, telas reais, relatórios, PWA, APK.

## 10. Definição de pronto
- [ ] App abre sem erros e `/design-system` completo.
- [ ] Testes, lint, typecheck e build passando.
- [ ] Responsivo em 360 px e contraste AA nos textos principais.
- [ ] `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-1-aprovada` criada após o SIM.
