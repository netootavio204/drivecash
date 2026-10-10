# Progresso do projeto Meta Driver (Web App)

> O agente atualiza este arquivo ao fechar cada fase. Ele é a "memória" do projeto: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Aprovada em |
|---|---|---|---|
| 1 | Fundação e Design System | ✅ aprovada | 2026-10-10 |
| 2 | Banco de dados (Supabase) e Acesso | ✅ aprovada | 2026-10-10 |
| 3 | Núcleo do caixa (abrir dia, lançamentos, extrato) | ✅ aprovada | 2026-10-10 |
| 4 | Fechamento do dia, Caixa Manutenção e Prioridades | ✅ aprovada | 2026-10-10 |
| 5 | Metas, medalhas, estrelas, fases e conquistas | ✅ concluída | 2026-10-10 |
| 6 | Histórico, relatórios, configurações, PWA e publicação | ⏳ não iniciada | — |

## Como rodar o projeto
```bash
# Rodar localmente o servidor Vite
npm run dev
# Abrir no navegador: http://localhost:5173

# Rodar todos os testes unitários (38 testes automatizados)
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
    - `0002_rls.sql`: Políticas de segurança Row Level Security em todas as tabelas.
    - `0003_funcoes.sql`: Views e RPCs financeiras (`rpc_abrir_dia`, `rpc_fechar_dia`, `rpc_reabrir_dia`, `rpc_transferir`, `rpc_atualizar_metas`, `rpc_pagar_prioridade`).
    - `0004_seeds.sql`: Catálogo de 22 conquistas e 7 fases.
    - `0005_avaliar_conquistas.sql`: RPC `rpc_avaliar_conquistas` para avaliação automática de desbloqueios.
    - `FULL_SETUP.sql`: Script consolidado para o SQL Editor do Supabase.
- **Autenticação & Acesso (Fase 2):**
  - Telas completas: Login (`/login`), Cadastro (`/cadastro`), Recuperação de senha (`/recuperar-senha`), Nova senha (`/nova-senha`), Onboarding de 5 passos (`/onboarding`), Termos (`/termos`) e Privacidade (`/privacidade`).
- **Núcleo do Caixa (Fase 3):**
  - Bater Ponto / Abrir Dia (`AbrirDiaSheet`), Entrada Rápida (`EntradaRapidaSheet`), Saída Rápida (`SaidaRapidaSheet`), Painel Início (`InicioPage`), Extrato (`CaixaView` em `/caixa`).
- **Fechamento do Dia, Caixa Manutenção e Prioridades (Fase 4):**
  - Fechar o Dia com conferência de dinheiro e depósito de manutenção (`FecharDiaSheet`).
  - Reabertura do Dia (`rpc_reabrir_dia`).
  - Reserva de Manutenção (`CaixaManutencaoView` em `/caixa/manutencao`).
  - Gestão de Prioridades (`PrioridadesView` em `/prioridades`).
- **Metas, Medalhas, Estrelas, Fases e Conquistas (Fase 5):**
  - **Gestão de Metas (`MetasView` em `/metas`):**
    - Abas por período: Diária, Semanal, Mensal.
    - Marcos visuais: 🥉 Bronze (70%), 🥈 Prata (100%), 🥇 Ouro (130%) com prévia calculada em R$.
    - Frases motivacionais dinâmicas indicando quanto falta para o próximo nível.
    - Sugestão inteligente de Meta Mínima de Sobrevivência baseada nas Prioridades Pendentes (RN-25).
    - Modal de criação e edição com validações.
  - **Motor de Celebrações & Efeitos:**
    - Fila assíncrona de animações (`src/lib/confete.ts`) com intensidade equilibrada de confetes para cada marco.
    - Efeito sonoro suave sintetizado via Web Audio API nativo (`src/lib/som.ts`), sem dependência de arquivos externos.
  - **Medalhas Neon SVG:**
    - Componente SVG reutilizável (`Medalha.tsx`) em tamanhos `sm`, `md` e `lg` com brilho neon e gradientes dedicados para Bronze, Prata e Ouro.
  - **Galeria de Conquistas & Fases (`ConquistasView` em `/conquistas`):**
    - Header com Fase Atual (1 de 7), total de estrelas acumuladas ⭐ e barra de progresso até a próxima fase.
    - Card com Sequência de dias ativos (Streak 🔥) e recorde histórico.
    - Grade completa com as 22 conquistas do Anexo C: cards destacados com selo e data para desbloqueadas; cards escuros com cadeado e estrelas bônus para bloquear.
    - Botão de verificação manual e modal comemorativo de subida de fase (`ModalMudancaFase.tsx`).
  - **Integração na Tela Inicial (`InicioPage`):**
    - Pílula de Sequência de dias ativos (🔥) e total de estrelas (⭐) no topo levando para `/conquistas`.
    - Card compacto de Meta Diária com barra de progresso, percentual e medalha atual levando para `/metas`.
  - **Configurações de Efeitos (`ConfiguracoesView` em `/configuracoes`):**
    - Chaves para ativar/desativar efeitos sonoros e chuva de confetes com botão de teste imediato.
    - Informações da conta e links legais.
  - **Gatilhos automáticos em segundo plano:**
    - Chamadas de reavaliação de metas e conquistas integradas nos hooks de lançamentos e fechamento do dia.
  - **Testes Unitários da Gamificação (`src/lib/gamificacao.test.ts`):**
    - 14 novos testes cobrindo cálculo de medalhas, multiplicadores de estrelas, meta mínima das prioridades (RN-25) e percentuais de conclusão. Total do projeto: 38 testes aprovados.

## Decisões importantes
- **Metas Iniciais:** Diária R$ 300,00, Semanal R$ 1.800,00, Mensal R$ 7.500,00 com liberdade para ajustar.
- **Marcos das Medalhas:** 70% (Bronze), 100% (Prata), 130% (Ouro).
- **Gamificação:** 7 Fases (Aprendiz, Estradeiro, Profissional, Veterano, Mestre do Volante, Elite, Lenda).
- **Efeitos de Som:** Desligado por padrão, com opção de ligar nas configurações (Web Audio nativo).
- **Semana de Trabalho:** Base de 6 dias por semana (25 dias/mês) para o cálculo da meta mínima de prioridades.

## Próximo passo
Apresentação e validação da **Fase 5** com o usuário para autorização de início da **Fase 6 — Histórico, Relatórios, Configurações, PWA e Publicação**.
