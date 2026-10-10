# Progresso do projeto Meta Driver (Web App)

> O agente atualiza este arquivo ao fechar cada fase. Ele é a "memória" do projeto: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Aprovada em |
|---|---|---|---|
| 1 | Fundação e Design System | ✅ aprovada | 2026-10-10 |
| 2 | Banco de dados (Supabase) e Acesso | ✅ aprovada | 2026-10-10 |
| 3 | Núcleo do caixa (abrir dia, lançamentos, extrato) | ⏳ em andamento | — |

| 4 | Fechamento do dia, Caixa Manutenção e Prioridades | ⏳ não iniciada | — |
| 5 | Metas, medalhas, estrelas, fases e conquistas | ⏳ não iniciada | — |
| 6 | Histórico, relatórios, configurações, PWA e publicação | ⏳ não iniciada | — |

## Como rodar o projeto
```bash
# Rodar localmente o servidor Vite
npm run dev
# Abrir no navegador: http://localhost:5173

# Rodar todos os testes unitários (21 testes)
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
    - `0001_schema.sql`: Definição de tabelas (`profiles`, `configuracoes`, `veiculos`, `plataformas`, `categorias`, `caixas`, `dias_trabalho`, `lancamentos`, `transferencias`, `prioridades`, `metas`, `meta_ciclos`, `gamificacao_usuario`, `fases`, `conquistas_catalogo`, `auditoria`).
    - `0002_rls.sql`: Políticas de segurança Row Level Security em todas as tabelas, garantindo isolamento total entre motoristas.
    - `0003_funcoes.sql`: Views financeiras calculadas no banco (`vw_saldo_caixas`, `vw_resumo_dia`) e RPCs (`rpc_abrir_dia`, `rpc_fechar_dia`, `rpc_reabrir_dia`, `rpc_transferir`, `rpc_atualizar_metas`, `rpc_pagar_prioridade`).
    - `0004_seeds.sql`: Catálogo completo de conquistas (Anexo C), fases e trigger `handle_new_user` para criação automática de caixas, configurações, plataformas e categorias no momento do cadastro.
    - `FULL_SETUP.sql`: Script consolidado para rodar no SQL Editor do Supabase com um clique.
  - Teste matemático SQL em `supabase/tests/anexo_a_test.sql` cobrindo o exemplo do Anexo A do PRD.
- **Autenticação & Acesso (Fase 2):**
  - Conexão configurada em `src/lib/supabase.ts` e tipos em `src/lib/database.types.ts`.
  - Tratamento humanizado de erros em português em `src/lib/erros.ts`.
  - Contexto de Autenticação (`AuthProvider`, `useAuth`) e guardiões de rotas (`ProtectedRoute`, `PublicOnlyRoute`, `OnboardingRoute`).
  - Telas completas no visual do Meta Driver:
    - Login (`/login`)
    - Cadastro (`/cadastro`)
    - Recuperação de senha (`/recuperar-senha`)
    - Nova senha (`/nova-senha`)
    - Onboarding interativo de 5 passos (`/onboarding`) com Nome, Carro, Plataformas, Saldo inicial e Reserva de manutenção com meta diária.
    - Termos de Uso (`/termos`) e Política de Privacidade (`/privacidade`).
    - Botão de logout no menu lateral e cabeçalho mobile.
- **Testes Unitários:** 21 testes automatizados passando 100%.

## Decisões importantes
- **Segurança Supabase:** chaves públicas anon armazenadas em `.env.local` (fora do Git), service role key nunca gravada no código.
- **Plataformas e Categorias flexíveis:** motorista tem padrões pré-carregados e pode criar novos itens a qualquer momento.
- **Reserva de Manutenção:** valor diário sugerido de R$ 20,00, totalmente editável.
- **Prioridades financeiras:** suporte a recorrência diária, semanal, mensal e anual.

## Próximo passo
Aprovação do dono do produto para seguir para a **Fase 3 — Núcleo do Caixa (abrir dia, lançamentos, extrato)**.
