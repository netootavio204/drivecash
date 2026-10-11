# 🚗 DriveCash — PRD (Product Requirements Document)

> **Gerenciador financeiro e de metas para motoristas de aplicativo**
> Web App (PWA) nas Fases 1 a 6 → **APK Android na Fase 7** (pasta `APK/`), mesmo código-fonte web, mesmo banco (Supabase).

| Campo | Valor |
|---|---|
| **Nome do produto (provisório)** | DriveCash *(fácil de trocar; ver `APP_NAME` em `src/lib/config.ts`)* |
| **Versão do documento** | 1.1 |
| **Data** | 10/10/2026 *(v1.0 em 09/10/2026)* |
| **Idioma do produto** | Português do Brasil (pt-BR) |
| **Moeda** | Real (BRL) |
| **Plataformas** | Web responsivo *mobile-first* (PWA instalável) → **App Android (APK/AAB) via Capacitor, na pasta `APK/` (Fase 7)** |
| **Backend** | Supabase (Postgres + Auth + RLS + Realtime + Storage + Edge Functions) |
| **Status** | Pronto para desenvolvimento em **7 fases**, com entrevista e aprovação a cada fase |

### Histórico de versões
| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 09/10/2026 | Criação do PRD (web app completo, 6 fases de construção) |
| 1.1 | 10/10/2026 | **Fase 7 — APK Android:** pasta `APK/` na raiz, conversão do web app em aplicativo Android finalizado no Android Studio; seção 15 reescrita; novos RF-APK (7.14), RNF do APK (12.8), correspondência etapas × fases (14.1), Anexos D2, F e H; roadmap reorganizado (seção 3) |

---

## 0. Instruções para o agente de desenvolvimento (LEIA PRIMEIRO)

Este documento é a **fonte da verdade** do projeto. Siga estas regras do início ao fim:

1. **Leia o PRD inteiro antes de escrever qualquer código.** Se algo estiver ambíguo, pergunte; não presuma.
2. **Trabalhe por fases e etapas** (seções 3.1 e 14). Antes de cada etapa, apresente um **plano curto** (arquivos que serão criados/alterados, riscos, como será testado) e **aguarde aprovação** do dono do produto. Só então execute.
3. **O dono do produto não é programador.** Portanto:
   - Explique em português simples, sem jargão desnecessário.
   - Entregue **comandos prontos para colar** no terminal/IDE, **um passo por vez**, dizendo onde rodar e o que esperar como resultado.
   - Ao final de cada etapa, diga **como testar na prática** (o que clicar, o que deve aparecer).
   - Respostas diretas e objetivas; sem textos longos de explicação teórica.
4. **Dinheiro nunca usa `float`.** Todo valor monetário é **inteiro em centavos** (`bigint` no banco, `number` inteiro no TypeScript). Ver RN-01.
5. **Segurança primeiro:** RLS ativo em todas as tabelas de usuário; nunca expor a chave `service_role` no front-end; nunca commitar `.env`.
6. **Não invente funcionalidades** fora deste PRD. Se tiver uma boa ideia, registre em `docs/IDEIAS.md` e pergunte.
7. **Não pule a regra de negócio** (seção 6). Cálculos financeiros devem ter **testes unitários** (seção 13) antes da tela ser considerada pronta.
8. **Git:** commits pequenos e descritivos em português (`feat: abrir dia`, `fix: saldo negativo`). Uma branch por etapa (`etapa-03-dia-lancamentos`).
9. **Definição de pronto (DoD)** de qualquer funcionalidade: (a) critérios de aceite atendidos; (b) testes passando; (c) sem erros de TypeScript/ESLint; (d) responsivo em 360 px; (e) estados de *loading*, *vazio* e *erro* tratados; (f) acessível (foco visível, contraste AA); (g) textos em pt-BR conforme Anexo B.
10. **Prioridades:** `P0` = obrigatório no MVP; `P1` = importante, entra no MVP se não atrasar; `P2` = fase seguinte.
11. **O APK só é construído na Fase 7**, dentro da pasta `APK/`. Nas Fases 1 a 6 **não crie** projeto Android nem instale Capacitor. Na Fase 7 valem as mesmas regras acima (entrevista, aprovação, comandos prontos) **e** a seção 15.

---

## 1. Visão geral

### 1.1 Resumo executivo
O **DriveCash** é um aplicativo que funciona como o **"caixa" do motorista de aplicativo** (Uber, 99, inDrive, corridas particulares). O motorista **abre o dia batendo um ponto** com o saldo acumulado do dia anterior, **lança entradas** (corridas, gorjetas, bônus) e **saídas** (combustível, alimentação, crédito no app, manutenção etc.) ao longo do dia — ou tudo no final — e **fecha o dia** com um resumo claro de quanto ganhou, gastou, reservou e quanto sobra.

Além do caixa, o app tem **Caixa Manutenção** (reserva separada com depósito diário automático), **Metas** diárias/semanais/mensais/anuais com **medalhas, estrelas, fases e confete**, **Prioridades** (contas e obrigações em ordem de importância), **relatórios** e **histórico**.

### 1.2 Problema
- Motoristas misturam dinheiro pessoal com o do trabalho e **não sabem o lucro real** do dia.
- Gastos "invisíveis" (alimentação, crédito no app, lavagem, pedágio) corroem o ganho.
- **Manutenção do carro pega de surpresa** porque não há reserva constante.
- Planilhas são lentas, feias e ruins de usar no celular, no carro.
- Falta **motivação**: sem metas claras, o ritmo de trabalho oscila.

### 1.3 Solução
Um app **rápido (lançar em até 3 toques)**, **bonito**, **mobile-first** e **motivador**, que dá três respostas em segundos:
1. **Quanto tenho no caixa agora?**
2. **Quanto lucrei hoje/semana/mês?**
3. **Quanto falta para bater minha meta e cobrir minhas contas?**

### 1.4 Diferenciais
- **Bater ponto** no começo e fim do dia (ritual que cria hábito).
- **Caixa acumulado** automático entre os dias (sem digitar saldo todo dia).
- **Caixa Manutenção** com depósito diário automático e meta de reserva.
- **Gamificação com propósito**: medalhas, estrelas, fases, sequência e conquistas, com confete.
- **Prioridades** que viram **meta mínima diária sugerida**.
- Visual **vermelho/laranja/preto** moderno, botões com borda animada e sombras.
- **Offline-first** (sinal ruim na rua não pode perder lançamento) — Fase 2.

### 1.5 Objetivos e métricas de sucesso
| Objetivo | Métrica | Meta (90 dias após lançamento) |
|---|---|---|
| Lançar rápido | Toques para registrar uma entrada | ≤ 3 toques / ≤ 5 s |
| Criar hábito | Dias fechados / dias abertos | ≥ 90% |
| Retenção | Usuários ativos 4 semanas seguidas | ≥ 40% |
| Valor percebido | Usuários que criaram ao menos 1 meta | ≥ 80% |
| Reserva | Usuários com depósito de manutenção ativo | ≥ 60% |
| Qualidade | Taxa de erro não tratado | < 1% das sessões |
| Performance | LCP em 4G médio | < 2,5 s |

### 1.6 Não objetivos (fora do escopo)
- Emissão de nota fiscal, declaração de imposto (MEI/IR) ou contabilidade oficial.
- Integração automática com Uber/99/inDrive (não existem APIs públicas para isso).
- Gestão de frotas com vários motoristas/empresas (possível versão futura).
- Pagamentos, cobrança ou bancos digitais dentro do app.
- Rastreamento por GPS em segundo plano.

### 1.7 Princípios de produto
1. **Velocidade acima de tudo:** o motorista está no carro. Toques grandes, poucas telas, teclado numérico próprio.
2. **Clareza do dinheiro:** o *Caixa Atual* é sempre o número mais visível.
3. **Segurança ao dirigir:** nada exige leitura longa; o app é usado com o carro parado.
4. **Nunca perder dado:** confirmar antes de apagar; desfazer sempre que possível; auditar fechamentos.
5. **Gamificação com propósito:** celebrar conquistas reais, sem punir falhas.
6. **Bonito de verdade:** microinterações, sombras, brilho e movimento com bom gosto (e opção de desligar).

---

## 2. Personas e cenários

### 2.1 Persona principal — Carlos, 38 anos
- Roda 10 h/dia em Uber e 99, celular no suporte do painel, sinal oscila.
- Quer saber o lucro real e juntar dinheiro para a revisão do carro.
- Não gosta de planilha; usa WhatsApp e Instagram o dia todo.

### 2.2 Persona secundária — Marina, 29 anos
- Dirige à noite e aos fins de semana para quitar o financiamento do carro.
- Quer metas mensais e ver o progresso; adora conquistas.

### 2.3 Persona futura (fora do MVP) — Frotista
Dono de 3–10 carros; só entra em versão futura.

### 2.4 Jornada típica de um dia
| Momento | O que o motorista faz | Funcionalidade |
|---|---|---|
| Manhã | Abre o app, confere saldo acumulado, bate ponto | Abrir dia |
| Corridas | Registra cada corrida (ou deixa para o fim) | Entrada rápida |
| Almoço/posto | Registra alimentação e combustível | Saída rápida |
| Meta batida | Recebe medalha e confete | Gamificação |
| Noite | Informa totais por plataforma, confere dinheiro, deposita na manutenção, fecha | Fechar dia |
| Domingo | Revisa semana, ajusta metas, paga prioridades | Relatórios / Metas / Prioridades |

---

## 3. Escopo e roadmap

### 3.1 Fases de construção (comandos dados ao agente do Antigravity)
> O desenvolvimento é conduzido em **7 fases**. Em cada uma o agente **entrevista o dono em português**, executa, entrega roteiro de teste e **só avança com a aprovação (SIM)** do dono. Detalhes em `docs/fases/`.

| Fase | Nome | Entrega principal | Plataforma |
|---|---|---|---|
| **1** | Fundação e Design System | Projeto base, tokens, componentes e `/design-system` | Web |
| **2** | Banco de dados (Supabase) e Acesso | Tabelas, RLS, funções, testes SQL; cadastro, login, onboarding | Web |
| **3** | Núcleo do caixa | Abrir dia, entradas/saídas, lista, extrato | Web |
| **4** | Fechamento, Caixa Manutenção e Prioridades | Fechar dia, conferência, reserva, contas | Web |
| **5** | Metas e gamificação | Metas, medalhas, estrelas, fases, conquistas, confete | Web |
| **6** | Histórico, relatórios, configurações, PWA e publicação | Relatórios, config. completas, LGPD, PWA, deploy | Web |
| **7** | **APK Android** (pasta `APK/`) | Mesmo sistema convertido em app Android e finalizado no Android Studio | **Android** |

### 3.2 Marcos de produto
| Marco | Entregas | Prioridade |
|---|---|---|
| **A — MVP web (Fases 1 a 6)** | Login/cadastro/recuperar senha; onboarding; abrir/fechar dia; entradas, saídas e lote por plataforma; caixa e extrato; Caixa Manutenção + depósito diário; metas (diária/semanal/mensal/anual) com medalhas, estrelas, fases e confete; prioridades; histórico e relatórios básicos; configurações; exportar CSV; PWA instalável | P0/P1 |
| **B — APK (Fase 7)** | App Android com as mesmas funções, design, APIs e banco; ajustes nativos (botão voltar, barras do sistema, links de e-mail, exportar arquivos); build de teste e release assinado; finalização no Android Studio; Play Store opcional | P0/P1 |
| **C — Qualidade e retenção (backlog)** | Offline com fila de sincronização; Realtime multi-dispositivo; notificações (web push e push nativo/FCM); biometria/PIN; plano de manutenção por km; abastecimentos e consumo; caixas personalizados; PDF; insights; login Google; compartilhar resumo | P1/P2 |

---

## 4. Glossário

| Termo | Significado |
|---|---|
| **Dia de trabalho** | Período entre *abrir* e *fechar* o dia. Pode atravessar a meia-noite. |
| **Bater ponto** | Ação de abrir (ou fechar) o dia, registrando horário e saldo. |
| **Caixa principal** | Caixa do dia a dia; recebe entradas e paga despesas. |
| **Caixa Manutenção** | Reserva separada (caixa 2) para manutenção futura do carro. |
| **Entrada** | Dinheiro que entra (corrida, gorjeta, bônus). |
| **Saída** | Dinheiro que sai (combustível, alimentação, crédito no app etc.). |
| **Transferência** | Movimento entre caixas (ex.: principal → manutenção); não é despesa. |
| **Conferência** | Comparar o saldo calculado com o dinheiro realmente em mãos. |
| **Meta** | Objetivo com período, métrica e valor-alvo. |
| **Ciclo de meta** | Uma ocorrência da meta (ex.: a meta diária de 09/10). |
| **Nível/Medalha** | Bronze, Prata ou Ouro, conforme o % da meta atingido. |
| **Estrelas** | Pontos ganhos por medalhas e conquistas; definem a **Fase**. |
| **Fase** | Estágio do motorista (Aprendiz → … → Lenda), baseado em estrelas. |
| **Prioridade** | Conta/obrigação a pagar, com nível de importância e vencimento. |
| **Lucro líquido** | Receita − despesas operacionais do caixa principal (ver RN-16). |
| **Sobra livre** | Lucro líquido − reserva de manutenção depositada no dia. |
| **APK** | Arquivo de instalação de aplicativo Android (usado para instalar fora da loja). |
| **AAB** | Android App Bundle: formato enviado à Google Play. |
| **Capacitor** | Ferramenta que empacota o web app como aplicativo Android. |
| **Android Studio** | Programa oficial do Google para abrir, testar e gerar o app Android. |
| **Keystore** | Arquivo de chave usado para assinar o app. **Perder = não conseguir atualizar.** |
| **Emulador (AVD)** | Celular virtual dentro do computador, para testar o app. |
| **WebView** | Parte do Android que exibe as telas web dentro do app. |
| **Deep link** | Link (ex.: do e-mail de confirmação) que abre o app diretamente. |
| **Sincronizar (`cap sync`)** | Copiar o build web para o projeto Android. |

---

## 5. Arquitetura e stack

### 5.1 Stack recomendada
| Camada | Tecnologia | Motivo |
|---|---|---|
| Front-end | **React 18 + TypeScript + Vite** | SPA simples, build estático (ideal para Capacitor/APK) |
| Estilo | **Tailwind CSS** + CSS variables (tokens) | Velocidade e consistência visual |
| Animação | **Framer Motion** | Transições e microinterações |
| Confete | **canvas-confetti** | Efeito de confete/serpentina leve |
| Ícones | **lucide-react** | Conjunto consistente e leve |
| Gráficos | **Recharts** (carregado sob demanda) | Relatórios |
| Estado de servidor | **TanStack Query** | Cache, *refetch*, fila de mutações (offline) |
| Estado de UI | **Zustand** | Pequeno e simples |
| Formulários | **React Hook Form + Zod** | Validação tipada |
| Rotas | **React Router** | Navegação e rotas protegidas |
| Datas | **date-fns + date-fns-tz** | Fuso `America/Sao_Paulo` |
| Backend | **Supabase** (Postgres, Auth, RLS, Realtime, Storage, Edge Functions) | Mesmo banco para web e APK |
| PWA | **vite-plugin-pwa** | Instalável e offline |
| APK | **Capacitor** (`@capacitor/android`), **Fase 7**, pasta `APK/` | Reaproveita 100% do front |
| Testes | **Vitest + Testing Library + Playwright** | Unidade, componente e E2E |
| Qualidade | **ESLint + Prettier + TypeScript estrito** | Código limpo |
| Monitoramento | **Sentry** (sem dados pessoais) | Erros em produção |
| Hospedagem | **Vercel, Netlify ou Cloudflare Pages** | Deploy contínuo |

> **Por que Vite SPA e não Next.js?** App privado (logado), sem necessidade de SSR/SEO; build estático simplifica o empacotamento em APK.
> **Região do Supabase:** `sa-east-1` (São Paulo) para menor latência.

### 5.2 Visão de arquitetura
```
┌────────────────────┐        ┌───────────────────────────┐
│  Web App (PWA)     │        │   Supabase                │
│  React + Vite      │◄──────►│  Auth (e-mail/senha)      │
│  (mesmo código)    │  HTTPS │  Postgres + RLS + RPCs    │
└────────▲───────────┘        │  Realtime / Storage       │
         │ empacota           │  Edge Functions           │
┌────────┴───────────┐        └───────────────────────────┘
│  APK (Capacitor)   │  ← mesmo banco, mesmas regras, mesmas telas
└────────────────────┘
```
**Regra de ouro:** cálculos financeiros críticos (saldo, resumo do dia, fechamento, progresso de metas) ficam **no banco** (views e funções RPC), para web e APK sempre concordarem. O front só exibe e formata.

### 5.3 Estrutura de pastas
```
drivecash/
├─ supabase/
│  ├─ migrations/        0001_schema.sql · 0002_rls.sql · 0003_funcoes.sql · 0004_seeds.sql · 0005_fase2.sql
│  ├─ tests/             testes SQL (pgTAP ou scripts)
│  └─ functions/delete-account/index.ts
├─ src/
│  ├─ app/               router, providers, layout, guards
│  ├─ components/ui/     Button, Card, Input, MoneyInput, Sheet, Modal, Toast, Tabs, BottomNav,
│  │                     ProgressRing, Skeleton, Chip, Badge, EmptyState, Medalha
│  ├─ features/          auth · onboarding · dia · lancamentos · caixa · manutencao · metas ·
│  │                     gamificacao · prioridades · relatorios · veiculo · configuracoes
│  ├─ lib/               supabase.ts · money.ts · datas.ts · confete.ts · haptics.ts · erros.ts · config.ts
│  ├─ hooks/  styles/  types/ (database.types.ts gerado pelo Supabase)
├─ public/               ícones PWA, manifest, favicon
├─ tests/e2e/            Playwright
├─ docs/                 PRD.md · REGRAS_DO_AGENTE.md · PROGRESSO.md · DECISOES.md · IDEIAS.md · fases/
└─ APK/                  ← criada na FASE 7 (não existe antes). Projeto Android; ver seção 15.4
   ├─ package.json · capacitor.config.ts · scripts/ · www/ (gerado) · android/ · resources/ · keystore/ · README_APK.md
```

### 5.4 Variáveis de ambiente
```
VITE_SUPABASE_URL=...            # pública
VITE_SUPABASE_ANON_KEY=...       # pública (protegida por RLS)
VITE_SENTRY_DSN=...              # opcional
# NUNCA colocar SUPABASE_SERVICE_ROLE_KEY no front-end ou no repositório.
```
Criar `.env.example` (sem valores reais) e `.env` no `.gitignore`.

### 5.5 Convenções de código
- TypeScript `strict: true`; sem `any` (exceto casos justificados em comentário).
- Nomes de domínio em **português** (`lancamento`, `caixa`, `meta`), código de infraestrutura em inglês técnico (`useQuery`, `handler`).
- Componentes em `PascalCase`, hooks `useAlgo`, arquivos de feature em `kebab-case`.
- Funções puras de cálculo em `src/lib` com testes (ex.: `calcularNivelMeta`, `formatarMoeda`).
- Nenhum acesso direto ao Supabase em componentes de UI: usar hooks em `features/*/api.ts`.
- Textos de interface centralizados em `src/lib/textos.ts` (preparado para i18n).

### 5.6 Ambientes
`desenvolvimento` (Supabase local ou projeto *dev*) · `produção` (projeto Supabase separado). Migrações versionadas e aplicadas via Supabase CLI. Branch `main` = produção; PRs obrigatórios com CI (lint + typecheck + testes).

---

## 6. Regras de negócio (RN)

> Estas regras são **normativas**. Em caso de conflito com qualquer outra seção, vale a regra de negócio.

### 6.1 Fundamentos

**RN-01 — Dinheiro**
- Todo valor é **inteiro em centavos** (R$ 12,34 = `1234`). Proibido `float` para dinheiro.
- Exibição: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Entrada de valor com máscara estilo banco: o usuário digita só números e a vírgula "anda" (`1` → 0,01 · `12` → 0,12 · `12345` → 123,45).
- Percentuais sobre dinheiro são arredondados para o **centavo mais próximo** (`Math.round`).
- Valores de lançamento: `> 0` e `≤ R$ 1.000.000,00` (validação no front **e** no banco).

**RN-02 — Datas e fuso**
- Timestamps salvos em UTC (`timestamptz`); exibidos em `America/Sao_Paulo` (ou fuso do perfil).
- Cada dia de trabalho tem uma **`data_referencia`** (data local de abertura). Todo lançamento herda a `data_referencia` do dia em que foi feito — **mesmo que ocorra após a meia-noite**.
- Semana começa na **segunda-feira** (configurável: domingo ou segunda).

**RN-03 — Caixas**
- Todo usuário tem, desde o cadastro, **dois caixas automáticos**: **Caixa principal** e **Caixa Manutenção**. (Caixas personalizados: P2.)
- **Saldo nunca é digitado/armazenado como número editável.** Saldo = `saldo_inicial` + Σ lançamentos assinados (entradas, transferências recebidas e ajustes positivos somam; saídas, transferências enviadas e ajustes negativos subtraem), ignorando lançamentos excluídos.
- O **saldo inicial** do caixa principal é definido no onboarding ("quanto dinheiro você tem em mãos agora?").

### 6.2 Dia de trabalho

**RN-04 — Estados e unicidade**
- Estados: `aberto` e `fechado`.
- **Apenas um dia aberto por vez** por usuário (garantido por índice único parcial).
- **Uma linha por `data_referencia`**: se o motorista tenta abrir um dia numa data que já existe (fechado), o app oferece **reabrir** em vez de criar outro.
- O dia **pode atravessar a meia-noite** (turno da noite). Ele só termina quando o usuário o fecha.

**RN-05 — Abertura ("bater ponto")**
- `saldo_abertura` = saldo atual do **caixa principal** no momento da abertura (que é o saldo de fechamento do dia anterior, acumulado).
- O usuário pode **ajustar** o saldo de abertura ao confirmar que o dinheiro em mãos é outro; o app cria um lançamento **`ajuste_entrada`/`ajuste_saida`** (origem `ajuste_abertura`) com a diferença e registra o motivo (opcional).
- `km_inicial` opcional (se houver veículo cadastrado, pré-preenche com o km atual).
- Registra `aberto_em` com data/hora exata.

**RN-06 — Dia esquecido aberto**
- Se existe dia `aberto` de data anterior ao dia local atual, ao abrir o app mostrar **banner bloqueante amigável**: "Você esqueceu de fechar o dia 08/10. Vamos fechar agora?" → leva ao fluxo de fechamento (com opção "fechar sem conferência").
- Não é possível abrir novo dia enquanto houver um aberto.

**RN-07 — Entradas**
- Obrigatórios: `valor`, `plataforma` (pode ser "Particular" ou "Outros"). `categoria` padrão = "Corridas".
- `qtd_corridas` padrão **1** (editável: 1–999). Gorjeta/bônus entram como categorias próprias com `qtd_corridas = 0`.
- Campos opcionais: horário (padrão = agora), km da corrida, duração (min), meio de pagamento (dinheiro, Pix, saldo do app, outro), observação.
- Entradas só podem ser lançadas no **caixa principal** (ou caixas personalizados, P2).

**RN-08 — Lote por plataforma ("resumo do dia")**
- No fechamento (ou a qualquer momento) o usuário informa **um total por plataforma** (valor + nº de corridas). Cada total gera **um lançamento de entrada** com `origem = 'resumo_dia'`.
- Se já houve lançamentos individuais da mesma plataforma, o app mostra o subtotal e permite **somar** (padrão) ou **substituir** (excluir os individuais da plataforma com confirmação).

**RN-09 — Saídas**
- Obrigatórios: `valor` e `categoria`. Categorias possuem **natureza**: `operacional` (despesa do trabalho) ou `retirada_pessoal` (dinheiro que o motorista tira para si; **não** entra no lucro).
- **Caixa de origem** padrão = principal. Pode ser **Manutenção** (ex.: pagar o mecânico com a reserva).
- Saída do **principal** pode deixar o saldo negativo, **com alerta** ("Seu caixa ficou negativo em R$ X — confira se faltou lançar alguma entrada").
- Saída da **Manutenção** é **limitada ao saldo da reserva**. Se o gasto for maior, o app oferece **dividir**: parte da reserva + parte do caixa principal (dois lançamentos).

**RN-10 — Transferências**
- Movem dinheiro entre caixas sem afetar receita, despesa ou lucro. Geram **dois lançamentos espelhados** (`transferencia_saida` na origem, `transferencia_entrada` no destino) ligados pelo mesmo `transferencia_id`.
- Não podem exceder o saldo da origem (erro `SALDO_INSUFICIENTE`).

**RN-11 — Depósito diário de manutenção**
- Configuração do usuário: `modo` = `fixo` (R$ X por dia), `percentual` (% do **lucro líquido** do dia) ou `desativado`.
- No **fechamento do dia**, o app **sugere** o depósito calculado, limitado ao saldo disponível do caixa principal. O usuário pode **editar, confirmar ou pular** ("hoje não").
- Depósito confirmado = **transferência** principal → manutenção (origem `deposito_manutencao`).
- (P2) Depósitos pulados podem ser acumulados como "reposição sugerida".

**RN-12 — Fechamento do dia (sequência obrigatória)**
1. Revisar lançamentos e, se quiser, adicionar **lote por plataforma** (RN-08).
2. Informar `km_final` e `minutos_online` (opcionais).
3. **Conferência opcional** (RN-13).
4. **Depósito de manutenção** (RN-11).
5. Confirmar → o sistema, em uma única transação: cria o ajuste de conferência (se houver), depois a transferência do depósito, grava **snapshot** do resumo em `dias_trabalho.resumo`, define `saldo_fechamento`, marca `fechado` e registra `fechado_em`.
6. Em seguida o front chama a atualização de **metas** e exibe **resumo + celebrações**.
- O fechamento é **atômico** (tudo ou nada) e **idempotente** (fechar duas vezes retorna erro `DIA_JA_FECHADO`).

**RN-13 — Conferência (falta/sobra)**
- O usuário informa o **dinheiro realmente em mãos**, contado **antes de separar a reserva de manutenção**. Se diferente do saldo calculado: diferença = informado − calculado.
- Diferença > 0 → **sobra**; < 0 → **falta**. Gera lançamento de ajuste (origem `conferencia`) e fica registrada em `diferenca_conferencia_centavos`.
- Não conta como receita nem despesa; aparece no resumo como "Ajuste de conferência".

**RN-14 — Reabrir dia**
- Permitido **somente** para o **último dia fechado**, e **somente se não houver dia aberto**.
- Ao reabrir: o depósito de manutenção e o ajuste de conferência daquele fechamento são **estornados** (marcados como excluídos) e o dia volta a `aberto`; ao fechar de novo, tudo é recalculado.
- Dias mais antigos são **somente leitura**. Correção = lançamento de ajuste no dia atual.

**RN-15 — Edição e exclusão**
- Lançamentos de dia **aberto** podem ser editados/excluídos. Dia **fechado** bloqueia qualquer alteração (erro `DIA_FECHADO`).
- Exclusão é **lógica** (`excluido_em`), com **desfazer por 6 segundos**.
- Toda alteração relevante registra **auditoria** (quem, quando, antes/depois).

### 6.3 Indicadores

**RN-16 — Fórmulas oficiais (por dia, semana, mês, ano)**
| Indicador | Fórmula |
|---|---|
| **Receita bruta** | Σ entradas |
| **Despesas** | Σ saídas `operacionais` pagas pelo **caixa principal** |
| **Despesas pagas pela reserva** | Σ saídas pagas pelo **Caixa Manutenção** (mostradas à parte; não reduzem o lucro do dia porque já foram provisionadas pelos depósitos) |
| **Retiradas pessoais** | Σ saídas de natureza `retirada_pessoal` |
| **Lucro líquido** | Receita bruta − Despesas |
| **Reserva depositada** | Σ transferências para o Caixa Manutenção |
| **Sobra livre** | Lucro líquido − Reserva depositada |
| **Caixa de fechamento** | Abertura + Receita − Despesas − Retiradas − Reserva ± Ajustes |
| **Ticket médio** | Receita bruta ÷ nº de corridas |
| **Ganho por hora** | Lucro líquido ÷ horas online (se informado) |
| **Lucro por km** | Lucro líquido ÷ km rodados (se informado) |

### 6.4 Metas, medalhas e fases

**RN-17 — Metas**
- Campos: `titulo`, `periodo` (`diaria`, `semanal`, `mensal`, `anual`), `metrica`, `valor_alvo`, `pct_bronze` (padrão 70), `pct_prata` (padrão 100), `pct_ouro` (padrão 130), `recorrente` (padrão sim), `ativa`.
- **Métricas:**
  - MVP: `receita_bruta`, `lucro_liquido`, `corridas`, `dias_trabalhados`, `reserva_manutencao`.
  - P1: `km_rodados`, `minutos_online` (exibidos como horas).
- Validação: `pct_bronze < pct_prata < pct_ouro`; `valor_alvo > 0`.
- **Prata = a meta em si (100%).** Bronze = "meta mínima". Ouro = "meta desafio".
- Podem existir várias metas ativas ao mesmo tempo (ex.: receita diária **e** corridas diárias).

**RN-18 — Ciclos e progresso**
- Cada meta gera um **ciclo** por período (ex.: meta diária → um ciclo por `data_referencia`). Ciclo guarda **snapshot** do alvo e dos percentuais (editar a meta **não** altera ciclos passados).
- Períodos: **diário** = `data_referencia`; **semanal** = semana conforme configuração; **mensal** = mês civil; **anual** = ano civil.
- Valor do ciclo = métrica calculada sobre lançamentos/dias dentro do período (função `fn_valor_metrica`).
- O progresso é recalculado **após cada lançamento, edição, exclusão e fechamento** (chamada `rpc_atualizar_metas`).
- Meta recorrente gera ciclos automaticamente; ciclos passados são **consolidados** (status `consolidado`).

**RN-19 — Medalhas e estrelas**
| Nível | Condição | Estrelas (acumuladas no ciclo) |
|---|---|---|
| Nenhum | abaixo de bronze | 0 |
| 🥉 **Bronze** | ≥ `pct_bronze` do alvo | 1 |
| 🥈 **Prata** | ≥ `pct_prata` do alvo | 3 |
| 🥇 **Ouro** | ≥ `pct_ouro` do alvo | 5 |

- **Multiplicador por período:** diária ×1 · semanal ×3 · mensal ×10 · anual ×50.
- Estrelas concedidas = (estrelas do novo nível − estrelas do maior nível já alcançado no ciclo) × multiplicador. Ex.: ir direto a Ouro numa meta diária = **5 ⭐**; subir de Bronze (1) para Prata (3) rende **+2 ⭐**.
- **Monotônico:** o nível máximo alcançado no ciclo **não é revogado** se o valor cair depois (evita frustração).
- Cada **novo nível desbloqueado** dispara **celebração** uma única vez por ciclo.

**RN-20 — Fases (mudança de fase)**
| Fase | Nome | Estrelas totais mínimas |
|---|---|---|
| 1 | Aprendiz | 0 |
| 2 | Estradeiro | 25 |
| 3 | Profissional | 100 |
| 4 | Veterano | 300 |
| 5 | Mestre do Volante | 700 |
| 6 | Elite | 1.500 |
| 7 | Lenda | 3.000 |
- Ao cruzar o limiar, a **fase muda** com modal especial (efeito máximo de confete/serpentina) e o avatar/moldura muda de cor/brilho.

**RN-21 — Sequência (streak)**
- Conta **dias consecutivos de trabalho fechados** (abre e fecha o dia). Dias de folga **configurados** (dias da semana que o usuário não trabalha) **não quebram** a sequência.
- Meta secundária: **sequência de metas diárias batidas** (Prata ou mais).

**RN-22 — Conquistas**
- Catálogo fixo (Anexo C). Cada conquista desbloqueia **uma vez**, dá **estrelas bônus** e dispara celebração. A avaliação roda após fechar o dia, bater meta ou pagar prioridade.

**RN-23 — Celebração**
| Evento | Efeito |
|---|---|
| Bronze | Explosão pequena de confete + medalha 🥉 |
| Prata | Duas explosões + medalha 🥈 com brilho |
| Ouro | Confete em tela cheia + **serpentinas** + medalha 🥇 + vibração (se ativa) |
| Mudança de fase | Sequência completa (ouro) + modal com nova fase |
| Conquista | Confete médio + toast "Conquista desbloqueada" |
- Respeitar `prefers-reduced-motion` e a opção "Efeitos" nas configurações (desligado = só medalha estática + toast).

### 6.5 Prioridades

**RN-24 — Prioridades (contas e obrigações)**
- Campos: `titulo`, `valor`, `vencimento`, `nivel` (`alta`, `media`, `baixa`), `recorrencia` (`nenhuma`, `semanal`, `mensal`, `anual`), `observacao`, `status` (`pendente`, `pago`, `cancelada`).
- **Ordenação padrão:** vencidas primeiro → por vencimento → por nível (alta > média > baixa).
- **Marcar como paga:** abre sheet para escolher o caixa de origem e cria **saída vinculada** (categoria escolhida). Se recorrente, cria a próxima ocorrência automaticamente.

**RN-25 — Meta mínima diária sugerida**
- Para cada prioridade **pendente** com vencimento dentro do horizonte (30 dias): `necessidade_dia = valor ÷ max(1, dias_de_trabalho_restantes_até_o_vencimento)`.
- `dias_de_trabalho_restantes = ceil((vencimento − hoje + 1) × dias_trabalho_por_semana ÷ 7)`.
- **Meta mínima sugerida** = Σ `necessidade_dia`. Botão **"Usar como meta diária"** cria/atualiza a meta diária de receita.

### 6.6 Conta, sessão e dados

**RN-26 — Autenticação e sessão**
- E-mail + senha (Supabase Auth). Senha ≥ 8 caracteres, com letra e número. Sessão persistente com renovação automática de token.
- Toda leitura/escrita exige usuário autenticado; isolamento por **RLS** (`user_id = auth.uid()`).

**RN-27 — Exclusão de conta e LGPD**
- O usuário pode **exportar todos os dados** (CSV/JSON) e **excluir a conta** (apaga auth + todos os dados em cascata) após confirmação digitando "EXCLUIR".

**RN-28 — Notificações (Fase 2/3)**
- Lembretes configuráveis: abrir o dia, fechar o dia, depósito pendente, meta próxima (≥ 80%), vencimento de prioridade (D-2 e D-0). Padrão: **desligadas** até o usuário ativar.

**RN-29 — Offline (Fase 2)**
- Lançamentos (entrada/saída) funcionam offline com **IDs gerados no cliente (UUID v4)**, fila persistente e sincronização idempotente (`insert … on conflict (id) do nothing`).
- **Abrir/fechar/reabrir dia exigem internet** (operações financeiras críticas e atômicas). O app avisa claramente.

---

## 7. Requisitos funcionais (RF)

> Formato: **ID · Requisito · Prioridade · Critério de aceite**.

### 7.1 Autenticação (AUT)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-AUT-01 | Cadastro com nome, e-mail, senha e confirmação | P0 | Valida formato de e-mail, senha ≥ 8 (letra+número), senhas iguais; erros claros por campo; ao concluir cria perfil, caixas, plataformas e categorias padrão |
| RF-AUT-02 | Login com e-mail e senha | P0 | Sessão persiste ao fechar/abrir; erro genérico "E-mail ou senha incorretos" |
| RF-AUT-03 | Recuperar senha por e-mail | P0 | Envia link; tela "Nova senha" funciona; mensagem não revela se o e-mail existe |
| RF-AUT-04 | Logout | P0 | Encerra sessão e limpa cache local de dados |
| RF-AUT-05 | Rotas protegidas | P0 | Sem sessão → `/entrar`; com sessão em `/entrar` → `/` |
| RF-AUT-06 | Mostrar/ocultar senha; compatível com gerenciador de senhas | P0 | Atributos `autocomplete` corretos |
| RF-AUT-07 | Alterar senha e e-mail logado | P1 | Exige senha atual ou reautenticação recente |
| RF-AUT-08 | Proteção contra tentativas excessivas | P1 | Mensagem amigável ao atingir limite do Supabase |
| RF-AUT-09 | Login com Google | P2 | OAuth funcionando na web e no APK |
| RF-AUT-10 | Desbloqueio por biometria/PIN no APK | P2 | Solicita ao abrir após 5 min em segundo plano |

### 7.2 Onboarding (ONB)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-ONB-01 | Assistente de 5 passos: (1) nome, (2) veículo, (3) plataformas, (4) dinheiro em mãos agora (saldo inicial), (5) meta diária e depósito diário de manutenção | P0 | Pode **pular** passos opcionais; ao concluir marca `onboarding_concluido`; saldo inicial vira `saldo_inicial` do caixa principal |
| RF-ONB-02 | Reeditar configurações do onboarding depois | P1 | Tudo editável em Configurações |
| RF-ONB-03 | Tour de 3 dicas na primeira Home | P2 | Pode dispensar; não reaparece |

### 7.3 Dia de trabalho (DIA)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-DIA-01 | Cartão "Abrir o dia" na Home quando não há dia aberto | P0 | Mostra saldo acumulado e botão principal |
| RF-DIA-02 | Tela/sheet de abertura com saldo anterior, opção "Ajustar valor", km inicial e botão **"Bater ponto — Abrir dia"** | P0 | Cria dia `aberto` com horário; animação de "ponto batido"; ajuste gera lançamento de ajuste |
| RF-DIA-03 | Home com dia aberto: tempo decorrido, caixa atual ao vivo | P0 | Cronômetro atualiza a cada minuto |
| RF-DIA-04 | Detectar dia esquecido (RN-06) | P0 | Banner/modal ao abrir o app |
| RF-DIA-05 | Fechar dia em **stepper de 4 passos** (Resumo → Lote por plataforma → Conferência/Km → Manutenção e confirmação) | P0 | Respeita RN-12; barra de progresso; pode voltar passos |
| RF-DIA-06 | Conferência de caixa opcional | P0 | Mostra calculado × informado × diferença (sobra/falta) |
| RF-DIA-07 | Depósito de manutenção sugerido no fechamento | P0 | Valor sugerido por modo configurado; editar/pular |
| RF-DIA-08 | Tela de resumo final com celebração das metas atingidas | P0 | Mostra receita, despesas, lucro, reserva, sobra livre, caixa final, medalhas ganhas |
| RF-DIA-09 | Reabrir último dia fechado | P1 | Segue RN-14 com confirmação |
| RF-DIA-10 | Compartilhar resumo do dia como imagem (WhatsApp) | P2 | Gera imagem com marca e números |

### 7.4 Lançamentos (LAN)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-LAN-01 | **Entrada rápida** (botão "+ Entrada"): teclado numérico próprio, valor, chips de plataforma, nº de corridas (stepper), botão Salvar | P0 | Registra em **≤ 3 toques**; salva em < 1 s (otimista) |
| RF-LAN-02 | Campos extras da entrada (categoria, horário, km, observação, meio de pagamento) em "Mais detalhes" | P0 | Recolhido por padrão |
| RF-LAN-03 | **Saída rápida**: valor, grade de categorias com ícones, caixa de origem, observação | P0 | Segue RN-09 |
| RF-LAN-04 | **Lote por plataforma** (resumo do dia) | P0 | Segue RN-08 |
| RF-LAN-05 | Lista do dia com swipe para editar/excluir | P0 | Ordenada do mais recente; agrupa por hora |
| RF-LAN-06 | Editar lançamento | P0 | Atualiza saldos e metas |
| RF-LAN-07 | Excluir com **desfazer (6 s)** | P0 | Soft delete; metas recalculadas |
| RF-LAN-08 | Valores rápidos (chips R$ 5/10/20/50/100) e "repetir último" | P1 | Configurável |
| RF-LAN-09 | **Modelos de lançamento** (ex.: "Almoço R$ 25", "Crédito app R$ 30") | P1 | Criar/editar/excluir; 1 toque lança |
| RF-LAN-10 | Bloqueio em dia fechado com atalho "Reabrir dia" | P0 | Mensagem clara (`DIA_FECHADO`) |
| RF-LAN-11 | Alerta de saldo negativo no caixa principal | P1 | Banner não bloqueante |
| RF-LAN-12 | Foto de recibo (Supabase Storage) | P2 | Limite 2 MB, compressão no cliente |
| RF-LAN-13 | Ditar valor por voz | P2 | Web Speech API quando disponível |

### 7.5 Caixa (CAI)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-CAI-01 | Tela **Caixa**: saldo atual, abertura, entradas, saídas, extrato cronológico agrupado por dia | P0 | Saldo bate com Σ do extrato |
| RF-CAI-02 | Filtros: período, tipo, plataforma, categoria, caixa, busca por texto | P1 | Filtros combináveis; limpar com 1 toque |
| RF-CAI-03 | Seletor de caixa (Principal / Manutenção) no topo | P0 | Troca extrato e saldo |
| RF-CAI-04 | Transferência manual entre caixas | P1 | Segue RN-10 |
| RF-CAI-05 | Caixas personalizados (ex.: IPVA, Viagem) | P2 | CRUD; entram em transferências |

### 7.6 Caixa Manutenção (MAN)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-MAN-01 | Caixa Manutenção criado automaticamente | P0 | Existe desde o cadastro |
| RF-MAN-02 | Configurar depósito diário (fixo, percentual ou desativado) | P0 | Salvo em configurações; usado no fechamento |
| RF-MAN-03 | Tela do Caixa Manutenção: saldo, histórico de depósitos e gastos | P0 | Lista paginada |
| RF-MAN-04 | **Meta de reserva** opcional (ex.: R$ 1.500) com barra de progresso e projeção ("no ritmo atual você chega lá em N dias") | P1 | Projeção usa média dos últimos 14 depósitos |
| RF-MAN-05 | Pagar manutenção com a reserva (saída com caixa = Manutenção), com divisão automática se exceder | P0 | Segue RN-09 |
| RF-MAN-06 | Plano de manutenção por km/tempo (óleo, pneus, freios) com alertas | P2 | Usa `manutencoes_programadas` |
| RF-MAN-07 | Reposição de depósitos pulados | P2 | Sugestão opcional |

### 7.7 Metas (MET)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-MET-01 | Criar meta (período, métrica, valor, níveis, recorrência) com prévia dos níveis em R$ | P0 | Valida RN-17 |
| RF-MET-02 | Editar, pausar, arquivar meta | P0 | Ciclos passados preservados |
| RF-MET-03 | Painel de metas com **anel de progresso** e marcos 🥉🥈🥇 | P0 | Atualiza em tempo real após lançar |
| RF-MET-04 | Meta diária em destaque na Home | P0 | Anel + "faltam R$ X" |
| RF-MET-05 | Detalhe da meta: histórico de ciclos, melhor ciclo, gráfico | P1 | Barras por ciclo com cor do nível |
| RF-MET-06 | Ritmo/projeção ("faltam R$ X ≈ Y corridas no seu ticket médio") | P1 | Usa ticket médio dos últimos 14 dias |
| RF-MET-07 | Sugestão de meta baseada no histórico (média 14 dias + 10%) | P1 | Botão "Aceitar sugestão" |
| RF-MET-08 | Metas de período livre (ex.: "até o fim de dezembro") | P2 | — |
| RF-MET-09 | Recompensa pessoal vinculada à meta (ex.: "jantar fora") | P2 | Exibida ao atingir |

### 7.8 Gamificação (GAM)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-GAM-01 | Desbloqueio de medalha com animação e confete/serpentina | P0 | Uma celebração por nível/ciclo (RN-19/23) |
| RF-GAM-02 | Estrelas e **Fases** exibidas no topo e no perfil | P0 | Barra até a próxima fase |
| RF-GAM-03 | Modal de **mudança de fase** | P0 | Efeito máximo; botão "Continuar" |
| RF-GAM-04 | Tela **Conquistas** (galeria; bloqueadas em cinza com dica) | P1 | Catálogo do Anexo C |
| RF-GAM-05 | Sequência (🔥) na Home | P1 | Conforme RN-21 |
| RF-GAM-06 | Configurar efeitos, som e vibração | P0 | Persistido por usuário |
| RF-GAM-07 | Compartilhar medalha/fase como imagem | P2 | — |

### 7.9 Prioridades (PRI)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-PRI-01 | CRUD de prioridades | P0 | Campos da RN-24 |
| RF-PRI-02 | Ordenação inteligente e destaque de vencidas | P0 | Vencida em vermelho com ícone ⚠️ |
| RF-PRI-03 | Marcar como paga cria saída vinculada | P0 | Escolhe caixa e categoria; atualiza saldos |
| RF-PRI-04 | Meta mínima diária sugerida (RN-25) | P1 | Botão "Usar como meta diária" |
| RF-PRI-05 | Recorrência gera próxima ocorrência | P1 | Ao pagar, cria a seguinte |
| RF-PRI-06 | Cartão "Próximas contas" na Home (3 itens) | P1 | Toque abre a tela |
| RF-PRI-07 | Alertas de vencimento (notificação) | P2 | Conforme RN-28 |

### 7.10 Histórico e relatórios (REL)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-REL-01 | Histórico de dias (lista com receita, lucro, medalha) | P0 | Paginação infinita |
| RF-REL-02 | Detalhe do dia fechado (resumo, lançamentos, conferência, observações) | P0 | Somente leitura |
| RF-REL-03 | Calendário *heatmap* (intensidade pelo lucro; ícone de medalha) | P1 | Toque abre o dia |
| RF-REL-04 | Relatório por período (semana/mês/ano/personalizado) com indicadores da RN-16 | P1 | Valores conferem com o extrato |
| RF-REL-05 | Gráficos: evolução diária, receita por plataforma, despesas por categoria, melhores dias da semana | P1 | Recharts com carregamento sob demanda |
| RF-REL-06 | Comparativo com o período anterior (▲/▼ %) | P1 | — |
| RF-REL-07 | Exportar CSV (lançamentos e dias) | P1 | Abre no Excel com acentos corretos (UTF-8 BOM) |
| RF-REL-08 | Exportar PDF do relatório | P2 | — |
| RF-REL-09 | Insights automáticos ("Sexta é seu melhor dia") | P2 | Mínimo 14 dias de dados |

### 7.11 Veículo (VEI)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-VEI-01 | Cadastrar veículo (apelido, marca, modelo, ano, placa, combustível, km atual) | P1 | Placa opcional |
| RF-VEI-02 | Atualizar km atual ao abrir/fechar dia | P1 | Usa km inicial/final |
| RF-VEI-03 | Custo e lucro por km | P1 | Segue RN-16 |
| RF-VEI-04 | Abastecimentos (litros, preço, km) e consumo médio | P2 | Tabela `abastecimentos` |

### 7.12 Configurações (CFG)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-CFG-01 | Perfil (nome, avatar) | P0 | — |
| RF-CFG-02 | Plataformas: criar, editar cor, ordenar, desativar | P0 | Não exclui se houver lançamentos (apenas desativa) |
| RF-CFG-03 | Categorias de entrada/saída: criar, editar, ícone, cor, natureza | P0 | Categorias de sistema não podem ser excluídas |
| RF-CFG-04 | Depósito de manutenção (modo e valor) | P0 | — |
| RF-CFG-05 | Início da semana, dias de trabalho por semana, dias de folga | P1 | Afeta streak e RN-25 |
| RF-CFG-06 | Efeitos, som e vibração | P0 | — |
| RF-CFG-07 | Notificações | P2 | — |
| RF-CFG-08 | Exportar meus dados | P1 | RN-27 |
| RF-CFG-09 | Excluir minha conta | P1 | RN-27 |
| RF-CFG-10 | Termos de uso, Política de Privacidade, versão do app | P0 | Páginas estáticas |

### 7.13 PWA e sincronização (SYN)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-SYN-01 | App instalável (manifest, ícones, *splash*) | P0 | Passa no Lighthouse PWA |
| RF-SYN-02 | Indicador online/offline | P1 | Chip discreto no topo |
| RF-SYN-03 | Lançamentos offline com fila e sincronização | P2 | RN-29 |
| RF-SYN-04 | Realtime: alteração em um dispositivo aparece no outro | P2 | Supabase Realtime |

### 7.14 APK Android (APK)
> Escopo da **Fase 7**. Todas as funções das seções 7.1 a 7.13 (exceto itens P2) devem existir **idênticas** no app Android; os requisitos abaixo tratam do que é **específico** do Android.

| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-APK-01 | Pasta **`APK/`** na raiz com projeto Capacitor próprio, sem alterar regras de negócio | P0 | A pasta existe; `npm run android:sync` gera o app com a mesma interface do web |
| RF-APK-02 | Reaproveitar o código web sem duplicar (build web → `APK/www` → sincronizar) | P0 | Um único comando atualiza o app; alterar `src/` reflete após o comando. *(Alternativa B só se escolhida)* |
| RF-APK-03 | Identidade do app: nome exibido, `applicationId` (pacote), `versionName` e `versionCode` | P0 | Valores definidos na entrevista e registrados em `DECISOES.md` |
| RF-APK-04 | Ícone adaptativo e *splash screen* (preta, com a marca) | P0 | Aparecem corretamente em emulador e celular real |
| RF-APK-05 | Orientação retrato (ou a escolhida na entrevista) | P0 | App não gira se retrato |
| RF-APK-06 | `minSdk` conforme entrevista e `targetSdk` exigido pela Google Play (hoje API 36; confirmar) | P0 | Build compila e roda nos aparelhos-alvo |
| RF-APK-07 | **Paridade funcional total** com o web (Anexo H) | P0 | Nenhum item do Anexo H com diferença |
| RF-APK-08 | Mesmo Supabase por variáveis de build; **sem `service_role`** | P0 | Login e dados idênticos ao web; busca por `service_role` no pacote não encontra nada |
| RF-APK-09 | Mesmo design: cores, fontes locais, efeitos e confete; sem zoom/seleção indevidos | P0 | Comparação visual lado a lado aprovada pelo dono |
| RF-APK-10 | **Botão voltar** do Android tratado (fecha sheets/modais → volta rota → "toque de novo para sair") | P0 | Testado em todas as telas principais |
| RF-APK-11 | Barras do sistema escuras e **áreas seguras** corretas | P0 | Nada fica atrás das barras em Android antigo e novo |
| RF-APK-12 | Teclado não cobre campos; teclado numérico próprio continua | P0 | Testado nos formulários |
| RF-APK-13 | **Sessão persistente** (Preferences) | P0 | Continua logado após fechar o app e reiniciar o celular |
| RF-APK-14 | **Deep links** para confirmar e-mail e recuperar senha | P0 | Link do e-mail abre o app e conclui o fluxo |
| RF-APK-15 | **Exportar dados/CSV** via Filesystem + Compartilhar | P0 | Arquivo é salvo/compartilhado e abre no Excel/Planilhas |
| RF-APK-16 | Indicador online/offline via plugin de rede | P1 | Muda ao ligar/desligar a internet |
| RF-APK-17 | Vibração nativa (haptics) em salvar, medalha e fase | P1 | Respeita a configuração de vibração |
| RF-APK-18 | Service worker e prompt de instalação **desativados** no app | P0 | Sem registro de service worker no build Android |
| RF-APK-19 | Tela "Sem conexão" ao abrir sem internet | P0 | Botão "Tentar de novo" funciona |
| RF-APK-20 | Biometria/PIN ao abrir o app | P2 | Só se escolhido na entrevista |
| RF-APK-21 | Notificações push (FCM) | P2 | Fora da Fase 7 |
| RF-APK-22 | **APK de teste (debug)** instalável no emulador e no celular | P0 | Arquivo gerado e instalado |
| RF-APK-23 | **Release assinado** (APK e/ou AAB) com keystore do dono | P0 | Instala e abre; keystore guardada em 2 cópias |
| RF-APK-24 | **Finalização no Android Studio** guiada passo a passo (Anexo F) | P0 | Dono consegue abrir, rodar e gerar o APK seguindo o guia |
| RF-APK-25 | `APK/README_APK.md` em português (como atualizar, versão, keystore) | P0 | Documento entregue |
| RF-APK-26 | Publicação na Google Play (ficha, política, segurança dos dados, teste fechado) | P1 | Somente se escolhido; nada enviado sem aprovação |
| RF-APK-27 | Processo de nova versão (incrementar `versionCode`) | P1 | Documentado e testado uma vez |

---

## 8. Telas, navegação e fluxos

### 8.1 Mapa de navegação
```
Público:   /entrar · /cadastro · /recuperar-senha · /nova-senha · /termos · /privacidade
Privado:   /onboarding
           /                     Início (painel do dia)
           /dia/abrir            Abrir dia (sheet)
           /dia/fechar           Fechar dia (stepper)
           /caixa                Caixa (extrato) · /caixa/manutencao
           /metas                Metas · /metas/nova · /metas/:id
           /conquistas           Medalhas, estrelas e fases
           /prioridades          Contas e obrigações
           /historico            Lista e calendário · /historico/:diaId
           /relatorios           Indicadores e gráficos
           /veiculo              Veículo (P1)
           /configuracoes        Perfil, plataformas, categorias, manutenção, efeitos, dados, conta
```
**Barra inferior (mobile):** `Início · Caixa · [ + ] · Metas · Mais`
O botão central **`+`** (destaque, gradiente com brilho) abre o menu rápido: **Entrada**, **Saída**, **Lote por plataforma**. "Mais" abre: Prioridades, Histórico, Relatórios, Conquistas, Veículo, Configurações.
**Desktop (≥ 1024 px):** barra lateral fixa à esquerda; conteúdo central com largura máx. 1100 px; mesmo conjunto de telas.

### 8.2 Wireframe — Início (dia aberto)
```
┌──────────────────────────────────────┐
│ 🔥 5 dias   Olá, Carlos!   ⭐142 · Fase 3 │
├──────────────────────────────────────┤
│  CAIXA ATUAL                         │
│  R$ 385,00                  ▲ +R$ 235│
│  Abertura R$150,00 · aberto 06:12 · 5h42 │
├──────────────────────────────────────┤
│ [ ＋ ENTRADA ]       [ － SAÍDA ]    │
├──────────────────────────────────────┤
│ META DO DIA  (Receita)        ◯ 133% │
│ R$ 400 / R$ 300   🥉✔ 🥈✔ 🥇✔        │
├──────────────────────────────────────┤
│ Receita   Despesas   Lucro   Reserva │
│ R$ 400    R$ 145     R$ 255  R$ 20   │
├──────────────────────────────────────┤
│ Próximas contas: ⚠ Seguro R$ 210 (hoje)│
├──────────────────────────────────────┤
│ Últimos lançamentos           ver tudo│
│ 🚗 Uber        +R$ 32,00      14:05  │
│ ⛽ Combustível −R$ 90,00      12:30  │
├──────────────────────────────────────┤
│ [        FECHAR O DIA        ]       │
└──────────────────────────────────────┘
 Início  Caixa   [＋]   Metas   Mais
```
**Início (sem dia aberto):** cartão grande **"Bom dia! Seu caixa acumulado: R$ 380,00"** + botão primário **"⏱ Bater ponto — Abrir dia"**; abaixo, metas e prioridades do dia.

### 8.3 Wireframe — Entrada rápida (bottom sheet)
```
┌──────────────────────────────────────┐
│  Nova entrada                    ✕   │
│            R$ 32,00                  │  ← valor grande
│  [Uber] [99] [inDrive] [Particular]  │  ← chips (último usado pré-selecionado)
│  Corridas:   [ − ]  1  [ + ]         │
│  [R$5] [R$10] [R$20] [R$50] [R$100]  │
│  ┌───┬───┬───┐                       │
│  │ 1 │ 2 │ 3 │   teclado numérico    │
│  │ 4 │ 5 │ 6 │   (botões ≥ 56 px)    │
│  │ 7 │ 8 │ 9 │                       │
│  │ , │ 0 │ ⌫ │                       │
│  └───┴───┴───┘                       │
│  ▸ Mais detalhes                     │
│  [        SALVAR ENTRADA        ]    │
└──────────────────────────────────────┘
```
Após salvar: sheet fecha, animação de **"+R$ 32,00"** subindo e somando no Caixa Atual, vibração leve.

### 8.4 Wireframe — Fechar dia (stepper)
```
Passo 1/4  Resumo         ●───○───○───○
  Receita R$ 400 · Despesas R$ 145 · Corridas 14
  [Editar lançamentos]            [Continuar]

Passo 2/4  Lote por plataforma (opcional)
  Uber       R$ [____]   corridas [__]
  99         R$ [____]   corridas [__]
  Particular R$ [____]   corridas [__]
  ( ) Somar ao já lançado   ( ) Substituir

Passo 3/4  Conferência e km
  Calculado: R$ 405,00
  Dinheiro em mãos: R$ [ 400,00 ]  →  Falta de R$ 5,00
  Km final [____]   Horas online [__:__]

Passo 4/4  Manutenção e confirmação
  Depositar na manutenção: R$ [ 20,00 ]  [Pular hoje]
  Caixa final: R$ 380,00 · Amanhã você começa com R$ 380,00
  [        ✅ FECHAR O DIA        ]
```
**Tela final:** "Dia fechado!" + números + medalhas ganhas com confete + botão "Ver resumo" / "Voltar ao início".

### 8.5 Wireframe — Metas
```
Metas                         [ + Nova ]
[ Diária ] [ Semanal ] [ Mensal ] [ Anual ]
┌────────────────────────────────────┐
│ ◯ 133%  Receita do dia            │
│ R$ 400 / R$ 300                    │
│ 🥉 R$210 ✔  🥈 R$300 ✔  🥇 R$390 ✔ │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ ◯ 62%   Receita da semana         │
│ R$ 1.116 / R$ 1.800   faltam R$ 684│
│ 🥉 ✔   🥈 ○   🥇 ○                  │
└────────────────────────────────────┘
```

### 8.6 Estados obrigatórios em toda tela
- **Carregando:** *skeletons* com brilho (nunca tela em branco).
- **Vazio:** ilustração/ícone + frase motivadora + botão de ação (ex.: "Nenhum lançamento ainda. Que tal registrar a primeira corrida?").
- **Erro:** mensagem em português claro + botão "Tentar de novo".
- **Offline:** chip "Sem internet — seus lançamentos serão enviados depois" (Fase 2).
- **Sucesso:** toast curto com ícone; ações destrutivas com desfazer.

### 8.7 Fluxos críticos (passo a passo)
**Abrir dia:** Início → "Bater ponto" → sheet (saldo acumulado, ajustar?, km) → confirmar → animação de ponto → Início com dia aberto.
**Lançar entrada:** `＋` → Entrada → digitar valor → (plataforma já marcada) → Salvar → toast + atualização de caixa/metas → (se desbloqueou nível) celebração.
**Fechar dia:** Início → "Fechar o dia" → passos 1–4 → confirmar → resumo + celebrações → Início (cartão "Abrir o dia" para amanhã).
**Pagar prioridade:** Prioridades → item → "Marcar como paga" → escolher caixa/categoria → confirmar → saída criada e vinculada.
**Esqueceu de fechar:** abrir app → banner → "Fechar agora" → stepper (com opção "Fechar sem conferência").

---

## 9. Design system

### 9.1 Identidade visual
Moderno, "motor + neon": **fundo preto profundo**, **gradiente vermelho → laranja** como assinatura, brilho (*glow*) nas ações principais, cartões em vidro escuro com borda sutil, números grandes e legíveis. Tema **escuro por padrão** (melhor para uso noturno e economia de bateria). Tema claro: P2.

### 9.2 Tokens de cor (CSS variables)
```css
:root {
  /* Superfícies */
  --bg-0:#050505; --bg-1:#0B0B0C; --bg-2:#141416; --bg-3:#1C1C20; --line:#2A2A30;
  /* Texto */
  --text-1:#F5F5F6; --text-2:#B4B4BB; --text-3:#7C7C86;
  /* Marca */
  --orange-400:#FF9330; --orange-500:#FF7A00; --orange-600:#E56A00;
  --red-400:#FF5A4D;    --red-500:#FF2D2D;    --red-600:#D91E1E;
  --grad-brand: linear-gradient(135deg,#FF2D2D 0%,#FF7A00 100%);
  /* Semânticas */
  --positivo:#22C55E;   /* entradas / valores positivos (uso pontual) */
  --negativo:#FF4D4D;   /* saídas / alertas */
  --aviso:#FFC83D;
  /* Medalhas */
  --bronze:#CD7F32; --prata:#C9CED6; --ouro:#FFC83D;
  /* Efeitos */
  --glow-laranja:0 0 24px rgba(255,122,0,.45);
  --glow-vermelho:0 0 24px rgba(255,45,45,.40);
  --sombra-card:0 10px 30px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
  --raio-sm:12px; --raio-md:16px; --raio-lg:24px;
}
```
**Decisão de cor semântica:** como a marca já usa vermelho/laranja, **entradas usam verde (`--positivo`) apenas em valores e ícones pequenos** para leitura instantânea; **saídas usam vermelho**. Botões e destaques de marca seguem o gradiente vermelho→laranja.

### 9.3 Tipografia
- **Títulos e botões:** *Sora* ou *Plus Jakarta Sans* (700/800).
- **Texto:** *Inter* (400/500/600).
- **Números monetários:** *Space Grotesk* ou Inter com `font-variant-numeric: tabular-nums` (alinhamento perfeito).
- Escala: 12 / 14 / 16 / 20 / 24 / 32 / 44 (Caixa Atual) px. Fontes servidas localmente (sem depender de CDN).

### 9.4 Espaçamento, grade e toque
- Base 4 px (4, 8, 12, 16, 20, 24, 32).
- Alvos de toque **≥ 48 px** (principais ≥ 56 px); espaçamento mínimo de 8 px entre alvos.
- Largura mínima suportada: **360 px**. Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`.
- Área segura (*safe-area*) respeitada em iOS/Android (`env(safe-area-inset-*)`).

### 9.5 Botões "modernos" (borda + sombra + brilho)
Variantes: **Primário** (gradiente + borda animada + glow), **Secundário** (escuro com borda em gradiente), **Perigo** (vermelho), **Fantasma**, **Ícone**, **FAB `+`**. Tamanhos: `md` (48 px) e `lg` (56 px). Estados obrigatórios: *hover, focus-visible, active, disabled, loading* (spinner interno).

```css
@property --angulo { syntax:'<angle>'; initial-value:0deg; inherits:false; }

.btn-primario{
  position:relative; isolation:isolate; min-height:56px; padding:0 28px;
  border-radius:16px; color:#fff; font-weight:800; letter-spacing:.2px;
  background:linear-gradient(135deg,var(--red-500),var(--orange-500));
  box-shadow:0 8px 24px rgba(255,90,0,.35),
             inset 0 1px 0 rgba(255,255,255,.35),
             inset 0 -2px 0 rgba(0,0,0,.25);
  transition:transform .15s ease, box-shadow .2s ease, filter .2s ease;
}
.btn-primario::before{                         /* borda animada */
  content:''; position:absolute; inset:-2px; border-radius:18px; z-index:-1;
  background:conic-gradient(from var(--angulo),#FF2D2D,#FF7A00,#FFC83D,#FF2D2D);
  animation:girar 4s linear infinite;
}
.btn-primario:hover{ transform:translateY(-2px);
  box-shadow:0 14px 34px rgba(255,90,0,.55), inset 0 1px 0 rgba(255,255,255,.4); }
.btn-primario:active{ transform:translateY(1px) scale(.98); filter:brightness(.95); }
.btn-primario:focus-visible{ outline:3px solid #fff; outline-offset:3px; }
.btn-primario:disabled{ filter:grayscale(.6) brightness(.7); box-shadow:none; }
@keyframes girar{ to{ --angulo:360deg; } }
@media (prefers-reduced-motion:reduce){ .btn-primario::before{ animation:none; } }
```
**Cartões:** fundo `--bg-2`, borda `1px solid var(--line)`, sombra `--sombra-card`, raio 24 px; cartões "destaque" com borda em gradiente e leve *glow*. **Inputs:** fundo `--bg-1`, borda `--line`, foco com borda laranja + *glow* sutil, altura 52 px, rótulo flutuante.

### 9.6 Componentes base (biblioteca `components/ui`)
`Button` · `IconButton` · `Fab` · `Card` · `StatCard` · `MoneyInput` · `Input` · `Select` · `Chip` · `Switch` · `Stepper` · `NumericKeypad` · `Sheet` (bottom sheet com arraste) · `Modal` · `Toast` (com ação Desfazer) · `Tabs` · `BottomNav` · `SidebarNav` · `ProgressRing` (com marcos 🥉🥈🥇) · `ProgressBar` · `Medalha` (SVG animado) · `Estrelas` · `Badge` · `Skeleton` · `EmptyState` · `ErrorState` · `ListItemSwipe` · `Calendario` · `ChartCard` · `ConfirmDialog`.

### 9.7 Movimento e microinterações
- Transições de tela: *fade + slide* de 180–240 ms. Sheets: mola suave.
- **Contador animado** no Caixa Atual (números "rolam" ao mudar).
- **"+R$ 32,00" flutuante** ao salvar entrada; **"−R$ 90,00"** em vermelho ao salvar saída.
- **Bater ponto:** relógio gira, círculo pulsa, check desenha-se (Lottie ou SVG animado).
- **Anel de meta** preenche com *easing*; ao cruzar um marco, o marco "pisca" e a medalha "salta".
- **Medalha desbloqueada:** brilho girando (shine sweep), leve *tilt*.
- **Haptics** (APK): leve ao salvar, médio ao medalha, forte ao mudar de fase.
- Todas as animações respeitam `prefers-reduced-motion` e a configuração "Efeitos".

### 9.8 Confete e serpentina
```ts
// src/lib/confete.ts
import confetti from 'canvas-confetti';
const CORES = ['#FF2D2D', '#FF7A00', '#FFC83D', '#FFFFFF', '#111111'];

export function celebrar(nivel: 'bronze' | 'prata' | 'ouro' | 'fase') {
  if (!efeitosAtivos()) return;                       // lê configuração + reduced-motion
  const base = { colors: CORES, disableForReducedMotion: true, zIndex: 9999 };
  if (nivel === 'bronze') confetti({ ...base, particleCount: 60, spread: 70, origin: { y: .7 } });
  if (nivel === 'prata') {
    confetti({ ...base, particleCount: 80, angle: 60,  spread: 60, origin: { x: 0, y: .8 } });
    confetti({ ...base, particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: .8 } });
  }
  if (nivel === 'ouro' || nivel === 'fase') {
    const fim = Date.now() + (nivel === 'fase' ? 4000 : 2500);
    (function chuva() {
      confetti({ ...base, particleCount: 6, angle: 60,  spread: 55, origin: { x: 0 } });
      confetti({ ...base, particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      // serpentinas: tiras finas, caem devagar e ficam mais tempo no ar
      confetti({ ...base, particleCount: 3, spread: 360, startVelocity: 18, gravity: .5,
                 ticks: 320, scalar: 1.4, shapes: ['square'] });
      if (Date.now() < fim) requestAnimationFrame(chuva);
    })();
  }
}
```
> O agente deve refinar a "serpentina" (ex.: `shapeFromPath` para fitas onduladas) mantendo desempenho em celulares simples (limitar partículas, cancelar se a aba ficar oculta).

### 9.9 Iconografia e ilustração
- Ícones `lucide-react`, traço 2 px, cantos arredondados.
- Plataformas e categorias usam **ícone + cor** configuráveis (emoji como alternativa).
- Medalhas e troféus em **SVG próprio** (bronze/prata/ouro com gradiente metálico e brilho).

### 9.10 Acessibilidade
- Contraste mínimo **WCAG AA** (texto sobre preto ≥ 4,5:1; verificar laranja/vermelho sobre fundos).
- Foco visível em tudo; navegação por teclado completa na web.
- `aria-label` em botões só-ícone; `role="status"` nos toasts; `aria-live` no Caixa Atual.
- Nunca depender só de cor: valores positivos/negativos também levam **sinal (+/−)** e ícone.
- Respeitar tamanho de fonte do sistema (usar `rem`).

### 9.11 Responsividade
- **Mobile-first**: tudo funciona com uma mão, polegar embaixo (ações principais na metade inferior).
- Tablet/desktop: barra lateral, grade de cartões 2–3 colunas, tabelas no extrato.
- Teste em 360×640, 390×844, 768×1024 e 1440×900.

---

## 10. Modelo de dados (Supabase / Postgres)

> **Aviso ao agente:** o SQL abaixo é a **referência de implementação**. Aplique-o em migrações versionadas (`supabase/migrations`), **valide cada função com testes SQL** (seção 13) e ajuste detalhes de sintaxe se o Postgres reclamar — sem alterar as regras de negócio da seção 6. Toda a tabela de usuário usa `user_id` e **RLS**.

### 10.1 Diagrama lógico (resumo)
```
auth.users ─1:1─ profiles ─1:1─ configuracoes
                    │ ─1:1─ gamificacao_usuario
                    │ ─1:N─ caixas (principal, manutencao, personalizado)
                    │ ─1:N─ dias_trabalho ─1:N─ lancamentos ─N:1─ caixas
                    │                                   ├─N:1─ categorias
                    │                                   ├─N:1─ plataformas
                    │                                   └─N:1─ transferencias (par de lançamentos)
                    │ ─1:N─ metas ─1:N─ meta_ciclos
                    │ ─1:N─ prioridades ─0:1─ lancamentos
                    │ ─1:N─ conquistas_usuario ─N:1─ conquistas_catalogo
                    │ ─1:N─ veiculos ─1:N─ abastecimentos / manutencoes_programadas (Fase 2)
                    └ ─1:N─ auditoria
Globais (somente leitura): fases, conquistas_catalogo
```

### 10.2 Migração `0001_schema.sql`
```sql
create extension if not exists pgcrypto;

-- ===== Tipos =====
create type public.tipo_caixa        as enum ('principal','manutencao','personalizado');
create type public.tipo_lancamento   as enum ('entrada','saida','transferencia_entrada','transferencia_saida','ajuste_entrada','ajuste_saida');
create type public.status_dia        as enum ('aberto','fechado');
create type public.periodo_meta      as enum ('diaria','semanal','mensal','anual');
create type public.metrica_meta      as enum ('receita_bruta','lucro_liquido','corridas','dias_trabalhados','reserva_manutencao','km_rodados','minutos_online');
create type public.nivel_medalha     as enum ('nenhum','bronze','prata','ouro');   -- ordem importa (comparações)

-- ===== Utilitário: atualizado_em =====
create or replace function public.fn_set_atualizado_em() returns trigger
language plpgsql as $$ begin new.atualizado_em := now(); return new; end $$;

-- ===== Perfil e configurações =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  avatar_url text,
  fuso_horario text not null default 'America/Sao_Paulo',
  onboarding_concluido boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.configuracoes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  inicio_semana smallint not null default 1 check (inicio_semana between 0 and 6),   -- 0=dom, 1=seg
  dias_trabalho_semana smallint not null default 6 check (dias_trabalho_semana between 1 and 7),
  dias_folga smallint[] not null default '{}',                                         -- 0..6
  manutencao_modo text not null default 'fixo' check (manutencao_modo in ('fixo','percentual','desativado')),
  manutencao_valor_centavos bigint not null default 0 check (manutencao_valor_centavos >= 0),
  manutencao_percentual numeric(5,2) not null default 0 check (manutencao_percentual between 0 and 100),
  efeitos_ativos boolean not null default true,
  som_ativo boolean not null default false,
  vibracao_ativa boolean not null default true,
  lembretes jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- ===== Cadastros auxiliares =====
create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  apelido text not null, marca text, modelo text, ano smallint, placa text,
  combustivel text, km_atual integer check (km_atual >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);

create table public.plataformas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null, cor text not null default '#FF7A00', icone text,
  ordem smallint not null default 0, ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (user_id, nome)
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('entrada','saida')),
  nome text not null, icone text, cor text default '#FF7A00',
  natureza text not null default 'operacional' check (natureza in ('operacional','retirada_pessoal')),
  sistema boolean not null default false, ativa boolean not null default true,
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  unique (user_id, tipo, nome)
);

-- ===== Caixas =====
create table public.caixas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo public.tipo_caixa not null,
  nome text not null,
  saldo_inicial_centavos bigint not null default 0,
  meta_saldo_centavos bigint check (meta_saldo_centavos is null or meta_saldo_centavos > 0), -- meta de reserva
  cor text, ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create unique index ux_caixa_unico_sistema on public.caixas (user_id, tipo) where tipo in ('principal','manutencao');

-- ===== Dias de trabalho =====
create table public.dias_trabalho (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data_referencia date not null,
  status public.status_dia not null default 'aberto',
  aberto_em timestamptz not null default now(),
  fechado_em timestamptz,
  saldo_abertura_centavos bigint not null,
  saldo_calculado_centavos bigint,
  saldo_informado_centavos bigint,
  saldo_fechamento_centavos bigint,
  diferenca_conferencia_centavos bigint not null default 0,
  reserva_manutencao_centavos bigint not null default 0,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  km_inicial integer check (km_inicial >= 0),
  km_final integer check (km_final >= 0),
  minutos_online integer check (minutos_online >= 0),
  observacoes text,
  resumo jsonb,                                   -- snapshot no fechamento
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (user_id, data_referencia)
);
create unique index ux_um_dia_aberto on public.dias_trabalho (user_id) where status = 'aberto';
create index ix_dias_user_data on public.dias_trabalho (user_id, data_referencia desc);

-- ===== Transferências e lançamentos =====
create table public.transferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caixa_origem_id uuid not null references public.caixas(id),
  caixa_destino_id uuid not null references public.caixas(id),
  valor_centavos bigint not null check (valor_centavos > 0),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  observacao text,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  check (caixa_origem_id <> caixa_destino_id)
);

create table public.prioridades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null, valor_centavos bigint not null check (valor_centavos > 0),
  vencimento date not null,
  nivel text not null default 'media' check (nivel in ('alta','media','baixa')),
  recorrencia text not null default 'nenhuma' check (recorrencia in ('nenhuma','semanal','mensal','anual')),
  status text not null default 'pendente' check (status in ('pendente','pago','cancelada')),
  observacao text, pago_em timestamptz, lancamento_id uuid,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create index ix_prioridades_user on public.prioridades (user_id, status, vencimento);

create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),            -- o cliente PODE enviar o id (offline/idempotência)
  user_id uuid not null references public.profiles(id) on delete cascade,
  caixa_id uuid not null references public.caixas(id),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  tipo public.tipo_lancamento not null,
  valor_centavos bigint not null check (valor_centavos > 0 and valor_centavos <= 100000000),
  categoria_id uuid references public.categorias(id),
  plataforma_id uuid references public.plataformas(id),
  descricao text,
  qtd_corridas integer not null default 0 check (qtd_corridas between 0 and 999),
  km numeric(6,1) check (km >= 0),
  duracao_min integer check (duracao_min >= 0),
  meio_pagamento text check (meio_pagamento in ('dinheiro','pix','saldo_app','outro')),
  ocorrido_em timestamptz not null default now(),
  data_referencia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  origem text not null default 'manual' check (origem in
    ('manual','resumo_dia','deposito_manutencao','ajuste_abertura','conferencia','prioridade','transferencia','sistema')),
  transferencia_id uuid references public.transferencias(id) on delete set null,
  prioridade_id uuid references public.prioridades(id) on delete set null,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint ck_categoria_obrigatoria check (tipo not in ('entrada','saida') or categoria_id is not null)
);
create index ix_lanc_user_data on public.lancamentos (user_id, data_referencia) where excluido_em is null;
create index ix_lanc_caixa     on public.lancamentos (caixa_id)                 where excluido_em is null;
create index ix_lanc_dia       on public.lancamentos (dia_id);

-- ===== Metas, ciclos e gamificação =====
create table public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  periodo public.periodo_meta not null,
  metrica public.metrica_meta not null,
  valor_alvo bigint not null check (valor_alvo > 0),       -- centavos (dinheiro) ou unidade (corridas, dias, km, minutos)
  pct_bronze smallint not null default 70,
  pct_prata  smallint not null default 100,
  pct_ouro   smallint not null default 130,
  recorrente boolean not null default true,
  ativa boolean not null default true,
  inicio date, fim date,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  check (pct_bronze > 0 and pct_bronze < pct_prata and pct_prata < pct_ouro)
);
create index ix_metas_user on public.metas (user_id, ativa);

create table public.meta_ciclos (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references public.metas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  periodo_inicio date not null, periodo_fim date not null,
  valor_alvo_snapshot bigint not null,
  pct_bronze smallint not null, pct_prata smallint not null, pct_ouro smallint not null,
  valor_alcancado bigint not null default 0,
  nivel_atual public.nivel_medalha not null default 'nenhum',
  nivel_maximo public.nivel_medalha not null default 'nenhum',
  estrelas_ganhas integer not null default 0,
  status text not null default 'em_andamento' check (status in ('em_andamento','consolidado')),
  consolidado_em timestamptz,
  atualizado_em timestamptz not null default now(),
  unique (meta_id, periodo_inicio)
);
create index ix_ciclos_user on public.meta_ciclos (user_id, periodo_inicio desc);

create table public.fases (
  numero smallint primary key, nome text not null, estrelas_minimas integer not null, cor text
);

create table public.conquistas_catalogo (
  codigo text primary key, titulo text not null, descricao text not null,
  icone text, estrelas_bonus integer not null default 0, ordem smallint not null default 0
);

create table public.conquistas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  codigo text not null references public.conquistas_catalogo(codigo),
  desbloqueada_em timestamptz not null default now(),
  contexto jsonb,
  unique (user_id, codigo)
);

create table public.gamificacao_usuario (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  estrelas_totais integer not null default 0,
  fase_atual smallint not null default 1 references public.fases(numero),
  sequencia_atual integer not null default 0,
  maior_sequencia integer not null default 0,
  atualizado_em timestamptz not null default now()
);

-- ===== Auditoria =====
create table public.auditoria (
  id bigint generated always as identity primary key,
  user_id uuid not null, tabela text not null, registro_id uuid, acao text not null,
  antes jsonb, depois jsonb, criado_em timestamptz not null default now()
);

-- ===== Triggers de atualizado_em =====
create trigger trg_profiles_upd    before update on public.profiles    for each row execute function public.fn_set_atualizado_em();
create trigger trg_config_upd      before update on public.configuracoes for each row execute function public.fn_set_atualizado_em();
create trigger trg_lanc_upd        before update on public.lancamentos for each row execute function public.fn_set_atualizado_em();
create trigger trg_dias_upd        before update on public.dias_trabalho for each row execute function public.fn_set_atualizado_em();
create trigger trg_metas_upd       before update on public.metas       for each row execute function public.fn_set_atualizado_em();
create trigger trg_prior_upd       before update on public.prioridades for each row execute function public.fn_set_atualizado_em();

-- ===== Regras de integridade dos lançamentos =====
create or replace function public.fn_lancamento_regras() returns trigger
language plpgsql set search_path = public as $$
declare v_dia public.dias_trabalho;
begin
  if new.dia_id is not null then
    select * into v_dia from dias_trabalho where id = new.dia_id;
    if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
    if v_dia.status = 'fechado' then raise exception 'DIA_FECHADO'; end if;
    new.data_referencia := v_dia.data_referencia;       -- herda a data do dia (RN-02)
  end if;
  if tg_op = 'UPDATE' and old.dia_id is not null and old.dia_id is distinct from new.dia_id then
    if exists (select 1 from dias_trabalho where id = old.dia_id and status = 'fechado') then
      raise exception 'DIA_FECHADO';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.dia_id is not null and old.dia_id = new.dia_id then
    null; -- já validado acima (dia aberto)
  end if;
  return new;
end $$;
create trigger trg_lanc_regras before insert or update on public.lancamentos
for each row execute function public.fn_lancamento_regras();
```

### 10.3 Migração `0002_rls.sql` (segurança)
```sql
-- Perfil: id = auth.uid()
alter table public.profiles enable row level security;
create policy profiles_sel on public.profiles for select using (id = auth.uid());
create policy profiles_ins on public.profiles for insert with check (id = auth.uid());
create policy profiles_upd on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Configurações / gamificação: select + insert + update (sem delete)
do $$ declare t text; begin
  foreach t in array array['configuracoes','gamificacao_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

-- CRUD completo do próprio usuário
do $$ declare t text; begin
  foreach t in array array['veiculos','plataformas','categorias','prioridades','metas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
    execute format('create policy %I on public.%I for delete using (user_id = auth.uid())', t||'_del', t);
  end loop;
end $$;

-- Dados financeiros: SEM delete (exclusão lógica / estorno por função)
do $$ declare t text; begin
  foreach t in array array['caixas','dias_trabalho','lancamentos','transferencias','meta_ciclos','conquistas_usuario'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_upd', t);
  end loop;
end $$;

-- Auditoria: usuário só lê; escrita via funções/triggers SECURITY DEFINER
alter table public.auditoria enable row level security;
create policy auditoria_sel on public.auditoria for select using (user_id = auth.uid());

-- Tabelas globais: leitura para logados
alter table public.fases enable row level security;
alter table public.conquistas_catalogo enable row level security;
create policy fases_sel on public.fases for select to authenticated using (true);
create policy conquistas_cat_sel on public.conquistas_catalogo for select to authenticated using (true);
```
> Validar com teste: usuário A **não** consegue ler/alterar dados do usuário B (nenhuma linha retornada, nenhuma alteração).

### 10.4 Migração `0003_funcoes.sql` (views e RPCs)
```sql
-- ===== Views (security_invoker: respeitam o RLS de quem consulta) =====
create or replace view public.vw_saldo_caixas with (security_invoker = true) as
select c.id as caixa_id, c.user_id, c.tipo, c.nome,
       c.saldo_inicial_centavos + coalesce(sum(
         case when l.tipo in ('entrada','transferencia_entrada','ajuste_entrada')
              then l.valor_centavos else -l.valor_centavos end), 0) as saldo_centavos
from public.caixas c
left join public.lancamentos l on l.caixa_id = c.id and l.excluido_em is null
group by c.id;

create or replace view public.vw_resumo_dia with (security_invoker = true) as
select d.id as dia_id, d.user_id, d.data_referencia,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'entrada'), 0)::bigint                       as receita_centavos,
  coalesce(sum(l.qtd_corridas)   filter (where l.tipo = 'entrada'), 0)::bigint                       as corridas,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and c.tipo = 'principal'
                                         and cat.natureza = 'operacional'), 0)::bigint               as despesas_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and c.tipo = 'manutencao'), 0)::bigint as despesas_reserva_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'saida' and cat.natureza = 'retirada_pessoal'), 0)::bigint as retiradas_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'transferencia_entrada' and c.tipo = 'manutencao'), 0)::bigint as reserva_centavos,
  coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_entrada'), 0)::bigint
    - coalesce(sum(l.valor_centavos) filter (where l.tipo = 'ajuste_saida'), 0)::bigint              as ajustes_centavos
from public.dias_trabalho d
left join public.lancamentos l on l.dia_id = d.id and l.excluido_em is null
left join public.caixas c on c.id = l.caixa_id
left join public.categorias cat on cat.id = l.categoria_id
group by d.id;

-- ===== Utilitários de metas =====
create or replace function public.fn_estrelas_nivel(n public.nivel_medalha) returns integer
language sql immutable as $$ select case n when 'bronze' then 1 when 'prata' then 3 when 'ouro' then 5 else 0 end $$;

create or replace function public.fn_mult_periodo(p public.periodo_meta) returns integer
language sql immutable as $$ select case p when 'diaria' then 1 when 'semanal' then 3 when 'mensal' then 10 else 50 end $$;

create or replace function public.fn_limites_periodo(p_periodo public.periodo_meta, p_ref date, p_inicio_semana smallint default 1)
returns table (ini date, fim date) language sql immutable as $$
  with b as (
    select case p_periodo
      when 'diaria'  then p_ref
      when 'semanal' then (p_ref - (((extract(dow from p_ref)::int - p_inicio_semana) + 7) % 7))
      when 'mensal'  then date_trunc('month', p_ref)::date
      else date_trunc('year', p_ref)::date end as ini)
  select b.ini,
    case p_periodo
      when 'diaria'  then b.ini
      when 'semanal' then b.ini + 6
      when 'mensal'  then (b.ini + interval '1 month' - interval '1 day')::date
      else (b.ini + interval '1 year' - interval '1 day')::date end
  from b $$;

create or replace function public.fn_valor_metrica(p_user uuid, p_metrica public.metrica_meta, p_ini date, p_fim date)
returns bigint language plpgsql stable set search_path = public as $$
declare v bigint;
begin
  if p_metrica = 'receita_bruta' then
    select coalesce(sum(valor_centavos),0)::bigint into v from lancamentos
     where user_id = p_user and excluido_em is null and tipo = 'entrada' and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'corridas' then
    select coalesce(sum(qtd_corridas),0)::bigint into v from lancamentos
     where user_id = p_user and excluido_em is null and tipo = 'entrada' and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'lucro_liquido' then
    select coalesce(sum(case when l.tipo = 'entrada' then l.valor_centavos else -l.valor_centavos end),0)::bigint into v
      from lancamentos l join caixas c on c.id = l.caixa_id left join categorias cat on cat.id = l.categoria_id
     where l.user_id = p_user and l.excluido_em is null and l.data_referencia between p_ini and p_fim
       and (l.tipo = 'entrada' or (l.tipo = 'saida' and c.tipo = 'principal' and cat.natureza = 'operacional'));
  elsif p_metrica = 'reserva_manutencao' then
    select coalesce(sum(l.valor_centavos),0)::bigint into v
      from lancamentos l join caixas c on c.id = l.caixa_id
     where l.user_id = p_user and l.excluido_em is null and c.tipo = 'manutencao'
       and l.tipo = 'transferencia_entrada' and l.data_referencia between p_ini and p_fim;
  elsif p_metrica = 'dias_trabalhados' then
    select count(*)::bigint into v from dias_trabalho
     where user_id = p_user and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'km_rodados' then
    select coalesce(sum(km_final - km_inicial),0)::bigint into v from dias_trabalho
     where user_id = p_user and km_final is not null and km_inicial is not null and data_referencia between p_ini and p_fim;
  elsif p_metrica = 'minutos_online' then
    select coalesce(sum(minutos_online),0)::bigint into v from dias_trabalho
     where user_id = p_user and data_referencia between p_ini and p_fim;
  end if;
  return coalesce(v, 0);
end $$;

-- ===== RPC: transferir entre caixas (RN-10) =====
create or replace function public.rpc_transferir(
  p_origem uuid, p_destino uuid, p_valor_centavos bigint,
  p_observacao text default null, p_dia_id uuid default null, p_origem_lancamento text default 'transferencia'
) returns uuid language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid(); v_saldo bigint; v_id uuid := gen_random_uuid();
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if p_origem = p_destino then raise exception 'CAIXAS_IGUAIS'; end if;
  if p_valor_centavos is null or p_valor_centavos <= 0 then raise exception 'VALOR_INVALIDO'; end if;
  if (select count(*) from caixas where user_id = v_user and id in (p_origem, p_destino)) <> 2 then
    raise exception 'CAIXA_INVALIDO';
  end if;
  select saldo_centavos into v_saldo from vw_saldo_caixas where caixa_id = p_origem;
  if v_saldo < p_valor_centavos then raise exception 'SALDO_INSUFICIENTE'; end if;

  insert into transferencias (id, user_id, caixa_origem_id, caixa_destino_id, valor_centavos, dia_id, observacao)
  values (v_id, v_user, p_origem, p_destino, p_valor_centavos, p_dia_id, p_observacao);

  insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem, transferencia_id)
  values
   (v_user, p_origem,  p_dia_id, 'transferencia_saida'::tipo_lancamento,   p_valor_centavos,
      coalesce(p_observacao,'Transferência entre caixas'), p_origem_lancamento, v_id),
   (v_user, p_destino, p_dia_id, 'transferencia_entrada'::tipo_lancamento, p_valor_centavos,
      coalesce(p_observacao,'Transferência entre caixas'), p_origem_lancamento, v_id);
  return v_id;
end $$;

-- ===== RPC: abrir dia (RN-04/05) =====
create or replace function public.rpc_abrir_dia(
  p_data_referencia date, p_km_inicial integer default null, p_saldo_confirmado_centavos bigint default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid(); v_caixa uuid; v_saldo bigint; v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia = p_data_referencia) then
    raise exception 'DIA_JA_EXISTE_NESTA_DATA'; end if;

  select id into v_caixa from caixas where user_id = v_user and tipo = 'principal';
  select saldo_centavos into v_saldo from vw_saldo_caixas where caixa_id = v_caixa;

  insert into dias_trabalho (user_id, data_referencia, status, saldo_abertura_centavos, km_inicial)
  values (v_user, p_data_referencia, 'aberto', coalesce(p_saldo_confirmado_centavos, v_saldo), p_km_inicial)
  returning * into v_dia;

  if p_saldo_confirmado_centavos is not null and p_saldo_confirmado_centavos <> v_saldo then
    insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem)
    values (v_user, v_caixa, v_dia.id,
      (case when p_saldo_confirmado_centavos > v_saldo then 'ajuste_entrada' else 'ajuste_saida' end)::tipo_lancamento,
      abs(p_saldo_confirmado_centavos - v_saldo), 'Ajuste na abertura do dia', 'ajuste_abertura');
  end if;
  return v_dia;
end $$;

-- ===== RPC: fechar dia (RN-12/13) — atômico =====
create or replace function public.rpc_fechar_dia(
  p_dia_id uuid,
  p_saldo_informado_centavos bigint default null,
  p_deposito_manutencao_centavos bigint default 0,
  p_km_final integer default null,
  p_minutos_online integer default null,
  p_observacoes text default null
) returns public.dias_trabalho language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_dia public.dias_trabalho; v_principal uuid; v_reserva uuid;
  v_saldo_calc bigint; v_dif bigint := 0; v_resumo jsonb;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_JA_FECHADO'; end if;
  if p_km_final is not null and v_dia.km_inicial is not null and p_km_final < v_dia.km_inicial then
    raise exception 'KM_FINAL_INVALIDO'; end if;

  select id into v_principal from caixas where user_id = v_user and tipo = 'principal';
  select id into v_reserva   from caixas where user_id = v_user and tipo = 'manutencao';

  -- 1) Conferência: compara o dinheiro em mãos com o saldo calculado (ANTES de separar a reserva)
  select saldo_centavos into v_saldo_calc from vw_saldo_caixas where caixa_id = v_principal;

  if p_saldo_informado_centavos is not null and p_saldo_informado_centavos <> v_saldo_calc then
    v_dif := p_saldo_informado_centavos - v_saldo_calc;
    insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem)
    values (v_user, v_principal, v_dia.id,
      (case when v_dif > 0 then 'ajuste_entrada' else 'ajuste_saida' end)::tipo_lancamento, abs(v_dif),
      case when v_dif > 0 then 'Sobra na conferência do caixa' else 'Falta na conferência do caixa' end, 'conferencia');
  end if;

  -- 2) Depósito de manutenção: transferência principal -> manutenção
  if coalesce(p_deposito_manutencao_centavos, 0) > 0 then
    perform public.rpc_transferir(v_principal, v_reserva, p_deposito_manutencao_centavos,
                                  'Depósito diário de manutenção', v_dia.id, 'deposito_manutencao');
  end if;

  select to_jsonb(r) into v_resumo from vw_resumo_dia r where r.dia_id = v_dia.id;

  update dias_trabalho set
    status = 'fechado', fechado_em = now(),
    saldo_calculado_centavos = v_saldo_calc,
    saldo_informado_centavos = p_saldo_informado_centavos,
    saldo_fechamento_centavos = v_saldo_calc + v_dif - coalesce(p_deposito_manutencao_centavos, 0),
    diferenca_conferencia_centavos = v_dif,
    reserva_manutencao_centavos = coalesce(p_deposito_manutencao_centavos, 0),
    km_final = p_km_final, minutos_online = p_minutos_online, observacoes = p_observacoes,
    resumo = coalesce(v_resumo, '{}'::jsonb)
  where id = v_dia.id returning * into v_dia;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'fechar_dia', to_jsonb(v_dia));
  return v_dia;
end $$;

-- ===== RPC: reabrir último dia fechado (RN-14) =====
create or replace function public.rpc_reabrir_dia(p_dia_id uuid)
returns public.dias_trabalho language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid(); v_dia public.dias_trabalho;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user for update;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'fechado' then raise exception 'DIA_NAO_ESTA_FECHADO'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and status = 'aberto') then
    raise exception 'DIA_ABERTO_EXISTENTE'; end if;
  if exists (select 1 from dias_trabalho where user_id = v_user and data_referencia > v_dia.data_referencia) then
    raise exception 'APENAS_ULTIMO_DIA'; end if;

  update dias_trabalho set status = 'aberto', fechado_em = null, saldo_calculado_centavos = null,
         saldo_informado_centavos = null, saldo_fechamento_centavos = null,
         diferenca_conferencia_centavos = 0, reserva_manutencao_centavos = 0, resumo = null
   where id = v_dia.id returning * into v_dia;

  -- estorna depósito e conferência do fechamento (agora o dia está aberto e o trigger permite)
  update lancamentos set excluido_em = now()
   where dia_id = v_dia.id and excluido_em is null and origem in ('deposito_manutencao','conferencia');
  update transferencias set excluido_em = now() where dia_id = v_dia.id and excluido_em is null;

  insert into auditoria (user_id, tabela, registro_id, acao, depois)
  values (v_user, 'dias_trabalho', v_dia.id, 'reabrir_dia', to_jsonb(v_dia));
  return v_dia;
end $$;

-- ===== RPC: atualizar metas (RN-18/19) — retorna eventos para a UI celebrar =====
create or replace function public.rpc_atualizar_metas(p_ref date default null)
returns table (o_meta_id uuid, o_ciclo_id uuid, o_periodo text, o_nivel_anterior text, o_nivel_novo text, o_estrelas integer)
language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_ref date; v_semana smallint; v_tz text;
  m record; lim record; c public.meta_ciclos; v_valor bigint; v_nivel public.nivel_medalha; v_delta integer;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select fuso_horario into v_tz from profiles where id = v_user;
  select inicio_semana into v_semana from configuracoes where user_id = v_user;
  v_ref := coalesce(p_ref, (now() at time zone coalesce(v_tz,'America/Sao_Paulo'))::date);

  update meta_ciclos set status = 'consolidado', consolidado_em = now()
   where user_id = v_user and status = 'em_andamento' and periodo_fim < v_ref;

  for m in select * from metas where user_id = v_user and ativa
            and (inicio is null or inicio <= v_ref) and (fim is null or fim >= v_ref) loop
    select * into lim from fn_limites_periodo(m.periodo, v_ref, coalesce(v_semana,1));

    insert into meta_ciclos (meta_id, user_id, periodo_inicio, periodo_fim, valor_alvo_snapshot, pct_bronze, pct_prata, pct_ouro)
    values (m.id, v_user, lim.ini, lim.fim, m.valor_alvo, m.pct_bronze, m.pct_prata, m.pct_ouro)
    on conflict (meta_id, periodo_inicio) do nothing;

    select * into c from meta_ciclos where meta_id = m.id and periodo_inicio = lim.ini;
    v_valor := fn_valor_metrica(v_user, m.metrica, lim.ini, lim.fim);
    v_nivel := case
      when v_valor >= c.valor_alvo_snapshot * c.pct_ouro   / 100.0 then 'ouro'::nivel_medalha
      when v_valor >= c.valor_alvo_snapshot * c.pct_prata  / 100.0 then 'prata'::nivel_medalha
      when v_valor >= c.valor_alvo_snapshot * c.pct_bronze / 100.0 then 'bronze'::nivel_medalha
      else 'nenhum'::nivel_medalha end;

    v_delta := 0;
    if v_nivel > c.nivel_maximo then
      v_delta := (fn_estrelas_nivel(v_nivel) - fn_estrelas_nivel(c.nivel_maximo)) * fn_mult_periodo(m.periodo);
    end if;

    update meta_ciclos set valor_alcancado = v_valor, nivel_atual = v_nivel,
           nivel_maximo = greatest(nivel_maximo, v_nivel), estrelas_ganhas = estrelas_ganhas + v_delta,
           atualizado_em = now()
     where id = c.id;

    if v_delta > 0 then
      update gamificacao_usuario g set
        estrelas_totais = g.estrelas_totais + v_delta,
        fase_atual = (select max(numero) from fases where estrelas_minimas <= g.estrelas_totais + v_delta),
        atualizado_em = now()
      where g.user_id = v_user;
      o_meta_id := m.id; o_ciclo_id := c.id; o_periodo := m.periodo::text;
      o_nivel_anterior := c.nivel_maximo::text; o_nivel_novo := v_nivel::text; o_estrelas := v_delta;
      return next;
    end if;
  end loop;
end $$;
```
> **A implementar pelo agente (sem SQL de referência):** `rpc_avaliar_conquistas()` (RN-21/22: sequência, conquistas do Anexo C, estrelas bônus, retornando eventos) e `rpc_pagar_prioridade(prioridade_id, caixa_id, categoria_id)` (RN-24: cria a saída vinculada, marca como paga e gera a próxima recorrência). Ambas devem seguir o mesmo padrão: transacionais, `auth.uid()`, erros por código e testes.

### 10.5 Migração `0004_seeds.sql` (novo usuário e dados globais)
```sql
-- Fases (RN-20)
insert into public.fases (numero, nome, estrelas_minimas, cor) values
 (1,'Aprendiz',0,'#B4B4BB'),(2,'Estradeiro',25,'#CD7F32'),(3,'Profissional',100,'#C9CED6'),
 (4,'Veterano',300,'#FFC83D'),(5,'Mestre do Volante',700,'#FF7A00'),(6,'Elite',1500,'#FF2D2D'),(7,'Lenda',3000,'#FF2D2D')
on conflict do nothing;

-- Catálogo de conquistas (Anexo C) — inserir todas as linhas do Anexo C aqui.

-- Cria tudo que um novo usuário precisa
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nome)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nome',''), split_part(new.email,'@',1)));
  insert into configuracoes (user_id) values (new.id);
  insert into gamificacao_usuario (user_id) values (new.id);

  insert into caixas (user_id, tipo, nome) values
    (new.id, 'principal'::tipo_caixa, 'Caixa do dia'),
    (new.id, 'manutencao'::tipo_caixa, 'Caixa Manutenção');

  insert into plataformas (user_id, nome, cor, ordem) values
    (new.id,'Uber','#FFFFFF',1),(new.id,'99','#FFC83D',2),(new.id,'inDrive','#22C55E',3),
    (new.id,'Particular','#FF7A00',4),(new.id,'Outros','#B4B4BB',5);

  insert into categorias (user_id, tipo, nome, icone, natureza, sistema, ordem) values
    (new.id,'entrada','Corridas','car','operacional',true,1),
    (new.id,'entrada','Gorjeta','coins','operacional',true,2),
    (new.id,'entrada','Bônus / Promoção','gift','operacional',true,3),
    (new.id,'entrada','Outras receitas','plus-circle','operacional',true,4),
    (new.id,'saida','Combustível','fuel','operacional',true,1),
    (new.id,'saida','Alimentação','utensils','operacional',true,2),
    (new.id,'saida','Crédito no app','smartphone','operacional',true,3),
    (new.id,'saida','Manutenção','wrench','operacional',true,4),
    (new.id,'saida','Lavagem','droplets','operacional',true,5),
    (new.id,'saida','Pedágio / Estacionamento','ticket','operacional',true,6),
    (new.id,'saida','Multa','alert-triangle','operacional',true,7),
    (new.id,'saida','Outras despesas','more-horizontal','operacional',true,8),
    (new.id,'saida','Retirada pessoal','wallet','retirada_pessoal',true,9);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
```

### 10.6 Migração `0005_fase2.sql` (referência)
```sql
create table public.abastecimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  data date not null default current_date, litros numeric(7,2) not null check (litros > 0),
  preco_litro_centavos integer not null check (preco_litro_centavos > 0),
  valor_total_centavos bigint not null check (valor_total_centavos > 0),
  km integer check (km >= 0), tanque_cheio boolean not null default true,
  lancamento_id uuid references public.lancamentos(id) on delete set null,
  criado_em timestamptz not null default now()
);
create table public.manutencoes_programadas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  veiculo_id uuid references public.veiculos(id) on delete cascade,
  titulo text not null, intervalo_km integer, intervalo_dias integer,
  ultimo_km integer, ultima_data date, custo_estimado_centavos bigint,
  ativa boolean not null default true, criado_em timestamptz not null default now()
);
-- + RLS no mesmo padrão da seção 10.3 (CRUD próprio).
```

---

## 11. Camada de dados, contratos e erros

### 11.1 Mapa de operações (front → Supabase)
| Operação | Mecanismo | Observação |
|---|---|---|
| Cadastro/login/logout/recuperar | `supabase.auth.*` | Trigger `handle_new_user` cria tudo |
| Saldo dos caixas | `select` em `vw_saldo_caixas` | Nunca somar no front |
| Resumo do dia | `select` em `vw_resumo_dia` | Para Início e Fechamento |
| Abrir / fechar / reabrir dia | `rpc_abrir_dia` · `rpc_fechar_dia` · `rpc_reabrir_dia` | Exigem internet |
| Entrada / saída | `insert` em `lancamentos` (UUID gerado no cliente) | Atualização otimista |
| Editar / excluir lançamento | `update` (excluir = `excluido_em = now()`) | Desfazer = `excluido_em = null` em até 6 s |
| Lote por plataforma | `insert` múltiplo com `origem='resumo_dia'` | Substituir = soft delete dos individuais |
| Transferência | `rpc_transferir` | RN-10 |
| Metas (progresso/eventos) | `rpc_atualizar_metas` após cada mutação financeira | Retorna eventos de medalha |
| Conquistas | `rpc_avaliar_conquistas` | Após fechar dia/meta/prioridade |
| Pagar prioridade | `rpc_pagar_prioridade` | RN-24 |
| Exportar dados | consultas paginadas → CSV/JSON no cliente | RN-27 |
| Excluir conta | Edge Function `delete-account` (usa `service_role` **somente no servidor**) | Confirmação "EXCLUIR" |

### 11.2 Chaves de cache (TanStack Query)
`['perfil']` · `['config']` · `['caixas','saldos']` · `['dia','atual']` · `['dia',id,'resumo']` · `['lancamentos',{diaId|periodo|filtros}]` · `['metas']` · `['metas','ciclos',metaId]` · `['gamificacao']` · `['conquistas']` · `['prioridades']` · `['relatorio',{periodo}]`.
Após toda mutação financeira: invalidar `['caixas','saldos']`, `['dia',…]`, `['lancamentos',…]`, `['metas']` e chamar `rpc_atualizar_metas`.

### 11.3 Códigos de erro → mensagens (pt-BR)
| Código | Mensagem ao usuário |
|---|---|
| `NAO_AUTENTICADO` | Sua sessão expirou. Entre novamente. |
| `DIA_ABERTO_EXISTENTE` | Você já tem um dia aberto. Feche-o antes de abrir outro. |
| `DIA_JA_EXISTE_NESTA_DATA` | Já existe um dia nesta data. Quer reabri-lo? |
| `DIA_NAO_ENCONTRADO` | Não encontramos esse dia. |
| `DIA_JA_FECHADO` | Este dia já foi fechado. |
| `DIA_FECHADO` | Este dia está fechado. Reabra o último dia para editar. |
| `DIA_NAO_ESTA_FECHADO` | Este dia ainda está aberto. |
| `APENAS_ULTIMO_DIA` | Só é possível reabrir o último dia fechado. |
| `KM_FINAL_INVALIDO` | O km final não pode ser menor que o km inicial. |
| `SALDO_INSUFICIENTE` | Saldo insuficiente no caixa de origem. |
| `CAIXAS_IGUAIS` | Escolha caixas diferentes. |
| `CAIXA_INVALIDO` | Caixa inválido. |
| `VALOR_INVALIDO` | Informe um valor maior que zero. |
| *(desconhecido)* | Algo deu errado. Tente de novo em instantes. |

Centralizar em `src/lib/erros.ts` (`traduzirErro(error)`); nunca mostrar texto técnico ao usuário; enviar o erro técnico ao Sentry.

### 11.4 Realtime (Fase 2)
Assinar mudanças de `lancamentos`, `dias_trabalho`, `meta_ciclos` e `gamificacao_usuario` filtradas por `user_id`; ao receber evento, invalidar as chaves de cache correspondentes.

---

## 12. Requisitos não funcionais

### 12.1 Desempenho
- **LCP < 2,5 s** em 4G médio e celular intermediário; **TTI < 4 s**.
- JavaScript inicial **< 250 KB gzip**; rotas e gráficos com *lazy loading*; Recharts e confete carregados sob demanda.
- Ação "Salvar entrada" com resposta visual **< 100 ms** (atualização otimista) e confirmação do servidor **< 1 s** em rede normal.
- Listas longas com paginação/virtualização (extrato e histórico).
- Imagens e ícones em SVG/WebP; fontes locais com `font-display: swap`.

### 12.2 Segurança
- **RLS em 100% das tabelas** com dados de usuário; testes automatizados provando isolamento entre usuários.
- Chave `service_role` **somente** em Edge Functions; nunca no front-end.
- Validação dupla: **Zod no front** e **CHECK/constraints no banco**.
- Funções RPC usam `auth.uid()` (nunca recebem `user_id` do cliente) e **não usam `SECURITY DEFINER`**, exceto `handle_new_user` e auditoria.
- Autenticação: confirmação de e-mail ativa, senha mínima 8, proteção contra senhas vazadas (opção do Supabase Auth), limite de tentativas, URLs de redirecionamento restritas.
- Cabeçalhos de segurança no deploy: CSP, `X-Content-Type-Options`, `Referrer-Policy`, HSTS; HTTPS obrigatório.
- Sem dados sensíveis em logs/Sentry (mascarar valores e e-mail).
- Dependências auditadas (`npm audit`) e atualizadas; *lockfile* versionado.

### 12.3 Privacidade e LGPD
- Política de Privacidade e Termos de Uso acessíveis; aceite no cadastro.
- Coletar apenas o necessário (nome, e-mail, dados financeiros que o próprio usuário digita).
- **Exportação** e **exclusão** de dados pelo próprio usuário (RN-27).
- Nenhum dado vendido ou compartilhado; analytics (se houver) **anônimo**.

### 12.4 Acessibilidade e compatibilidade
- WCAG 2.1 **AA**.
- Navegadores: Chrome/Edge/Samsung Internet (últimas 2 versões), Safari iOS 16+, Firefox (últimas 2). Android 8+ para o APK.
- Tamanho mínimo de tela 360 px; orientação retrato como padrão (paisagem funcional).

### 12.5 Confiabilidade e dados
- Fechamento do dia **atômico** (transação única) e **idempotente**.
- **Backups:** Supabase com backups diários; avaliar PITR no plano pago assim que houver usuários reais.
- **Migrações** reversíveis quando possível; nunca editar migração já aplicada (criar nova).
- Integridade: função de verificação `saldo = saldo_inicial + Σ lançamentos` testada; saldos **nunca** gravados manualmente.
- Escala-alvo: 50 mil lançamentos por usuário sem degradação perceptível (índices da seção 10).

### 12.6 Observabilidade
- Sentry (erros) com *release* e ambiente; *breadcrumbs* sem dados pessoais.
- Log de auditoria no banco para fechar/reabrir dia e alterações sensíveis.
- Métricas de produto anônimas (opcional): dias abertos, dias fechados, metas criadas.

### 12.7 Manutenibilidade
- Arquitetura por *features*; funções puras testadas; sem acesso ao banco em componentes visuais.
- README com passo a passo para rodar localmente; `docs/DECISOES.md` registrando decisões técnicas.
- CI (GitHub Actions): `lint` + `typecheck` + `test` + `build` a cada PR.

### 12.8 Requisitos não funcionais do APK
- **Desempenho:** abertura do app em **< 3 s** em celular intermediário; mesma fluidez do web; tamanho do APK **razoável** (meta inicial < 40 MB, confirmar após o primeiro build).
- **Compatibilidade:** versões do Android definidas na entrevista (`minSdk`); `targetSdk` conforme exigência atual do Google Play; testar em emulador com a API mais nova e em pelo menos um celular real.
- **Segurança:** seção 15.7 (sem segredos no pacote, HTTPS, depuração desligada no release, permissões mínimas, keystore protegida).
- **Privacidade:** a política de privacidade da Fase 6 cobre o app; formulário de Segurança dos dados da Google Play (se publicar) preenchido com fidelidade ao que o app realmente coleta.
- **Acessibilidade:** mesmos critérios do web (AA); alvos de toque ≥ 48 px; respeitar tamanho de fonte do sistema.
- **Confiabilidade:** sessão persistente; tratamento de falta de conexão; nenhum dado financeiro guardado só no aparelho (a fonte da verdade é o Supabase).
- **Observabilidade:** Sentry (se já adotado no web) também no app, sem dados pessoais.
- **Manutenibilidade:** código único em `src/`; adaptações nativas isoladas em `src/lib/plataforma.ts`; processo de atualização documentado (15.12).

---

## 13. Estratégia de testes

### 13.1 Pirâmide
| Nível | Ferramenta | Foco |
|---|---|---|
| Unidade | Vitest | `money.ts`, níveis de meta, limites de período, formatação, tradução de erros, projeções |
| SQL | pgTAP ou scripts SQL | Views, RPCs, RLS, triggers, constraints |
| Componente | Testing Library | MoneyInput, NumericKeypad, ProgressRing, Sheet, formulários |
| E2E | Playwright (viewport 390×844) | Fluxos completos de ponta a ponta |
| Manual | Checklist (Anexo D) | Aparelhos reais, PWA, APK |

### 13.2 Casos obrigatórios — dinheiro e caixa
1. `formatarMoeda(123456)` → `R$ 1.234,56`; `parseMoeda('1.234,56')` → `123456`.
2. MoneyInput: digitar `1`,`2`,`3`,`4`,`5` → `R$ 123,45`; backspace remove o último dígito.
3. Saldo do caixa = saldo inicial + Σ assinados, ignorando excluídos.
4. Transferência gera **2 lançamentos** ligados; saldo total (principal + manutenção) permanece igual.
5. Transferência acima do saldo → `SALDO_INSUFICIENTE`; saída da manutenção acima do saldo → bloqueada com opção de dividir.

### 13.3 Casos obrigatórios — dia de trabalho
6. Abrir dia com dia aberto existente → `DIA_ABERTO_EXISTENTE`.
7. Abrir dia na mesma data de um dia existente → `DIA_JA_EXISTE_NESTA_DATA`.
8. Abrir com saldo confirmado diferente → cria ajuste e `saldo_abertura` = valor confirmado.
9. Lançamento feito após a meia-noite num dia aberto herda a `data_referencia` do dia.
10. Inserir/editar lançamento em dia fechado → `DIA_FECHADO`.
11. Fechar dia: cria depósito, ajuste de conferência, snapshot `resumo`, `saldo_fechamento`; fechar de novo → `DIA_JA_FECHADO`.
12. Reabrir: só o último dia; estorna depósito e conferência; refechar recalcula igual.
13. Dia seguinte abre com `saldo_abertura` = `saldo_fechamento` do anterior (cadeia íntegra).

### 13.4 Casos obrigatórios — metas e gamificação
14. Limites de período: semana com início segunda/domingo; mês com 28/30/31 dias; virada de ano.
15. Níveis: valor = 69% → nenhum; 70% → bronze; 100% → prata; 130% → ouro (alvo 300 → 210/300/390).
16. Estrelas: nenhum→ouro direto (diária) = 5; bronze→prata = +2; semanal ×3; mensal ×10.
17. Nível máximo **não regride** se o valor cair; celebração **uma vez** por nível/ciclo.
18. Editar meta não altera ciclos passados (snapshot).
19. Cruzar limiar de estrelas muda a **fase** (ex.: 24 → 25 estrelas = fase 2).
20. `lucro_liquido` ignora transferências, retiradas pessoais e despesas pagas pela reserva.

### 13.5 Casos obrigatórios — segurança
21. Usuário A não lê, edita nem exclui dados do usuário B (todas as tabelas).
22. Chamar RPC sem sessão → `NAO_AUTENTICADO`.
23. Tentativa de `delete` direto em `lancamentos`/`dias_trabalho` pelo cliente → negada pelo RLS.

### 13.6 Fluxos E2E
- **Jornada completa:** cadastro → onboarding → abrir dia → 3 entradas → 2 saídas → lote → fechar com falta de R$ 5 e depósito de R$ 20 → ver medalha → dia seguinte abre com saldo correto.
- **Dia esquecido:** deixar dia aberto → simular dia seguinte → banner → fechar.
- **Meta:** criar meta diária → bater Bronze, Prata e Ouro → confete aparece uma vez cada.
- **Prioridade:** criar conta → pagar → saída criada e saldo atualizado.
- **Segurança:** logout limpa dados; rota privada redireciona.

---

## 14. Plano de implementação por etapas

> **Regra:** ao final de cada etapa, o agente (1) roda lint/typecheck/testes, (2) explica **como testar na prática**, (3) **pede aprovação** do dono do produto antes da próxima.

| Etapa | Objetivo | Entregáveis | Critério de aceite |
|---|---|---|---|
| **0 — Fundação** | Projeto base e design system | Vite + React + TS + Tailwind; ESLint/Prettier/Vitest; tokens de cor/tipografia; componentes base (Button, Card, Input, MoneyInput, NumericKeypad, Sheet, Toast, Tabs, BottomNav, ProgressRing, Skeleton); tela de demonstração do design system | App abre; botões com borda animada e glow funcionam; contraste AA; `money.ts` com testes passando |
| **1 — Banco** | Supabase pronto | Projeto Supabase (região São Paulo); migrações 0001–0004; tipos TS gerados; testes SQL de RLS e funções | Usuário novo recebe perfil, 2 caixas, plataformas e categorias; testes 3–5, 21–23 passam |
| **2 — Acesso** | Login e onboarding | Cadastro, login, recuperar/nova senha, rotas protegidas, onboarding de 5 passos | RF-AUT-01…06 e RF-ONB-01 atendidos; sessão persiste |
| **3 — Dia e lançamentos** | Núcleo do caixa | Abrir dia; Início; entrada/saída rápidas; lista com editar/excluir/desfazer; Caixa e extrato | RF-DIA-01…04, RF-LAN-01…07/10, RF-CAI-01/03; testes 6–10 passam; lançar em ≤ 3 toques |
| **4 — Fechamento e manutenção** | Fechar o dia com reserva | Stepper de fechamento; lote por plataforma; conferência; depósito; Caixa Manutenção (tela, config, pagar com reserva); reabrir dia | RF-DIA-05…09, RF-LAN-04, RF-MAN-01…03/05; testes 11–13 passam |
| **5 — Metas e gamificação** | Motivação | CRUD de metas; progresso; medalhas, estrelas, fases; confete/serpentina; Conquistas (básicas); sequência | RF-MET-01…04, RF-GAM-01…03/06; testes 14–20 passam; celebração uma vez por nível |
| **6 — Prioridades** | Contas em ordem | CRUD, ordenação, pagar com saída vinculada, recorrência, cartão na Home, meta mínima sugerida | RF-PRI-01…06 |
| **7 — Histórico e relatórios** | Visão do negócio | Histórico, detalhe do dia, calendário, relatórios e gráficos, comparativos, CSV | RF-REL-01…07 |
| **8 — Configurações e LGPD** | Controle do usuário | Perfil, plataformas, categorias, efeitos, semana/folgas, exportar dados, excluir conta (Edge Function), termos e privacidade, veículo (P1) | RF-CFG-01…10, RF-VEI-01…03 |
| **9 — PWA e offline** | Funcionar na rua | Manifest, ícones, *service worker*, instalação, fila offline de lançamentos, indicador online/offline, Realtime | RF-SYN-01…04; Lighthouse PWA ≥ 90; teste de modo avião |
| **10 — Qualidade e publicação** | Pronto para usuários reais | E2E completos, otimização, acessibilidade, Sentry, CI, deploy em produção, domínio, políticas | Lighthouse ≥ 90 (Perf/A11y/Best Practices); checklist do Anexo D |
| **11 — APK (= Fase de construção 7)** | App Android na pasta `APK/` | Capacitor, ícone/splash, botão voltar, barras do sistema, deep links, sessão, exportar arquivos, build debug e release assinado, finalização no Android Studio, Play Store (opcional) | Seção 15, RF-APK-01…27 e Anexos D2, F, H |

**Ordem de prioridade se o prazo apertar:** 0 → 1 → 2 → 3 → 4 → 5 → 10 (publicar MVP) → 6 → 7 → 8 → 9 → 11.

### 14.1 Correspondência entre as etapas do PRD e as 7 fases de construção
| Fase de construção | Etapas do PRD cobertas | Observação |
|---|---|---|
| **1** — Fundação e Design System | 0 | — |
| **2** — Banco e Acesso | 1 e 2 | Inclui testes SQL de todas as funções do banco |
| **3** — Núcleo do caixa | 3 | — |
| **4** — Fechamento, Manutenção e Prioridades | 4 e 6 (Prioridades) | A "meta mínima sugerida" (RF-PRI-04) entra na Fase 5 |
| **5** — Metas e gamificação | 5 | Inclui RF-PRI-04 |
| **6** — Relatórios, configurações, PWA e publicação | 7, 8, 9 (somente PWA instalável e indicador online/offline) e 10 | Fila offline e Realtime ficam no backlog |
| **7** — APK Android | 11 | Seção 15; pasta `APK/` |

---

## 15. Estratégia do APK (Fase 7 de construção) — pasta `APK/`

> **Versão 1.1 do PRD.** Esta seção substitui a versão 1.0, que só listava um esboço. A Fase 7 só começa depois que as Fases 1 a 6 estiverem **aprovadas** e o web app estiver **estável e publicado**.

### 15.1 Objetivo e princípios
- Converter **o mesmo sistema web que já funciona online** em **aplicativo Android (APK/AAB)**, dentro de uma pasta chamada **`APK/`** na raiz do projeto, e **finalizar no Android Studio**.
- **Mesmas funções, mesmo design, mesmas APIs, mesmo banco (Supabase) e mesmas regras de negócio.** Nada é reescrito nem reinventado; só se "empacota" e se adapta ao Android.
- **Fonte única de código:** telas e regras continuam em `src/`. A pasta `APK/` guarda apenas o "casco" Android e os scripts que empacotam o build web. *(Alternativa B, cópia completa do código dentro de `APK/`, só se o dono escolher na entrevista, sabendo que passam a existir dois códigos para manter.)*
- **O web não pode quebrar:** toda adaptação feita em `src/` passa por um adaptador com *fallback* para o navegador, e os testes web continuam verdes.
- **Somente Android.** iOS está fora do escopo.
- **Antes de começar:** o agente confirma que `docs/PROGRESSO.md` mostra a Fase 6 aprovada. Se não, **para e avisa**.

### 15.2 Decisões de arquitetura (padrão recomendado)
| Tema | Padrão (★) | Alternativa |
|---|---|---|
| Pasta `APK/` | Projeto Capacitor próprio (`package.json`, `capacitor.config.ts`, `android/`) que **reaproveita o build web da raiz** | **B:** cópia completa do código em `APK/` (independente, mas duplicada) |
| Origem das telas | `APK/www` = cópia do `dist` gerado pelo build web, feita por script | — |
| Carregamento | **Arquivos empacotados dentro do app** (funciona como app de verdade). **Não usar `server.url` apontando para o site** | Carregar o site remoto (não recomendado: depende de internet e pode ser recusado pela loja) |
| Banco e APIs | **Mesmo Supabase**; URL e *anon key* por variáveis de build (`.env.android`); nunca `service_role` | Usar o Supabase de teste no primeiro build |
| Plugins nativos | Mesma versão **na raiz** (para importar no código) e **em `APK/`** (para vincular ao Android) | — |
| Acesso a recursos nativos | **Somente** via `src/lib/plataforma.ts` (carrega o plugin só quando `isNativo()` é verdadeiro) | — |
| Service worker/PWA | **Desativado** dentro do app nativo (evita cache velho e conflito) | — |
| Orientação | Retrato | Automática |
| Idioma | pt-BR | — |

> **Validação obrigatória:** o agente confere na **documentação oficial do Capacitor** (capacitorjs.com/docs) se a organização acima (projeto Capacitor dentro de `APK/` com `webDir` próprio) é a recomendada hoje; se a documentação indicar outra forma, **apresenta as opções ao dono** antes de mudar. Registrar em `DECISOES.md`.

### 15.3 Pré-requisitos no computador
| Ferramenta | Para quê | Observação |
|---|---|---|
| **Android Studio** (versão estável atual) | Abrir o projeto, emulador, gerar APK/AAB | Instalar com **Android SDK Platform**, **SDK Command-line Tools** e **Emulator** |
| **JDK** | Compilar com Gradle | Em geral o JDK embutido no Android Studio serve; **confirmar a versão exigida** |
| **Node.js (LTS)** e **Git** | Já usados nas fases anteriores | — |
| **Celular Android** (opcional, ideal) | Testar de verdade | Ativar "Depuração USB" |
| **Virtualização ativada** no computador | Emulador rápido | Se lento, orientar a ativar na BIOS/configurações |

> O agente **deve conferir as versões exigidas** na documentação oficial do Capacitor e do Android **no dia da execução**, pois mudam a cada versão. *(Fontes de terceiros indicam que versões recentes do Capacitor pedem JDK 17 ou superior; confirmar na documentação oficial.)*

### 15.4 Estrutura de `APK/` e comandos de referência
```
APK/
├─ package.json            dependências do Capacitor (cli, android, plugins) e scripts npm
├─ capacitor.config.ts     appId, appName, webDir: 'www' (sem server.url)
├─ scripts/
│  ├─ verificar-ambiente.mjs   confere Node, Java, Android SDK, adb
│  └─ sincronizar-web.mjs      build web → copia dist para www → cap sync
├─ www/                    GERADO (cópia do build web). Não editar. Fora do Git
├─ android/                projeto nativo (é a pasta que o Android Studio abre)
├─ resources/              icon.png e splash.png (origem dos ícones)
├─ keystore/               chave de assinatura (FORA do Git — ver 15.8)
└─ README_APK.md           passo a passo em português
```
Comandos de referência (o agente adapta às versões atuais e entrega **um passo por vez** ao dono):
```
# na raiz do projeto
mkdir APK && cd APK
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "NOME_DO_APP" "br.com.SEU_PACOTE.drivecash" --web-dir=www
npx cap add android

# scripts de uso diário (em APK/package.json)
npm run android:sync      # gera o build web, copia para www e sincroniza com o Android
npm run android:abrir     # abre o projeto no Android Studio
npm run android:rodar     # roda no emulador/celular conectado
```
No `package.json` da **raiz**: script `build:android` (`vite build --mode android`) e arquivo `.env.android` (variáveis do build do app). A variável `VITE_PLATAFORMA=android` liga os ajustes nativos e desliga o PWA.

### 15.5 Adaptações obrigatórias web → Android
| Tema | Problema no app | Solução | RF |
|---|---|---|---|
| **Botão voltar** | O Android fecha o app no lugar de voltar uma tela; no Android 16 o "voltar preditivo" muda o comportamento | Ouvir o voltar: **fecha sheets/modais → volta a rota → no Início, "toque de novo para sair"** | RF-APK-10 |
| **Barras do sistema** | Conteúdo embaixo das barras (tela de ponta a ponta nas versões novas) | Barras escuras, ícones claros, **áreas seguras** respeitadas; usar a solução oficial atual do Capacitor | RF-APK-11 |
| **Teclado** | Teclado cobre campos | Ajuste de layout ao abrir o teclado; manter o teclado numérico próprio nos valores | RF-APK-12 |
| **Sessão de login** | O armazenamento do WebView pode ser limpo | Guardar a sessão do Supabase no armazenamento do Capacitor (Preferences) | RF-APK-13 |
| **Links de e-mail** | Link de confirmar e-mail/recuperar senha abre o navegador | **Deep link** (esquema próprio e, se houver domínio, App Links) que reabre o app e conclui o fluxo | RF-APK-14 |
| **Downloads/Exportação** | `download` de arquivo não funciona como no navegador | Salvar com **Filesystem** e abrir o menu **Compartilhar** do Android | RF-APK-15 |
| **Online/offline** | `navigator.onLine` é pouco confiável | Plugin **Network** para o indicador | RF-APK-16 |
| **Vibração** | — | **Haptics** nativo ao salvar, medalha e fase (respeita a configuração) | RF-APK-17 |
| **PWA/Service worker** | Cache velho e prompt de instalação sem sentido | Desativar quando `isNativo()` | RF-APK-18 |
| **Links externos** | Sair do app sem querer | Abrir no navegador do sistema (**Browser**) | RF-APK-07 |
| **Sem internet ao abrir** | Tela branca | Tela amigável "Sem conexão" com botão **Tentar de novo** | RF-APK-19 |
| **Splash e ícone** | Padrão genérico | Ícone adaptativo e splash preta com a marca | RF-APK-04 |
| **Seleção/zoom/rolagem** | Seleção de texto e "esticar" a página parecem site | Desativar zoom, seleção em botões e *overscroll* indevido | RF-APK-09 |
| **Desempenho do confete** | Celulares simples travam | Limitar partículas; já respeita "reduzir movimento" | RF-APK-09 |

### 15.6 Supabase Auth no Android (e-mail e senha)
1. Entrar, cadastrar e sair funcionam **igual ao web** (mesmo projeto Supabase).
2. **Armazenamento da sessão:** adaptador do Supabase usando o armazenamento do Capacitor.
3. **Esquema de links do app** (ex.: `drivecash://auth/callback`, ajustado na entrevista) registrado no `AndroidManifest.xml`.
4. Adicionar o esquema (e a URL web) à lista de **URLs de redirecionamento** no painel do Supabase Auth.
5. Ouvir `appUrlOpen` (plugin App), extrair os dados do link e **concluir a sessão** (confirmar e-mail / nova senha).
6. **Modelos de e-mail** do Supabase: o link deve funcionar tanto no navegador quanto no celular (página web de "abrir no app" como alternativa).
7. Testar o fluxo completo em celular real: cadastro → e-mail → link → app logado.

### 15.7 Segurança do app nativo
- **Nenhuma chave secreta** no APK (somente URL e *anon key*). Conferir o pacote final procurando `service_role`.
- **Somente HTTPS** (sem tráfego sem criptografia); depuração do WebView **desligada** no build de release.
- **Permissões mínimas:** apenas internet (e rede). Revisar o `AndroidManifest.xml`; nada de câmera, localização ou contatos nesta fase.
- Avaliar `allowBackup` desligado, para a sessão não ir para backups automáticos do Android.
- **Keystore e senhas fora do Git e fora do chat.**
- Mesmo isolamento por **RLS** no Supabase: o app não ganha nenhum acesso extra.

### 15.8 Assinatura (keystore) e tipos de build
| Tipo | Para quê | Resultado |
|---|---|---|
| **Debug** | Testar no emulador/celular | `app-debug.apk` |
| **Release assinado (APK)** | Instalar em celulares fora da loja | `app-release.apk` |
| **Release assinado (AAB)** | Enviar para a Google Play | `app-release.aab` |

- A **keystore** (arquivo de chave) é criada **uma vez**, com a ajuda do agente/Android Studio. **Quem perde a chave pode ficar sem conseguir atualizar o app.**
- **Guardar 2 cópias** (ex.: pen drive + nuvem privada) e as senhas em gerenciador de senhas. **Nunca** no Git, no chat ou em print.
- Senhas lidas de `keystore.properties` (fora do Git), nunca escritas dentro de `build.gradle`.
- Se for publicar na Play Store, usar **Play App Signing** (o Google guarda a chave final; o dono guarda a chave de envio).
- **Versionamento:** `versionName` semântico (1.0.0) e `versionCode` inteiro **sempre crescente** a cada versão enviada.

### 15.9 Finalização no Android Studio
O resultado da Fase 7 é fechado **dentro do Android Studio**, com o dono guiado passo a passo pelo agente (**Anexo F**):
1. Abrir a pasta `APK/android` e aguardar a sincronização do Gradle.
2. Criar o emulador e rodar o app.
3. Rodar no celular real (opcional).
4. Gerar o **APK de teste** e o **release assinado** (APK e, se for publicar, AAB).
5. Guardar o keystore e confirmar a instalação do APK no celular.

### 15.10 Publicação na Google Play (opcional — só se o dono escolher)
> **Regras do Google mudam.** O agente deve **confirmar tudo no site oficial do Google Play Console no dia**. Itens observados em out/2026:
- **API de destino:** novos apps e atualizações precisam mirar o **Android 16 (API 36) ou superior** desde 31/08/2026 (confirmar).
- **Conta de desenvolvedor:** taxa única de **US$ 25** e verificação de identidade.
- **Conta pessoal criada após 13/11/2023:** exige **teste fechado com no mínimo 12 testadores por 14 dias seguidos** antes de pedir acesso à produção. **Contas de organização não têm essa exigência.** *(Confirmar o número atual de testadores.)*
- **Obrigatórios na ficha:** política de privacidade pública (a da Fase 6), formulário de **Segurança dos dados**, classificação de conteúdo, ícone 512×512, capturas de tela, descrição em português.
- O agente prepara os **textos da ficha em português**; **nada é enviado à loja sem aprovação do dono**.

### 15.11 Testes e paridade
- **Dispositivos:** emulador com a API mais nova **e** pelo menos um celular real (ideal: um Android antigo e um novo).
- **Cenários obrigatórios:** instalar; cadastro com link de e-mail; login e logout; sessão continua após fechar e reabrir o app; recuperar senha pelo link; abrir dia → lançar → fechar; meta com confete; Caixa Manutenção; prioridades; relatórios; exportar CSV; botão voltar; teclado; sem internet; troca de aplicativo e retorno; tempo de abertura (< 3 s em celular intermediário).
- **Paridade:** executar o **Anexo H** (checklist web ↔ APK). Cada item deve ser idêntico ao web.
- **Verificações técnicas:** web continua com testes/lint/build verdes; o build Android compila por linha de comando (Gradle) antes de pedir ao dono para abrir o Android Studio; ausência de `server.url` e de `service_role` no pacote.

### 15.12 Atualizações futuras do app
1. Alterar o código web em `src/` (como sempre) e publicar o web.
2. Rodar `npm run android:sync` na pasta `APK/`.
3. Aumentar `versionName` e `versionCode`.
4. Gerar novo release assinado no Android Studio.
5. Instalar/enviar a nova versão. Registrar em `README_APK.md`.

### 15.13 Fora do escopo da Fase 7
iOS; notificações push (FCM); biometria/PIN *(P2 — só entra se o dono escolher na entrevista)*; login com Google; widgets; localização em segundo plano; modo offline com fila *(P2)*; qualquer mudança de regra de negócio ou de visual em relação ao web.

---

## 16. Riscos e decisões em aberto

### 16.1 Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| Usuário esquece de fechar o dia | Metas/saldos defasados | Banner de dia esquecido; lembretes (Fase 2); fechamento sem conferência |
| Sem sinal na rua | Perda de lançamentos | UI otimista, IDs no cliente, fila offline (Fase 2) |
| Complexidade do fechamento | Erros de saldo | Função atômica + testes numéricos (Anexo A) |
| Edição de dias antigos quebra a cadeia de saldos | Saldos inconsistentes | Dias fechados somente leitura; reabrir só o último; saldo derivado do livro-razão |
| Gamificação desmotivar quem não bate meta | Abandono | Níveis Bronze acessíveis (70%), nunca punir; mensagens positivas |
| Confete pesado em celular simples | Travamentos | Limite de partículas; respeitar "reduzir movimento"; opção de desligar |
| Vazamento de dados financeiros | Grave | RLS testado, sem `service_role` no cliente, CSP, auditoria |
| Mudança de regras do Supabase/Capacitor | Retrabalho | Versões fixadas; `DECISOES.md` |
| Perder a keystore do app | Impossível atualizar o app | 2 cópias fora do Git + senhas em gerenciador; guia no Anexo F.8 |
| Link de e-mail não abre o app | Cadastro/recuperar senha travam | Deep link testado em celular real; página web de apoio |
| Diferença visual ou funcional entre web e APK | Experiência inconsistente | Fonte única de código; Anexo H (paridade) obrigatório |
| Regras da Google Play mudam (API de destino, teste fechado) | Atraso na publicação | Confirmar no site do Google no dia; planejar ~3 semanas para conta pessoal nova |
| Android novo muda comportamento (voltar preditivo, tela de ponta a ponta) | Telas cortadas ou voltar quebrado | Adaptações da seção 15.5; teste em emulador com a API mais nova |
| Dependências duplicadas (raiz e `APK/`) com versões diferentes | Falhas estranhas de build | Mesmas versões fixadas; script de verificação |

### 16.2 Decisões em aberto (o dono do produto confirma; até lá, usar o padrão indicado)
1. **Nome do app:** padrão **DriveCash** (provisório).
2. **"Prioridades":** padrão = **contas/obrigações em ordem de importância** (seção 6.5). Se a intenção era outra (ex.: prioridades de tarefas/objetivos), ajustar RN-24/25.
3. **Dinheiro físico × saldo no app:** o caixa trata tudo como "caixa do motorista". Campo `meio_pagamento` existe para análise; separar "dinheiro em mãos" de "saldo a receber do app" fica como melhoria futura.
4. **Depósito de manutenção:** padrão = **no fechamento** do dia (sugerido, editável). Alternativa: na abertura.
5. **Níveis das metas:** padrão 70% / 100% / 130%; ajustáveis por meta.
6. **Dias de folga e sequência:** padrão sem folgas configuradas; usuário ajusta em Configurações.
7. **Modelo de negócio** (gratuito, assinatura, anúncios): fora deste PRD.
8. **Identidade visual** (logo, ícone do app): gerar proposta na Etapa 0 para aprovação.
9. **Estrutura da pasta `APK/`** *(Fase 7)*: padrão **A** = projeto Capacitor que reaproveita o código da raiz; alternativa **B** = cópia completa.
10. **Nome exibido e `applicationId`** do app *(Fase 7)*: padrão = nome do app da Fase 1 e pacote `br.com.SEUNOME.drivecash` (**não muda depois de publicado**).
11. **Banco usado pelo APK:** padrão = **o mesmo Supabase de produção** do web.
12. **Versões de Android suportadas (`minSdk`):** padrão = o mínimo do Capacitor atual.
13. **Botão voltar no Início:** padrão = "toque de novo para sair".
14. **Biometria/PIN ao abrir o app:** padrão = **não** nesta fase (P2).
15. **Entrega final:** APK para instalar fora da loja (padrão), publicação na Google Play ou os dois; tipo de conta de desenvolvedor.
16. **Links de e-mail:** padrão = deep link com esquema próprio; App Links só se houver domínio próprio.

---

## 17. Anexos

### Anexo A — Exemplo numérico de referência (usar nos testes)
**Situação:** usuário com meta diária de **receita R$ 300** (Bronze 70% = R$ 210 · Prata 100% = R$ 300 · Ouro 130% = R$ 390) e depósito de manutenção **fixo de R$ 20**.

| Item | Valor |
|---|---|
| Caixa principal ao abrir (acumulado do dia anterior) | R$ 150,00 |
| Entradas: Uber R$ 220,00 (8 corridas) + 99 R$ 130,00 (5) + Particular R$ 50,00 (1) | **R$ 400,00 · 14 corridas** |
| Saídas: Combustível R$ 90,00 + Alimentação R$ 25,00 + Crédito no app R$ 30,00 | **R$ 145,00** |
| **Lucro líquido** (400 − 145) | **R$ 255,00** |
| Saldo calculado antes do fechamento (150 + 400 − 145) | R$ 405,00 |
| Dinheiro informado na conferência | R$ 400,00 → **falta de R$ 5,00** (ajuste de saída) |
| Depósito de manutenção | R$ 20,00 (transferência principal → manutenção) |
| **Sobra livre** (255 − 20) | **R$ 235,00** |
| **Caixa final / abertura do dia seguinte** (405 − 5 − 20) | **R$ 380,00** |
| Caixa Manutenção após o depósito (se estava em R$ 0) | R$ 20,00 |
| Receita R$ 400 ≥ R$ 390 | 🥇 **Ouro** na meta diária → **+5 ⭐** |
| Ticket médio (400 ÷ 14) | R$ 28,57 |

### Anexo B — Microcopy (textos em pt-BR)
| Contexto | Texto |
|---|---|
| Abrir dia (título) | "Bom dia! Pronto para rodar?" |
| Botão abrir | "⏱ Bater ponto — Abrir dia" |
| Saldo acumulado | "Seu caixa acumulado: {valor}" |
| Ponto batido | "Ponto batido às {hora}. Bom trabalho!" |
| Entrada salva | "+{valor} no caixa" |
| Saída salva | "−{valor} registrado" |
| Desfazer | "Lançamento excluído · **Desfazer**" |
| Caixa negativo | "Seu caixa ficou negativo em {valor}. Falta lançar alguma entrada?" |
| Dia esquecido | "Você esqueceu de fechar o dia {data}. Vamos fechar agora?" |
| Conferência — falta | "Faltam {valor} no caixa. Vamos registrar o ajuste?" |
| Conferência — sobra | "Sobraram {valor}. Vamos registrar o ajuste?" |
| Manutenção | "Guardar {valor} para a manutenção hoje?" · "Pular hoje" |
| Dia fechado | "Dia fechado! Amanhã você começa com {valor}." |
| Bronze | "Bronze desbloqueado! Você chegou à meta mínima." |
| Prata | "Prata! Meta batida!" |
| Ouro | "OURO! Você superou a meta!" |
| Mudou de fase | "Nova fase: {nome}! Continue assim." |
| Faltando pouco | "Faltam só {valor} para a meta de hoje." |
| Vazio — lançamentos | "Nenhum lançamento ainda. Que tal registrar a primeira corrida?" |
| Vazio — metas | "Crie sua primeira meta e comece a ganhar medalhas." |
| Erro genérico | "Algo deu errado. Tente de novo em instantes." |
| Excluir conta | "Isso apaga tudo e não pode ser desfeito. Digite EXCLUIR para confirmar." |

### Anexo C — Catálogo de conquistas (seed de `conquistas_catalogo`)
| Código | Título | Como desbloquear | ⭐ bônus |
|---|---|---|---|
| `primeiro_dia` | Ponto batido | Abrir o primeiro dia | 2 |
| `primeira_entrada` | Primeira corrida | Registrar a primeira entrada | 1 |
| `primeiro_fechamento` | Dia encerrado | Fechar o primeiro dia | 2 |
| `primeira_meta` | Meta batida | Atingir qualquer nível em uma meta | 3 |
| `primeiro_ouro` | Ouro puro | Conquistar a primeira medalha de ouro | 5 |
| `sequencia_3` | Pegando ritmo | 3 dias seguidos abertos e fechados | 3 |
| `sequencia_7` | Semana de ferro | 7 dias seguidos | 8 |
| `sequencia_14` | Quinzena firme | 14 dias seguidos | 15 |
| `sequencia_30` | Mês imparável | 30 dias seguidos | 40 |
| `semana_perfeita` | Semana perfeita | Prata ou mais na meta diária em todos os dias de trabalho da semana | 15 |
| `mes_perfeito` | Mês perfeito | Ouro na meta mensal | 30 |
| `reserva_100` | Cofre aberto | R$ 100 na Manutenção | 2 |
| `reserva_500` | Cofre recheado | R$ 500 na Manutenção | 5 |
| `reserva_1000` | Reserva de ouro | R$ 1.000 na Manutenção | 10 |
| `reserva_meta` | Reserva completa | Atingir a meta de reserva | 10 |
| `dia_500` | Dia de 500 | Receita ≥ R$ 500 em um dia | 5 |
| `corridas_100` | Centurião | 100 corridas acumuladas | 5 |
| `corridas_1000` | Mil corridas | 1.000 corridas acumuladas | 20 |
| `contas_certas` | Contas certas | 7 conferências seguidas sem diferença | 8 |
| `primeira_conta_paga` | Conta paga | Pagar a primeira prioridade | 2 |
| `contas_em_dia` | Organizado | Pagar todas as prioridades do mês em dia | 8 |
| `madrugador` | Madrugador | Abrir o dia antes das 05:00 | 2 |

### Anexo D — Checklist de lançamento
- [ ] Todas as RN testadas (seção 13) e CI verde.
- [ ] RLS verificado com dois usuários reais; nenhuma chave secreta no repositório/bundle.
- [ ] Lighthouse ≥ 90 (Desempenho, Acessibilidade, Boas Práticas, PWA).
- [ ] Testado em Android (Chrome) e iPhone (Safari) reais, em 360 px e 390 px.
- [ ] Modo avião: lançar offline e sincronizar ao voltar (Fase 2).
- [ ] Confete/efeitos com opção de desligar e "reduzir movimento" respeitado.
- [ ] E-mails de confirmação e recuperação de senha com remetente e textos em português.
- [ ] Termos e Política de Privacidade publicados; exclusão de conta funcionando.
- [ ] Sentry recebendo erros; backups do Supabase conferidos.
- [ ] Domínio, HTTPS e cabeçalhos de segurança configurados.
- [ ] Ícone, *splash* e nome do app finais.
- [ ] Plano de suporte: canal de contato e formulário de feedback.

### Anexo D2 — Checklist de lançamento do APK
- [ ] Fases 1 a 6 aprovadas e web estável antes de começar.
- [ ] Pasta `APK/` criada na raiz; `APK/www`, `android/build` e `keystore/` fora do Git.
- [ ] Web continua com testes, lint e build verdes após as adaptações em `src/`.
- [ ] `applicationId` e nome definidos e registrados (pacote **não muda** depois de publicado).
- [ ] Sem `server.url` no `capacitor.config.ts`; app usa os arquivos empacotados.
- [ ] Nenhuma chave secreta no pacote (busca por `service_role` sem resultados).
- [ ] Permissões do `AndroidManifest.xml` revisadas (apenas o necessário).
- [ ] Depuração do WebView desligada no release; tráfego somente HTTPS.
- [ ] Ícone adaptativo e splash corretos; barras do sistema escuras; áreas seguras ok.
- [ ] Botão voltar, teclado, sessão persistente e links de e-mail testados em celular real.
- [ ] Exportar CSV/dados funcionando pelo menu Compartilhar.
- [ ] Anexo H (paridade web ↔ APK) 100% conferido.
- [ ] APK de teste instalado no emulador **e** no celular.
- [ ] Release assinado gerado; **keystore e senhas guardadas em 2 cópias fora do Git**.
- [ ] `APK/README_APK.md` entregue (como atualizar, como gerar nova versão, onde está a keystore).
- [ ] *(Se publicar)* ficha da Play Store, política de privacidade, segurança dos dados, teste fechado conforme regras atuais do Google.

### Anexo E — Prompt inicial para colar no agente (Antigravity)
```
Você é o agente de desenvolvimento do projeto DriveCash. Leia o arquivo docs/PRD.md inteiro.
Regras: (1) trabalhe por etapas conforme a seção 14; (2) antes de cada etapa, me mostre um plano curto e
espere minha aprovação; (3) eu NÃO sou programador: explique simples, dê comandos prontos para colar,
um passo por vez, e diga como testar na prática; (4) dinheiro sempre em centavos (inteiro);
(5) RLS em todas as tabelas, nunca expor service_role; (6) não invente funcionalidades fora do PRD.
Comece pela ETAPA 0 (Fundação). Antes de codar, liste o que vai criar e quais comandos eu vou rodar.
```

### Anexo F — Guia do Android Studio, passo a passo (para o dono)
> Os nomes de menu podem variar um pouco conforme a versão do Android Studio. O agente adapta e guia **um passo por vez**.

**F.1 — Instalar o Android Studio**
1. Baixe em `developer.android.com/studio` e instale.
2. Na primeira abertura, siga o assistente (**Standard**) e deixe baixar o **Android SDK**.
3. Em *More Actions → SDK Manager*, confirme: **SDK Platform** da API mais nova, **Command-line Tools** e **Emulator**.

**F.2 — Abrir o projeto**
1. *File → Open* e escolha a pasta **`APK/android`** (não a raiz do projeto).
2. Aguarde a barra inferior terminar o **"Gradle sync"** (pode demorar na primeira vez).
3. Se aparecer pedido para atualizar o Gradle ou o plugin, **não aceite sem perguntar ao agente**.

**F.3 — Criar o emulador (celular virtual)**
1. *Tools → Device Manager → Create Device*.
2. Escolha um modelo (ex.: **Pixel**), depois baixe a imagem do sistema (**API mais nova**) e conclua em *Finish*.
3. Toque no ▶ ao lado do emulador para ligá-lo.

**F.4 — Rodar o app no emulador**
1. Selecione o emulador na barra superior.
2. Clique no botão **▶ Run 'app'**. O app abre no celular virtual.

**F.5 — Rodar no seu celular real (opcional, recomendado)**
1. No celular: *Configurações → Sobre o telefone* → toque **7 vezes** em **Número da versão** para liberar as **Opções do desenvolvedor**.
2. Nas **Opções do desenvolvedor**, ative **Depuração USB**.
3. Conecte o cabo USB, autorize o computador no celular e escolha o aparelho na barra superior do Android Studio.
4. Clique em ▶.

**F.6 — Gerar o APK de teste (debug)**
1. *Build → Build Bundle(s) / APK(s) → Build APK(s)*.
2. Clique em **locate** no aviso que aparece. O arquivo é `app-debug.apk` (em `APK/android/app/build/outputs/apk/debug/`).

**F.7 — Gerar o APK/AAB assinado (release)**
1. *Build → Generate Signed Bundle / APK* (em versões novas: *Build → Generate App Bundles or APKs → Generate Signed App Bundle or APK*).
2. Escolha **APK** (instalar fora da loja) ou **Android App Bundle** (Play Store).
3. Em **Key store path**, clique em **Create new…** e preencha: local do arquivo (pasta `APK/keystore/`), senhas, **alias** e dados do titular. *(O agente orienta o que digitar.)*
4. Escolha **release**, marque as versões desejadas e clique em **Create**.
5. Clique em **locate** para achar o arquivo gerado.

**F.8 — Guardar a chave (MUITO IMPORTANTE)**
1. Faça **2 cópias** do arquivo `.jks`/`.keystore` (pen drive + nuvem privada).
2. Guarde **senha da keystore, alias e senha da chave** em um gerenciador de senhas.
3. **Nunca** envie a keystore ou as senhas pelo chat, e-mail ou Git.

**F.9 — Instalar o APK no celular**
1. Copie o arquivo `.apk` para o celular (cabo, nuvem ou WhatsApp para você mesmo).
2. Abra o arquivo e permita **"Instalar de fontes desconhecidas"** para o aplicativo que você usou para abri-lo.
3. Toque em **Instalar** e abra o app.

**F.10 — Problemas comuns**
| Sintoma | O que fazer |
|---|---|
| "Gradle sync failed" | *File → Sync Project with Gradle Files*; se persistir, avisar o agente com o texto do erro |
| "SDK location not found" | Conferir o SDK no *SDK Manager* e avisar o agente |
| Emulador lento ou não abre | Ativar a virtualização do computador; usar o celular real |
| App abre em branco | Na pasta `APK/`, rodar `npm run android:sync` e rodar de novo |
| App não instala no celular | Liberar "fontes desconhecidas" e conferir a versão do Android |
| Login funciona no site mas não no app | Avisar o agente (pode ser URL de redirecionamento do Supabase) |

### Anexo H — Checklist de paridade web ↔ APK
> Cada linha deve se comportar **igual** ao web (mesmos números, mesmos textos, mesmo visual). Marcar como ✅ somente após testar no celular real.

| # | Item | Web | APK |
|---|---|---|---|
| 1 | Cadastro, login, logout, recuperar senha (com link de e-mail abrindo o app) | ☐ | ☐ |
| 2 | Onboarding de 5 passos | ☐ | ☐ |
| 3 | Abrir dia (bater ponto) com saldo acumulado e ajuste | ☐ | ☐ |
| 4 | Entrada rápida (≤ 3 toques) e saída rápida | ☐ | ☐ |
| 5 | Editar, excluir e desfazer lançamento | ☐ | ☐ |
| 6 | Caixa atual, extrato e seletor Principal/Manutenção | ☐ | ☐ |
| 7 | Aviso de caixa negativo e de dia esquecido | ☐ | ☐ |
| 8 | Fechar dia (4 passos), conferência e depósito de manutenção | ☐ | ☐ |
| 9 | Lote por plataforma | ☐ | ☐ |
| 10 | Reabrir último dia | ☐ | ☐ |
| 11 | Caixa Manutenção (saldo, meta de reserva, gastar da reserva) | ☐ | ☐ |
| 12 | Prioridades (cadastrar, pagar, recorrência, vencidas) | ☐ | ☐ |
| 13 | Metas (criar, painel, níveis em R$) | ☐ | ☐ |
| 14 | Medalhas, estrelas, mudança de fase, conquistas, sequência | ☐ | ☐ |
| 15 | Confete/serpentina, som e vibração conforme configuração | ☐ | ☐ |
| 16 | Histórico, detalhe do dia, calendário | ☐ | ☐ |
| 17 | Relatórios e gráficos | ☐ | ☐ |
| 18 | Exportar CSV e exportar meus dados | ☐ | ☐ |
| 19 | Veículo, custo e lucro por km | ☐ | ☐ |
| 20 | Configurações (plataformas, categorias, depósito, semana, efeitos) | ☐ | ☐ |
| 21 | Excluir minha conta | ☐ | ☐ |
| 22 | Termos de Uso e Política de Privacidade | ☐ | ☐ |
| 23 | Indicador online/offline e tela "Sem conexão" | ☐ | ☐ |
| 24 | Dados idênticos ao web com a mesma conta (mesmo Supabase) | ☐ | ☐ |
| 25 | Visual: cores, fontes, botões com borda/sombra, animações | ☐ | ☐ |
| 26 | Botão voltar, teclado, barras do sistema e áreas seguras | ☐ | ☐ |
| 27 | Sessão continua após fechar e reabrir o app | ☐ | ☐ |

> **Nota (v1.1):** os comandos oficiais de cada fase (1 a 7), com entrevista e aprovação, estão em `docs/fases/`. O APK usa o comando da **Fase 7** (`docs/fases/FASE_7_APK_ANDROID.md`).
