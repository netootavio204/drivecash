# Progresso da Atualização v2 — DriveCash

> O agente atualiza este arquivo ao fechar cada fase. É a "memória" da atualização: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Em produção desde | Aprovada em |
|---|---|---|---|---|
| V2.1 | Auditoria, backup e rede de segurança | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.2 | Barras de meta, botões no topo e Intervalo | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.3 | Locais do dinheiro: bolso, app 99 e bancos | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.4 | Corrida única com pagamento em partes | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.5 | Taxas, ganho líquido e fechamento v2 | 🟡 em andamento | — | — |
| V2.6 | Relatório PDF, publicação e APK | ⏳ não iniciada | — | — |

## Rede de segurança
- Tags Git: `pre-v2` · `v2-1-aprovada` · `v2-2-aprovada` · `v2-3-aprovada` · `v2-4-aprovada`
- Branches: `v2-atualizacao` (branch principal de desenvolvimento) e `v2-fase-5-taxas` (ativa)
- Backup do banco: snapshots `v2_snapshot_antes*` e dados antigos intactos
- Migrações preparadas: `0101_flags_e_backup.sql`, `0102_intervalos.sql`, `0103_locais.sql`, `0104_partes_estrutura.sql`, `0105_categorias_v2.sql`, `0106_rpcs_corrida_partes.sql`, `0107_views_locais.sql`, `0108_reset_seletivo.sql`
- Suíte de testes: 57 testes aprovados (100% verde)
- Build de produção: `tsc -b && vite build` (100% verde)

## Chaves liga/desliga (estado em produção)
| Chave | Estado | Ligada em |
|---|---|---|
| `intervalo` | ligada | 2026-10-18 |
| `locais` | ligada | 2026-10-18 |
| `partes` | pronta (desligada até validação) | — |
| `taxas` | desligada | — |
| `pdf` | desligada | — |

## Como rodar e testar
- Testes unitários/lógica: `npm test`
- Servidor de desenvolvimento: `npm run dev`
- Build de validação: `npm run build`

## O que já foi alterado na Fase V2.4
- **Migração 0105 (`0105_categorias_v2.sql`):** Categorias V2 de sistema (Taxa 99, Gorjeta 99, Taxa de maquininha, Devoluções).
- **Migração 0106 (`0106_rpcs_corrida_partes.sql`):** RPC `rpc_lancar_corrida` atômica garantindo que 1 corrida com partes gera exatamente 1 lançamento (`qtd_corridas = 1`), além de exclusão atômica (`rpc_excluir_corrida`).
- **Migração 0108 (`0108_reset_seletivo.sql`):** Função de reset seletivo com confirmação por palavra-chave ("ZERAR") para recomeço limpo opcional.
- **Tela de Lançamento (`EntradaRapidaSheet.tsx`):**
  - Atalhos de 1 toque: *Tudo no App* (padrão 99), *Tudo em Mãos*, *Dividido*;
  - Modo alternável para **Gorjeta da 99** (registrada com `qtd_corridas = 0`, creditando no App 99 sem duplicar contagem);
  - Suporte a **Cupom 99** (com cobertura integral da 99 retida no saldo do app);
  - Campo opcional "Taxa 99 (do recibo)".
- **Lista de Lançamentos do Dia (`ListaLancamentosDia.tsx`):** Exibição de corrida única, badges informativos para Gorjeta/Extras e exclusão inteligente.
- **Configurações (`ConfiguracoesView.tsx`):** Card e modal de Reset Seletivo com seleção por caixas (entradas, saídas, transferências, pausas) protegido por confirmação.
- **Testes Unitários (`v2_fase4_partes.test.ts`):** 5 novos testes cobrindo divisão de corridas em partes, excedente de valores, gorjeta da 99 e cupons.

## Como voltar atrás
- Se necessário desativar partes em produção: manter a chave `partes: false` na tabela `configuracoes`.
- Se necessário desfazer código: `git checkout v2-atualizacao` e excluir a branch `v2-fase-4-partes`.

## Próximo passo
- Obter o "SIM" do motorista para aprovar formalmente a Fase V2.4, criar a tag `v2-4-aprovada`, mergear para `v2-atualizacao` e avançar para a **Fase V2.5 (Taxas, ganho líquido e fechamento v2)**.
