# Progresso da Atualização v2 — DriveCash

> O agente atualiza este arquivo ao fechar cada fase. É a "memória" da atualização: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Em produção desde | Aprovada em |
|---|---|---|---|---|
| V2.1 | Auditoria, backup e rede de segurança | 🟡 pronta para aprovação | — | — |
| V2.2 | Barras de meta, botões no topo e Intervalo | ⏳ não iniciada | — | — |
| V2.3 | Locais do dinheiro: bolso, app 99 e bancos | ⏳ não iniciada | — | — |
| V2.4 | Corrida única com pagamento em partes | ⏳ não iniciada | — | — |
| V2.5 | Taxas, ganho líquido e fechamento v2 | ⏳ não iniciada | — | — |
| V2.6 | Relatório PDF, publicação e APK | ⏳ não iniciada | — | — |

## Rede de segurança (preencher na V2.1)
- Tag `pre-v2`: Criada e registrada · Branch `v2-atualizacao` e `v2-fase-1-auditoria`: Ativas
- Backup do banco: Guia de exportação documentado em AUDITORIA_V2.md
- Migração de segurança: `supabase/migrations/0101_flags_e_backup.sql` pronta
- Suíte de testes: 43 testes aprovados (100% verde)
- Hook de chaves liga/desliga: `src/lib/useRecursos.ts` implementado (todas as chaves desligadas)

## Chaves liga/desliga (estado em produção)
| Chave | Estado | Ligada em |
|---|---|---|
| `intervalo` | desligada | — |
| `locais` | desligada | — |
| `partes` | desligada | — |
| `taxas` | desligada | — |
| `pdf` | desligada | — |

## Como rodar e testar (atualizar a cada fase)
- Testes unitários/lógica: `npm test`
- Servidor de desenvolvimento: `npm run dev`

## O que já foi alterado
- Criada migração `0101_flags_e_backup.sql`
- Criado módulo `src/lib/recursos.ts` e hook `src/lib/useRecursos.ts`
- Criado teste `src/features/metas/bug01_metas.test.ts`
- Criado relatório detalhado [AUDITORIA_V2.md](file:///d:/Sistemas%20em%20vibecode/PROJETO%20MOTORISTA/docs/fases/atualizacao-v2/AUDITORIA_V2.md)

## Decisões importantes
- Metas/topo prioritárias;
- Fim da corrida dupla sem mexer nos lançamentos antigos sem aprovação;
- Taxa 99 campo opcional;
- Banco Inter para Pix e Mercado Pago para maquininha (flexível).

## Pendências e dificuldades registradas
- (Nenhuma pendência crítica. Sistema 100% estável).

## Como voltar atrás (atualizar a cada fase)
- Para desfazer esta fase: `git checkout main` e desconsiderar a branch `v2-fase-1-auditoria`.

## Próximo passo
- Aprovação do motorista para avançar para a **Fase V2.2 (Barras de meta, botões no topo e Intervalo)**.
