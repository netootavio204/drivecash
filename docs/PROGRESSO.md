# Progresso do projeto Meta Driver (Web App)

> O agente atualiza este arquivo ao fechar cada fase. Ele é a "memória" do projeto: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Aprovada em |
|---|---|---|---|
| 1 | Fundação e Design System | 🔍 pronta para aprovação | — |
| 2 | Banco de dados (Supabase) e Acesso | ⏳ não iniciada | — |
| 3 | Núcleo do caixa (abrir dia, lançamentos, extrato) | ⏳ não iniciada | — |
| 4 | Fechamento do dia, Caixa Manutenção e Prioridades | ⏳ não iniciada | — |
| 5 | Metas, medalhas, estrelas, fases e conquistas | ⏳ não iniciada | — |
| 6 | Histórico, relatórios, configurações, PWA e publicação | ⏳ não iniciada | — |

## Como rodar o projeto
```bash
# Rodar localmente
npm run dev
# Abrir no navegador: http://localhost:5173 e http://localhost:5173/design-system

# Rodar todos os testes unitários (18 testes)
npm test

# Validação estrita de TypeScript
npm run typecheck

# Validação de estilo e qualidade
npm run lint

# Build de produção
npm run build
```

## O que já existe
- **Fundação Técnica:** React 18, Vite, TypeScript estrito, Tailwind CSS, React Router v7, TanStack Query, Zustand, Framer Motion, canvas-confetti, Lucide Icons, Vitest, Testing Library.
- **Design System Completo:**
  - Tokens de cor oficiais (vermelho neon #FF2D2D, laranja neon #FF7A00, positivo verde, negativo vermelho, superfícies escuras).
  - Cantos bem arredondados (`--raio-sm: 14px`, `--raio-md: 18px`, `--raio-lg: 28px`).
  - Brilho médio nos cartões e botões.
  - Fontes locais empacotadas (Sora para títulos, Inter para textos, Space Grotesk com alinhamento tabular para moedas e números).
  - Componentes base: Button (todas as variantes e estados), IconButton, FAB central giratório com gradiente, Card (Padrão, Destaque com borda em gradiente, Vidro translúcido), StatCard com sinalização de variação, Input com rótulo flutuante, MoneyInput com máscara estilo banco, NumericKeypad touch, Chip, Switch, Tabs acessíveis, BottomNav mobile, SidebarNav desktop, ProgressRing com marcos 🥉🥈🥇, ProgressBar, Skeleton com brilho reflexivo, EmptyState, ErrorState, Modal, ConfirmDialog com palavra de segurança, Toast com ação "Desfazer", Medalha SVG e celebrações com chuva de confetes.
- **Identidade:** Logo oficial integrado em múltiplos tamanhos (`/logo.png`, `/logo-96.png`, `/logo-192.png`, `/logo-512.png`).
- **Rotas e Navegação:** Todas as 12 rotas do PRD mapeadas e funcionais com `EmptyState` ou dashboard demonstrativo interativo.
- **Vitrine `/design-system`:** Rota com todos os componentes e estados interativos lado a lado para teste no navegador.
- **Testes Unitários:** 18 testes automatizados para `money.ts`, `datas.ts`, `MoneyInput` e `NumericKeypad`.

## Decisões importantes
- **Nome:** Meta Driver (atualizado em `config.ts`, `textos.ts`, `package.json` e `index.html`).
- **Logo:** Imagem fornecida pelo dono do produto aplicada como identidade oficial.
- **Tema:** Dark mode exclusivo com superfícies pretas profundas e gradiente assinatura vermelho→laranja.
- **Repositório GitHub:** `netootavio204/drivecash` vinculado via branch `fase-1-fundacao`.

## Pendências e dificuldades registradas
_(nenhuma)_

## Próximo passo
Aprovação do dono do produto para seguir para a **Fase 2 — Banco de dados (Supabase) e Acesso**.
