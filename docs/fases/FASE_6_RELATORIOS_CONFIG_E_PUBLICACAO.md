# FASE 6 de 6 — Histórico, relatórios, configurações, PWA e publicação

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_6_RELATORIOS_CONFIG_E_PUBLICACAO.md.
> Execute a Fase 6 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Completar o web app: **histórico e relatórios**, **configurações completas** (incluindo exportar dados e excluir conta), **veículo**, **instalável como app (PWA)**, **testes de ponta a ponta** e **publicação na internet**. Ao final, o app está no ar para uso real. **Não inclui APK.**

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: **5.6**, **6.3** (RN-16), **6.6** (RN-27), **7.10**, **7.11** (RF-VEI-01 a 03), **7.12**, **7.13** (RF-SYN-01 e 02), **12** (requisitos não funcionais), **13.6** (E2E), **14** (etapas 7, 8 e 10), **Anexo D**.

## 3. O que existirá no final
- **Histórico:** lista de dias, detalhe do dia fechado (somente leitura), **calendário** com intensidade pelo lucro e medalhas.
- **Relatórios:** semana/mês/ano/período livre com os indicadores da RN-16, gráficos (evolução, por plataforma, despesas por categoria, melhores dias da semana), comparativo com o período anterior.
- **Exportar CSV** (abre no Excel com acentos corretos).
- **Veículo:** cadastro, km atualizado ao abrir/fechar, custo e lucro por km.
- **Configurações completas:** perfil, plataformas, categorias, depósito de manutenção, semana/folgas, efeitos, **exportar meus dados**, **excluir minha conta**, termos e privacidade (texto final).
- **PWA:** instalável no celular, ícones, indicador online/offline.
- **Publicado** em endereço público com HTTPS, Supabase de produção e checklist de lançamento cumprido.

## 4. Entrevista inicial

**Rodada 1 — Relatórios e dados**
1. **Quais informações você mais quer ver?** (marque várias) A) ★ Lucro da semana e do mês  B) Lucro por hora  C) Lucro por km  D) Ganho por plataforma  E) Melhores dias da semana  F) Gastos por categoria
2. **Exportar CSV serve para quê?** A) ★ Abrir no Excel/Planilhas  B) Mandar para contador  C) Não preciso agora
3. **Veículo:** quer cadastrar o carro e acompanhar custo por km? A) ★ Sim  B) Depois

**Rodada 2 — Publicação**
4. **Onde publicar?** A) ★ Vercel (grátis para começar)  B) Netlify  C) Cloudflare Pages  D) Você escolhe
5. **Domínio próprio** (ex.: meuapp.com.br)? A) ★ Por enquanto o endereço gratuito  B) Já tenho domínio (qual?)  C) Quero comprar (eu oriento)
6. **Banco de produção separado do de testes?** A) ★ Sim, criar um segundo projeto Supabase para o público  B) Usar o mesmo por enquanto *(não recomendado)*
7. **Quem vai usar após publicar?** A) Só eu  B) Eu e conhecidos  C) ★ Qualquer motorista. *(Define Termos, Privacidade e e-mails.)*

**Rodada 3 — Textos e identidade**
8. **Termos de Uso e Política de Privacidade:** A) ★ Gere um modelo em português para eu revisar  B) Já tenho os textos. *(Aviso: modelos não substituem revisão de um advogado.)*
9. **E-mails do app (confirmar conta, recuperar senha):** A) ★ Manter o remetente padrão do Supabase por enquanto  B) Configurar e-mail próprio (SMTP). *(Recomendado antes de abrir ao público: o padrão tem limite de envios.)*
10. **Ícone e nome finais do app instalado:** confirmar a escolha da Fase 1 ou trocar.
11. **Contato de suporte** (e-mail ou WhatsApp) para aparecer em Configurações?
12. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo das decisões → `docs/DECISOES.md` → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Histórico:** lista com receita, lucro e medalha; paginação infinita; **detalhe do dia** somente leitura (resumo, lançamentos, conferência, observações); **calendário** (RF-REL-01 a 03).
2. **Relatórios:** indicadores da RN-16 por período; gráficos com **Recharts carregado sob demanda**; comparativo ▲/▼ com o período anterior; valores conferem com o extrato (RF-REL-04 a 06).
3. **Exportar CSV** de lançamentos e dias, com UTF-8 BOM (RF-REL-07).
4. **Veículo** (RF-VEI-01 a 03): cadastro, km atual atualizado em abrir/fechar, custo e lucro por km.
5. **Configurações completas** (RF-CFG-01 a 10): perfil, plataformas (desativa se tiver lançamentos), categorias (as de sistema não se apagam), depósito de manutenção, início da semana/dias de trabalho/folgas, efeitos, termos, privacidade e versão.
6. **Exportar meus dados** (CSV/JSON) e **Excluir minha conta**: **Edge Function** `delete-account` (usa a chave de serviço **somente no servidor**), com confirmação digitando **EXCLUIR** (RN-27).
7. **Termos e Privacidade:** textos finais conforme pergunta 8, aceite no cadastro.
8. **PWA:** `vite-plugin-pwa`, manifest, ícones (incluindo maskable), tela de abertura, instalável; **indicador online/offline** (RF-SYN-01 e 02). *A fila offline de lançamentos NÃO entra agora (P2).*
9. **Qualidade:** acessibilidade (AA), otimização (JS inicial < 250 KB gzip, carregamento sob demanda), **Lighthouse ≥ 90** (Desempenho, Acessibilidade, Boas Práticas, PWA).
10. **E2E completo** (PRD 13.6): cadastro → onboarding → abrir dia → entradas e saídas → lote → fechar com falta e depósito → medalha → dia seguinte abre com o saldo certo; dia esquecido; meta; prioridade; logout.
11. **Monitoramento e CI:** Sentry (sem dados pessoais) e GitHub Actions rodando lint, typecheck, testes e build a cada alteração.
12. **Produção:** criar o projeto Supabase de produção (pergunta 6), aplicar **todas** as migrações, configurar **URLs de Auth** com o endereço público, publicar o front na hospedagem escolhida com variáveis de ambiente, ativar HTTPS e **cabeçalhos de segurança** (CSP, HSTS e outros do PRD 12.2).
13. **Checklist de lançamento** (Anexo D, **sem os itens de APK e de modo offline**). Verificar RLS em produção com duas contas reais.
14. **Documentos:** `PROGRESSO.md` final com "como atualizar o app", "como fazer backup" e "backlog pós-lançamento".

## 6. Roteiro de teste prático para o dono
1. Abra o **endereço público** no celular, crie uma conta e **instale na tela inicial**.
2. Faça um dia completo: abrir, lançar, fechar. Confira o **histórico**, o **calendário** e os **relatórios**.
3. **Exporte o CSV** e abra no Excel/Planilhas: acentos corretos e valores batendo.
4. Em Configurações, edite plataformas e categorias; teste **exportar meus dados**.
5. Com uma conta de teste, teste **excluir minha conta**.
6. Entre com **duas contas** em aparelhos/navegadores diferentes e confirme que os dados não se misturam.

## 7. Entrevista final e aprovação
Pergunte: *"O app está pronto para você usar de verdade? O que falta ou incomoda? Algum relatório que você queria e não está lá?"* Ajuste e use o **modelo de aprovação**. Como é a última fase, no lugar de "Fase 7", **entregue o resumo final** e pergunte: **"Projeto concluído? (SIM / AJUSTAR)"**.

## 8. Backlog pós-lançamento (só com autorização, em outra rodada)
Fila offline de lançamentos e sincronização, Realtime entre aparelhos, notificações, login com Google, PDF, insights automáticos, caixas personalizados, plano de manutenção por km, abastecimentos, compartilhar resumo/medalha e, por último, o **APK** (PRD seção 15).

## 9. Fora do escopo desta fase
APK/Capacitor, itens P2 do PRD, mudanças de regra de negócio sem aprovação.

## 10. Definição de pronto
- [ ] App publicado com HTTPS, Supabase de produção e RLS verificado com duas contas.
- [ ] E2E completo, CI verde e Lighthouse ≥ 90.
- [ ] Exportar dados e excluir conta funcionando; termos e privacidade publicados.
- [ ] PWA instalável; Sentry recebendo erros; backup conferido.
- [ ] `PROGRESSO.md` final; tag `fase-6-aprovada` após o SIM.
