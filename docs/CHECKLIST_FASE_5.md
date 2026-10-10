# Checklist da Fase 5 — Metas, Medalhas, Estrelas, Fases e Conquistas

## 1. Entrevistas e Decisões
- [x] Rodada 1: Metas reais, métrica principal, níveis das medalhas, dias de folga
- [x] Rodada 2: Visual das medalhas, confete/serpentina, som, nomes das fases
- [x] Rodada 3: Catálogo de conquistas, meta mínima sugerida pelas contas, dias por semana
- [x] Registrar decisões no `docs/DECISOES.md`

## 2. Camada de Dados e APIs de Metas & Gamificação
- [x] Hooks TanStack Query para Metas (`useMetas`, `useCriarMeta`, `useEditarMeta`, `useArquivarMeta`)
- [x] Hooks para Ciclos de Metas (`useCiclosMetas`)
- [x] Hooks para Gamificação do Usuário (`useGamificacaoUsuario`, `useFases`, `useConquistasCatalogo`, `useConquistasUsuario`)
- [x] Disparo automático de `rpc_atualizar_metas` e `rpc_avaliar_conquistas` após lançamentos e fechamento

## 3. Gestão e Painel de Metas (`/metas`)
- [x] Abas por período: Diária, Semanal, Mensal
- [x] Barra de progresso com marcos 🥉 (70%), 🥈 (100%), 🥇 (130%)
- [x] Indicador claro de "Faltam R$ X para a meta / medalha"
- [x] Formulário de Criar/Editar Meta com prévia dos níveis em R$
- [x] Sugestão de meta com base nas prioridades pendentes (RN-25)
- [x] Card de Meta Diária em destaque na Tela Inicial (`InicioPage`)

## 4. Gamificação, Fases e Celebrações
- [x] Componente SVG estilizado `Medalha` (Bronze, Prata, Ouro) estilo Neon
- [x] Motor de celebrações (`src/lib/confete.ts`) com controle de fila e uma única execução por marco
- [x] Efeito sonoro motivador com Web Audio API nativo (`src/lib/som.ts`)
- [x] Sistema de Estrelas ⭐ e 7 Fases (Aprendiz até Lenda)
- [x] Modal comemorativo de Subida de Fase (`ModalMudancaFase.tsx`)
- [x] Tela de Galeria de Conquistas (`/conquistas`) com 22 conquistas oficiais do Anexo C
- [x] Sequência diária ativa 🔥 e total de estrelas ⭐ no Início

## 5. Integração com Prioridades e Configurações de Efeitos
- [x] Sugestão de Meta Mínima pelas Prioridades (RN-25) com botão "Usar essa meta"
- [x] Configurações de Efeitos Sonoros e Chuva de Confetes (`/configuracoes`)

## 6. Qualidade, Testes e Documentação
- [x] Testes unitários para gamificação e metas com Vitest (38 testes no total)
- [x] `npm run typecheck` (0 erros)
- [x] `npm run lint` (0 erros)
- [x] `npm run build` (sucesso)
- [x] Atualização de `docs/PROGRESSO.md` e commit da branch
