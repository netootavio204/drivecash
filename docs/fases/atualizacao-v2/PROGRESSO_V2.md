# Progresso da Atualização v2 — DriveCash

> O agente atualiza este arquivo ao fechar cada fase. É a "memória" da atualização: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Em produção desde | Aprovada em |
|---|---|---|---|---|
| V2.1 | Auditoria, backup e rede de segurança | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.2 | Barras de meta, botões no topo e Intervalo | 🟡 pronta para aprovação | — | — |
| V2.3 | Locais do dinheiro: bolso, app 99 e bancos | ⏳ não iniciada | — | — |
| V2.4 | Corrida única com pagamento em partes | ⏳ não iniciada | — | — |
| V2.5 | Taxas, ganho líquido e fechamento v2 | ⏳ não iniciada | — | — |
| V2.6 | Relatório PDF, publicação e APK | ⏳ não iniciada | — | — |

## Rede de segurança (preencher na V2.1)
- Tag `pre-v2`: Criada e registrada · Branch `v2-atualizacao` e `v2-fase-2-correcoes`: Ativas
- Backup do banco: Guia de exportação documentado em AUDITORIA_V2.md
- Migrações preparadas: `0101_flags_e_backup.sql` e `0102_intervalos.sql`
- Suíte de testes: 47 testes aprovados (100% verde)
- Hook de chaves liga/desliga: `src/lib/useRecursos.ts` implementado

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
- Criado componente `BarraMetaV2` com preenchimento contínuo, marcos 🥉🥈🥇 e precisão decimal (BUG-01 corrigido)
- Integrado card das 3 metas compactas (Dia, Semana, Mês) na tela Início
- Criada barra fixa no topo `TopoAcoesRapidas` com Intervalo e Fechar Dia (com alvos amplos ≥ 48px)
- Removidos botões inferiores redundantes de Fechar Dia e Intervalo do rodapé
- Criada migração `0102_intervalos.sql` e cálculo de tempo trabalhado líquido em `calcularTempoLiquido`
- Eliminada condição de corrida na sincronização de metas em `src/features/lancamentos/api.ts`
- 47 testes unitários 100% verdes (`npm test`) e build de produção validado (`npm run build`)

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
