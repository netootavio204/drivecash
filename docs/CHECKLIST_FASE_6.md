# Checklist da Fase 6 — Histórico, Relatórios, Configurações, Veículo, PWA e Publicação

## 1. Entrevistas e Decisões
- [x] Rodada 1: Relatórios e dados (indicadores, exportar CSV, veículo)
- [x] Rodada 2: Publicação (onde publicar, domínio, banco de produção, público)
- [x] Rodada 3: Textos e identidade (termos, e-mails, contato de suporte, WhatsApp no perfil, dúvidas)
- [x] Registrar decisões no `docs/DECISOES.md`

## 2. Histórico e Calendário
- [x] Lista de dias rodados com receita, despesas, lucro e status (`HistoricoView.tsx`)
- [x] Detalhe do dia somente leitura via Modal com extrato e conferência
- [x] Calendário mensal interativo com cores de lucratividade

## 3. Relatórios e Rentabilidade
- [x] Filtros de período: 7 Dias, Mês Atual, Ano Atual, Histórico Completo
- [x] Indicadores chave (RN-16): Lucro líquido, Margem %, Ganho/hora, Lucro/km, Média diária
- [x] Gráficos visuais nativos e leves de evolução diária
- [x] Exportações completas: CSV (Excel com UTF-8 BOM), Markdown (.MD) e Impressão/PDF

## 4. Exportação de Dados e Gestão do Veículo
- [x] Exportação CSV e Markdown formatado
- [x] Backup completo de dados em JSON e restauração/importação JSON
- [x] Tela de Veículo (`/veiculo`): Cadastro, Odômetro atualizado e alertas de manutenção (óleo a cada 10.000 km, freios a cada 30.000 km)

## 5. Configurações Completas e Segurança de Dados
- [x] Perfil do motorista com edição de Nome e Celular / WhatsApp para futuras comunidades
- [x] Formulário direto de contato e suporte gravado no banco de dados (`suporte_mensagens`)
- [x] Exclusão segura de conta com confirmação "EXCLUIR" via RPC `rpc_excluir_conta` (RN-27)
- [x] Textos de Termos de Uso e Política de Privacidade

## 6. PWA (Progressive Web App)
- [x] `manifest.webmanifest` completo com ícones (96, 192, 512) e orientação portrait
- [x] Service Worker (`sw.js`) com cache estático registrado em produção
- [x] Meta tags mobile para iOS e Android em `index.html`

## 7. Qualidade, Testes e CI/CD
- [x] Testes unitários para cálculos e exportações (41 testes passando com 100%)
- [x] `npm run typecheck` (0 erros)
- [x] `npm run lint` (0 erros)
- [x] `npm run build` (sucesso)

## 8. Publicação e Produção
- [x] Configuração da Vercel (`vercel.json`) com roteamento SPA e cabeçalhos de segurança
- [x] Banco de dados Supabase com migrations e script unificado `FULL_SETUP.sql`
- [x] Atualização de `docs/PROGRESSO.md`
