# Progresso do projeto Meta Driver (Web App)

> O agente atualiza este arquivo ao fechar cada fase. Ele é a "memória" do projeto: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Aprovada em |
|---|---|---|---|
| 1 | Fundação e Design System | ✅ aprovada | 2026-10-10 |
| 2 | Banco de dados (Supabase) e Acesso | ✅ aprovada | 2026-10-10 |
| 3 | Núcleo do caixa (abrir dia, lançamentos, extrato) | ✅ aprovada | 2026-10-10 |
| 4 | Fechamento do dia, Caixa Manutenção e Prioridades | ✅ aprovada | 2026-10-10 |
| 5 | Metas, medalhas, estrelas, fases e conquistas | ✅ aprovada | 2026-10-10 |
| 6 | Histórico, relatórios, configurações, PWA e publicação | ✅ concluída | 2026-10-10 |

## Como rodar o projeto
```bash
# Rodar localmente o servidor Vite
npm run dev
# Abrir no navegador: http://localhost:5173

# Rodar todos os testes unitários (41 testes automatizados)
npm test

# Validação estrita de TypeScript (0 erros)
npm run typecheck

# Validação de estilo e qualidade ESLint (0 erros)
npm run lint

# Build de produção (gerado com sucesso)
npm run build
```

## O que já existe
- **Fundação & Design System (Fase 1):**
  - React 18, Vite, TypeScript estrito, Tailwind CSS, React Router v7, TanStack Query, Zustand, Framer Motion, canvas-confetti, Lucide Icons, Vitest.
  - Design System completo com tema escuro, gradientes vermelho/laranja neon, fontes empacotadas (Sora, Inter, Space Grotesk) e vitrine em `/design-system`.
- **Banco de Dados & Supabase (Fase 2):**
  - Scripts SQL versionados em `supabase/migrations/`:
    - `0001_schema.sql` até `0006_fase6_perfil_whatsapp_veiculo.sql`.
    - Suporte a multiusuário via RLS, trigger automático de novos usuários e `FULL_SETUP.sql` consolidado.
- **Autenticação & Acesso (Fase 2):**
  - Telas completas: Login, Cadastro, Recuperar Senha, Nova Senha, Onboarding de 5 passos, Termos e Privacidade.
- **Núcleo do Caixa (Fase 3):**
  - Bater Ponto / Abrir Dia, Entrada Rápida, Saída Rápida, Painel Início com Caixa Atual em destaque e Extrato completo.
- **Fechamento do Dia, Caixa Manutenção e Prioridades (Fase 4):**
  - Fechamento em 4 passos com conferência de dinheiro, Reserva de Manutenção protegida, Contas Prioritárias urgentes.
- **Metas, Medalhas, Estrelas, Fases e Conquistas (Fase 5):**
  - Metas diárias, semanais e mensais com marcos 🥉 (70%), 🥈 (100%), 🥇 (130%).
  - Medalhas neon, sintetizador Web Audio API (`som.ts`), confetes (`confete.ts`), 7 fases e catálogo de 22 conquistas.
- **Histórico, Relatórios, Veículo, Configurações e PWA (Fase 6):**
  - **Histórico de Dias (`/historico`):**
    - Visão em Lista e Visão em Calendário Mensal com cores por lucro.
    - Modal de Detalhe do Dia Fechado (somente leitura: resumo financeiro, horas, odômetro, lançamentos e observações).
  - **Relatórios & Rentabilidade (`/relatorios`):**
    - Filtros de período (7 Dias, Mês Atual, Ano Atual, Histórico Completo).
    - Indicadores RN-16: Lucro líquido, Margem %, Ganho/hora, Lucro/km, Média diária.
    - Gráfico visual de barras diárias nativo em SVG.
    - Exportação CSV com UTF-8 BOM para Excel.
    - Exportação em Markdown (.MD).
    - Impressão nativa formatada para PDF com logo e cabeçalho corporativo.
  - **Gestão do Veículo (`/veiculo`):**
    - Cadastro e edição do carro ativo (modelo, placa, ano, odômetro atual).
    - Alertas preventivos de manutenção (troca de óleo a cada 10.000 km, pastilhas a cada 30.000 km).
  - **Configurações Completas (`/configuracoes`):**
    - Edição de perfil com Nome e Celular / WhatsApp gravado no banco para futuras comunidades.
    - Formulário de contato/suporte direto (`suporte_mensagens`).
    - Backup completo JSON e importação/restauração de dados JSON.
    - Exclusão segura de conta com confirmação "EXCLUIR" (RN-27).
  - **PWA & Instalação:**
    - `manifest.webmanifest` e `sw.js` com ícones neon instaláveis no celular.
  - **Hospedagem & Vercel:**
    - `vercel.json` configurado com reescritas SPA e cabeçalhos de proteção (HSTS, CSP, X-Frame-Options).
  - **Testes Unitários:** 41 testes automatizados (100% de aprovação).

## Como atualizar o app em produção
1. Clone o repositório ou puxe as alterações mais recentes da `main`.
2. Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na Vercel.
3. O deploy é automático a cada commit na branch `main`.

## Próximo passo
Aprovação do dono do produto para finalização da Fase 6 e planejamento das **fases extras**.
