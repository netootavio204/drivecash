# Progresso da Atualização v2 — DriveCash

> O agente atualiza este arquivo ao fechar cada fase. É a "memória" da atualização: nas fases seguintes, leia este arquivo em vez de reler tudo.

## Status das fases
| Fase | Conteúdo | Status | Em produção desde | Aprovada em |
|---|---|---|---|---|
| V2.1 | Auditoria, backup e rede de segurança | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.2 | Barras de meta, botões no topo e Intervalo | ✅ concluída | 2026-10-18 | 2026-10-18 |
| V2.3 | Locais do dinheiro: bolso, app 99 e bancos | 🟡 pronta para aprovação | — | — |
| V2.4 | Corrida única com pagamento em partes | ⏳ não iniciada | — | — |
| V2.5 | Taxas, ganho líquido e fechamento v2 | ⏳ não iniciada | — | — |
| V2.6 | Relatório PDF, publicação e APK | ⏳ não iniciada | — | — |

## Rede de segurança
- Tags Git: `pre-v2` · `v2-1-aprovada` · `v2-2-aprovada`
- Branches: `v2-atualizacao` (branch principal de desenvolvimento) e `v2-fase-3-locais` (ativa)
- Backup do banco: snapshots `v2_snapshot_antes*` e dados antigos intactos
- Migrações preparadas: `0101_flags_e_backup.sql`, `0102_intervalos.sql`, `0103_locais.sql`, `0104_partes_estrutura.sql`, `0107_views_locais.sql`
- Suíte de testes: 52 testes aprovados (100% verde)
- Build de produção: `tsc -b && vite build` (100% verde)

## Chaves liga/desliga (estado em produção)
| Chave | Estado | Ligada em |
|---|---|---|
| `intervalo` | ligada | 2026-10-18 |
| `locais` | pronta (desligada até validação) | — |
| `partes` | desligada | — |
| `taxas` | desligada | — |
| `pdf` | desligada | — |

## Como rodar e testar
- Testes unitários/lógica: `npm test`
- Servidor de desenvolvimento: `npm run dev`
- Build de validação: `npm run build`

## O que já foi alterado na Fase V2.3
- **Migração 0103 (`0103_locais.sql`):** Tabelas `bancos_catalogo`, `locais_dinheiro` e `locais_transferencias` + RPCs `rpc_inicializar_locais()` e `rpc_transferir_local()`.
- **Migração 0104 (`0104_partes_estrutura.sql`):** Adicionadas colunas `local_id`, `lancamento_pai_id`, `modo_partes`, `taxa_origem` em `lancamentos`, tabela `lancamento_partes` e constraint check em `origem`.
- **Migração 0107 (`0107_views_locais.sql`):** Criadas views `vw_saldo_locais`, `vw_conciliacao` e `vw_dia_por_meio`.
- **Cartões de Saldo no Início (`CartoesSaldoLocais.tsx`):** Exibe Bolso, App 99, Banco Inter, Mercado Pago e Total Geral logo abaixo do Caixa Atual, com badge e alerta discreto se o App 99 estiver negativo.
- **Tela "Meu Dinheiro" (`MeuDinheiroPage.tsx`):** Rota `/meu-dinheiro`, cards detalhados por local, ajuste de saldo inicial, extrato de transferências e status de conciliação.
- **Modal de Transferência (`TransferenciaModal.tsx`):** Permite transferir valores entre contas (ex: saque do app com taxa R$ 1,00 para o Inter) sem inflar a receita.
- **Formulário de Despesas (`SaidaRapidaSheet.tsx`):** Campo seletor "Pago com" habilitado quando a chave de locais estiver ativa.
- **Menu Lateral e Inferior:** Acesso rápido a "Meu Dinheiro" adicionado em `SidebarNav.tsx` e `BottomNav.tsx`.

## Como voltar atrás
- Se necessário desativar locais em produção: manter a chave `locais: false` na tabela `configuracoes`.
- Se necessário desfazer código: `git checkout v2-atualizacao` e excluir a branch `v2-fase-3-locais`.

## Próximo passo
- Obter o "SIM" do motorista para aprovar formalmente a Fase V2.3, criar a tag `v2-3-aprovada`, mergear para `v2-atualizacao` e avançar para a **Fase V2.4 (Corrida única com pagamento em partes)**.
