# 🚗 DriveCash — PRD de Atualização v2.0

> **Atualização do sistema já em funcionamento.** Corrige defeitos, separa o dinheiro por **local (bolso, app 99 e bancos)**, divide cada corrida em **partes de pagamento** sem contar a corrida duas vezes, calcula **taxas e ganho líquido plausível**, adiciona o botão **Intervalo** e o **relatório do dia em PDF**.
> **Regra número 1:** **não quebrar o que já funciona** e **não reduzir a segurança**.

| Campo | Valor |
|---|---|
| **Documento** | PRD de Atualização **v2.0** (complementa o PRD v1.1; não o substitui) |
| **Data** | 17/10/2026 |
| **Base de pesquisa** | `RELATORIO_PESQUISA_99_TAXAS_E_PAGAMENTOS.md` (mesma pasta) |
| **Plataformas** | Web (PWA) e, se já existir, o **APK** da pasta `APK/` |
| **Idioma / moeda** | pt-BR · BRL (centavos inteiros) |
| **Perfil do dono** | Motorista da 99 (corridas de passageiros, interior de SP) · **não programador** |
| **Execução** | 6 fases de atualização (**V2.1 a V2.6**), com entrevista e aprovação a cada fase |

---

## 0. Instruções para o agente (LEIA PRIMEIRO)

1. **Este PRD é uma atualização.** O sistema **já existe e funciona**. Leia também `docs/PRD.md` (v1.1), `docs/PROGRESSO.md`, `docs/DECISOES.md` e `RELATORIO_PESQUISA_99_TAXAS_E_PAGAMENTOS.md`.
2. **O que está escrito no código e no banco prevalece sobre o que está escrito no PRD v1.** Durante a **Fase V2.1 (Auditoria)** descubra como as coisas **realmente** foram implementadas (nomes de tabelas, colunas, funções, telas). Os SQLs deste documento são **referência** e devem ser **adaptados** ao banco real **sem quebrar o que existe**.
3. **Nada de mudanças destrutivas.** Siga a seção 3 (atualização segura): *backup → ambiente de testes → migrações aditivas → recursos atrás de chave liga/desliga → testes de não regressão → aprovação do dono → publicação com plano de volta*.
4. **O dono não é programador:** português simples; comandos prontos para colar, **um passo por vez**; diga **onde rodar** e **o que deve aparecer**; roteiro de teste prático ao final de cada fase.
5. **Entrevista obrigatória** no início de cada fase (arquivos em `fases/`). **Nunca** avance sem o **SIM** do dono.
6. **Dinheiro sempre em centavos (inteiro).** RLS em **todas** as tabelas novas. **Nunca** expor `service_role`. **Nada** de dados financeiros enviados a terceiros (o PDF é gerado **no aparelho**).
7. **Teste primeiro nos defeitos:** para cada defeito (seção 4), escreva um **teste que reproduz o erro**, veja falhar, corrija, veja passar.
8. **Não invente funcionalidades.** Ideias novas vão para `docs/IDEIAS.md` e são **perguntadas**.
9. **Definição de pronto (DoD)** de cada item: critérios de aceite atendidos; testes novos **e antigos** passando; `lint`/`typecheck`/`build` ok; responsivo em 360 px; estados de carregando/vazio/erro; acessível; textos em pt-BR; **resultados antes × depois conferidos** (seção 12); `APK/` sincronizado, se existir.
10. **Prioridades:** `P0` obrigatório · `P1` importante · `P2` futuro.

---

## 1. Contexto e objetivos

### 1.1 O que o dono pediu (mudanças solicitadas)
| ID | Pedido | Onde está neste PRD |
|---|---|---|
| **MUD-01** | Entender como a 99 cobra taxas, **principalmente com cupom** e pagamentos em **Pix, crédito, débito e dinheiro**, para ter um **ganho plausível** | Relatório de pesquisa + seções 2, 5 e 6 |
| **MUD-02** | Dividir os ganhos por **forma de recebimento** para somar e mostrar valor plausível | 5, 6.4, 6.5 |
| **MUD-03** | Botões **Intervalo** e **Fechar dia** no **topo**, não no rodapé | 6.1, 6.2, 7.1 |
| **MUD-04** | **Barras de progresso das metas** (diária, semanal, mensal) **não marcam nada** | 4.1, 6.3 |
| **MUD-05** | Mostrar **saldo do bolso, do app e do banco**, com **escolha de bancos** (Inter, Mercado Pago, Santander e outros) | 5.3, 6.4 |
| **MUD-06** | **Relatório detalhado do dia em PDF** ao fechar o dia, para **imprimir e exportar**, com **design atraente e fácil de entender** | 6.8, 10 |
| **MUD-07** | **Corrigir erro:** ao dividir o ganho em bolso/Pix/cartão e o resto no app, o sistema **conta como 2 corridas**; deve **dividir só o valor**, **sempre com uma parte no app** | 4.2, 5.1, 6.5 |
| **MUD-08** | **Segurança** e **não quebrar** o sistema que já funciona | 3, 11, 12, 14 |

### 1.2 Objetivos mensuráveis
| Objetivo | Medida de sucesso |
|---|---|
| Corrida contada **uma única vez** | `corridas` do dia = nº real de corridas, **mesmo com divisão em partes** |
| Valor plausível | Ganho líquido do dia = **receita − Taxa99 − taxas de maquininha − despesas** (conferido em exemplos reais do dono) |
| Saldos confiáveis | **Σ saldos dos locais = Σ saldos dos caixas** (conciliação sem diferença) |
| Metas visíveis | Qualquer progresso **> 0** aparece **na hora** nas barras diária, semanal e mensal |
| Topo | **Fechar dia** e **Intervalo** acessíveis **sem rolar a tela**, em 360 px |
| PDF | Gerado **no aparelho** em **< 3 s**, com **todas as seções** da seção 10 |
| **Zero regressão** | Totais históricos (caixas, receita, despesas por dia) **idênticos** antes e depois (exceto correções aprovadas) |

### 1.3 Fora do escopo
Integração automática com a 99 (não há API pública), declaração de impostos/MEI, emissão de nota, leitura automática de extrato bancário (Open Finance), notificações push, modo offline com fila *(permanecem no backlog)*.

---

## 2. Premissas de negócio (derivadas da pesquisa)

> Resumo; detalhes e fontes no relatório. **Todas** devem ser confirmadas com o dono na Fase V2.1.

| # | Premissa | Efeito no sistema |
|---|---|---|
| P-01 | A 99 **não tem % fixo** de taxa; mostra o líquido antes do aceite; a **Taxa99** vem no recibo e varia muito (≈ 3% a 23% em recibos reais) | Registrar **a taxa real** por corrida; **% estimado** só como plano B, **sinalizado** como estimativa |
| P-02 | **Cupom:** o motorista recebe o valor **cheio**; a parte do cupom **vai para o app**, mesmo se o resto foi em dinheiro | Parte do cupom = **parte no app** (tipo "cupom") |
| P-03 | **Dinheiro:** motorista fica com tudo; a 99 **debita a Taxa99 do saldo do app** | Taxa99 = **despesa paga pelo app**; app pode ficar **negativo** |
| P-04 | **Pagamento no app** (cartão/Pix/99Pay/voucher) cai na **Conta99** (app) | Parte "pago no app" = **local App 99** |
| P-05 | **Pix pelo app** vai para a 99; **Pix direto** na chave do motorista é **fora do app** | Parte "Pix direto" = **banco escolhido** |
| P-06 | **Maquininha própria** tem **taxa e prazo** próprios | Taxa de maquininha = **despesa paga pelo banco**; taxas configuráveis por banco |
| P-07 | **Pacote Taxa Zero** (cidades participantes, inclusive interior de SP) = **custo** com taxa 0% | **Despesa** do pacote + **Taxa99 = 0** na vigência; "**Taxa99 devolvida**" = receita no app |
| P-08 | **Saque** do app para o banco é **movimento entre locais** (pode ter taxa de R$ 1,00) | **Transferência entre locais** com taxa opcional |
| P-09 | O app da 99 tem **intervalo obrigatório** após certo tempo online | **Intervalo** do DriveCash desconta pausas do tempo de trabalho |

---

## 3. Atualização segura (princípios obrigatórios)

### 3.1 Estratégia "expandir → migrar → limpar"
1. **Expandir:** só **adicionar** (tabelas, colunas **com valor padrão ou nulas**, funções **novas**, views **novas**). **Proibido** apagar/renomear/alterar tipo de coluna existente nesta atualização.
2. **Migrar:** copiar/classificar dados **com simulação (dry-run)**, **backup** e **aprovação do dono**.
3. **Limpar:** remoção de coisas antigas **só depois** (mínimo 14 dias de uso estável) e **com nova aprovação** — **fora** das fases V2.1–V2.6.

### 3.2 Camadas de proteção
| Camada | Regra |
|---|---|
| **Backup** | Antes de qualquer mudança: backup do banco (exportação completa) e **tag Git `pre-v2`**; guardar **2 cópias** fora do repositório |
| **Ambiente de testes** | Aplicar **toda** migração primeiro em um **Supabase de testes** (cópia da estrutura e, se possível, dos dados do dono). Só depois em produção |
| **Branch** | Trabalhar em `v2-atualizacao` (uma sub-branch por fase). `main` só recebe após **SIM** |
| **Chaves liga/desliga (feature flags)** | `configuracoes.recursos` (JSON): `intervalo`, `locais`, `partes`, `taxas`, `pdf`. **Desligadas** em produção até aprovação; **botão de emergência** desliga sem republicar |
| **Funções versionadas** | Criar `rpc_*_v2`; **manter** as funções antigas funcionando; o front escolhe pela chave |
| **Prévia antes de produção** | Publicar **primeiro em endereço de prévia** (preview); dono testa; só então produção |
| **Plano de volta (rollback)** | Cada fase tem plano: (1) desligar chave; (2) voltar deploy anterior; (3) restaurar tabela de backup (só em reparos de dados) |
| **Testes de não regressão** | Suíte antiga **inteira** continua passando + "**foto antes × depois**" (golden master, seção 12.2) |
| **Segurança** | RLS nas tabelas novas; testar com **duas contas**; sem novos segredos; sem scripts externos novos; revisão do `AndroidManifest`/CSP se aplicável |
| **Auditoria** | Reparos de dados registram `auditoria` (quem/quando/antes/depois) |

### 3.3 Proibições
- ❌ Rodar SQL experimental direto em produção.
- ❌ Apagar lançamentos para "arrumar" contagem.
- ❌ Mudar o significado de campos existentes (`valor_centavos`, `qtd_corridas`) para lançamentos antigos.
- ❌ Desativar RLS ou ampliar permissões para "facilitar".
- ❌ Publicar em produção sem **SIM** e sem **backup do dia**.

---

## 4. Diagnóstico dos defeitos reportados

### 4.1 BUG-01 — Barras de progresso das metas não marcam nada
**Sintoma:** nas metas **diária, semanal e mensal** a barra **não preenche**, mesmo com pouco progresso (a barra só deveria "marcar" depois de cumprir a meta?).
**Comportamento esperado:** preenchimento **proporcional e contínuo** de 0% até o nível Ouro, com **marcos** Bronze/Prata/Ouro por cima; **texto** com `R$ atual / R$ meta (xx,x%)`; atualização **imediata** a cada lançamento.

**Hipóteses a investigar (nesta ordem, com teste para cada uma):**
| # | Hipótese | Como verificar |
|---|---|---|
| H1 | Progresso só é calculado/exibido **a partir de Bronze** (sem preenchimento abaixo do marco) | Ler o componente (`ProgressRing`/`ProgressBar`) e como usa `nivel_atual` |
| H2 | **Unidade errada:** fração (0,35) usada como porcentagem (35) → barra de 0,35% | Inspecionar `width`/`stroke-dashoffset` calculados |
| H3 | **Arredondamento para baixo** (`floor`) zera porcentagens < 1% | Teste com 0,4% e 3% |
| H4 | `rpc_atualizar_metas` **não é chamada** após lançar/editar/excluir, ou falha em silêncio | Conferir chamadas e retorno de erro; ver `meta_ciclos.valor_alcancado` |
| H5 | **Ciclo não existe** para o período atual (só criado no fechamento) | Conferir linhas em `meta_ciclos` por período |
| H6 | `fn_valor_metrica` filtra **datas erradas** (fuso/`data_referencia`) e retorna 0 | Rodar a função manualmente com dados do dia |
| H7 | **Limites de semana/mês** incorretos (`inicio_semana`) | Testar `fn_limites_periodo` |
| H8 | **RLS/consulta** do ciclo não retorna a linha (erro silencioso) | Consultar como o usuário; ver erros no console |
| H9 | Cache do **TanStack Query** não invalidado | Conferir invalidações após mutações |

**Critérios de aceite (todos):**
1. Meta diária R$ 300 com receita R$ 30 → barra em **10%** e texto "**R$ 30,00 / R$ 300,00 (10,0%)**".
2. Receita R$ 0,50 → barra com **preenchimento mínimo visível** (≥ 2% de largura) e texto "**0,2%**".
3. Semanal e mensal **somam os dias** do período (dias fechados **e** o dia aberto).
4. Excluir lançamento **reduz** a barra na hora; editar valor **ajusta**.
5. Marcos **Bronze/Prata/Ouro** aparecem **sobre** a barra nas posições `pct_bronze`, `pct_prata`, `pct_ouro` do alvo; acima de Prata a barra continua até Ouro.
6. Funciona com **dia sem meta criada** (mostra "Criar meta") sem quebrar.
7. Teste automatizado cobre os itens 1–5 (diária, semanal, mensal).

### 4.2 BUG-02 — Dividir o ganho conta a corrida como 2
**Sintoma:** ao dividir uma corrida entre **bolso / Pix / cartão** e **o restante no app**, o sistema registra **mais de um lançamento de entrada** e **soma `qtd_corridas` de cada um**, **contando a mesma corrida duas (ou mais) vezes** em **corridas, ticket médio, metas por corrida** e **ganho por corrida**.
**Comportamento esperado:** **uma corrida = um lançamento (`qtd_corridas = 1`)**. A divisão altera **somente a distribuição do valor** em **partes** (por local). **Sempre existe uma parte no app** (o **restante**, que pode ser **cupom** ou **pago no app**; pode ser R$ 0,00 quando tudo foi recebido fora do app).

**Passos obrigatórios na V2.1/V2.4:**
1. **Descobrir como a divisão foi implementada hoje** (tela, hooks e como grava no banco).
2. **Reproduzir com teste:** dividir R$ 30 em 3 partes → hoje `corridas = 3` (ou 2); esperado `corridas = 1`.
3. **Medir o estrago:** consulta **somente leitura** que lista **grupos de lançamentos criados no mesmo instante** (mesmo dia/plataforma, mesma data/hora até o segundo) com mais de um pedaço (seção 8.8).
4. **Corrigir o futuro** com o novo modelo (seção 5.1) **e** **reparar o histórico** (seção 6.9) **somente com aprovação**.

**Critérios de aceite:**
1. Dividir qualquer corrida em N partes gera **1 lançamento** (`qtd_corridas = 1`) + N partes.
2. Soma das partes = valor da corrida (**sempre**, validado no banco).
3. Parte do app = restante automático; nunca negativa.
4. `corridas`, ticket médio e metas por corrida batem com a contagem real.
5. Histórico reparado conforme opção aprovada (**A** fundir ou **B** zerar a contagem das extras), com **backup e desfazer**.

---

## 5. Regras de negócio (v2)

> Normativas. Em caso de conflito com o PRD v1, **valem estas regras para as funções novas ligadas por chave**; o comportamento antigo continua para o que não foi atualizado.

### 5.1 Corrida única e partes de recebimento
- **RN-V2-01 — Uma corrida, um lançamento.** Toda corrida é **um** lançamento de entrada com `qtd_corridas = 1`. Dividir **não cria** novos lançamentos de entrada.
- **RN-V2-02 — Partes.** O valor da corrida é distribuído em **partes** (`lancamento_partes`). Cada parte tem: **local** (bolso, banco ou app), **meio** (`dinheiro`, `pix`, `debito`, `credito`, `app`, `cupom`) e **valor** (> 0).
- **RN-V2-03 — Soma fecha.** `Σ partes = valor cheio da corrida`. O banco **rejeita** se não fechar.
- **RN-V2-04 — Restante no app.** O motorista informa as partes **recebidas fora do app** (bolso, Pix direto, maquininha). O **restante** vai **automaticamente** para o **App 99**, como **"pago no app"** (padrão) ou **"cupom 99"**. Se as partes informadas **excederem** o valor, **erro** (`PARTES_EXCEDEM_VALOR`).
- **RN-V2-05 — Locais por meio.** `dinheiro` → local **Bolso**; `pix`/`debito`/`credito` → **banco** escolhido (Inter, Mercado Pago, Santander…); `app`/`cupom` → **App 99**.
- **RN-V2-06 — Compatibilidade.** Lançamentos antigos **sem partes** continuam válidos. Depois da **classificação do histórico** (6.9), recebem **uma parte** conforme a regra aprovada.
- **RN-V2-07 — Edição e exclusão.** Editar/excluir uma corrida altera/exclui **suas partes e suas taxas automáticas** juntas (mesma transação). Exclusão é lógica, com desfazer.

### 5.2 Taxas e ganho líquido
- **RN-V2-08 — Valor cheio.** Nas corridas **novas**, `valor` = **"Valor da corrida" do recibo** (inclui a parte do cupom). Nas antigas, o significado **não muda** (seção 6.9 define como tratar).
- **RN-V2-09 — Taxa99.** Se informada, vira **lançamento filho** de **saída** (categoria **"Taxa 99"**, natureza operacional), **paga pelo App 99**, ligado à corrida, com `qtd_corridas = 0`. Origem da taxa: `informada`, `estimada` (por %), `zero_pacote` ou `nenhuma`.
- **RN-V2-10 — Taxa de maquininha/meio.** Para partes `debito`, `credito` ou `pix` em banco com taxa configurada, cria-se **filho de saída** (categoria **"Taxa de maquininha"**), **paga pelo banco** da parte: `taxa = round(valor da parte × % do meio)`.
- **RN-V2-11 — Ganho líquido.** `ganho_liquido = receita − Taxa99 − taxas de maquininha` (e, no dia: `− despesas`). **Marcar com "~"** onde houver taxa **estimada**.
- **RN-V2-12 — Pacote Taxa Zero.** Cadastro de pacote (tipo `diario`, `3dias`, `ganhos`; valor; início; fim/limite). O custo é **despesa** (categoria "Pacote Taxa 99") **paga pelo App 99**, **rateada por dia de vigência** nos relatórios (P1) ou lançada no dia da compra (P0). Corridas na vigência: Taxa99 = 0 (`zero_pacote`).
- **RN-V2-13 — Devolução de taxa.** "**Taxa99 devolvida**" (segunda-feira) = **entrada** categoria "Devolução de taxa 99", **App 99**, `qtd_corridas = 0`.
- **RN-V2-14 — Taxa estimada.** Se o dono preferir não digitar a Taxa99, usa-se **% configurável** (sem valor padrão sugerido pelo sistema; o dono informa com base nos recibos). Corridas ficam marcadas **"estimada"**.

### 5.3 Locais do dinheiro e saldos
- **RN-V2-15 — Locais.** Cada usuário tem **Bolso** (único), **App 99** (único) e **bancos** (vários) escolhidos de um catálogo (Inter, Mercado Pago, Santander, Nubank, Itaú, Bradesco, Caixa, Banco do Brasil, C6, PicPay, PagBank, Neon, Sicoob, Sicredi, Will, **Outro** com nome livre). **Sem logotipos oficiais**: nome e cor.
- **RN-V2-16 — Saldo do local** = saldo inicial + partes recebidas − saídas pagas naquele local ± ajustes + transferências recebidas (líquidas de taxa) − transferências enviadas.
- **RN-V2-17 — Saídas têm local.** Toda **saída nova** informa **"pago com"** (bolso, app ou banco). Padrão = último usado.
- **RN-V2-18 — Transferência entre locais** (saque do app → banco, depósito do bolso → banco, retirada banco → bolso, recarga → app): origem **perde** o valor; destino **recebe o valor menos a taxa** informada (ex.: R$ 1,00). **Não é receita nem despesa de trabalho**; a taxa aparece em "Taxas".
- **RN-V2-19 — "Crédito no app".** Passa a ser **transferência para o App 99** (recarga para cobrir taxas), **não despesa**. *(Confirmar com o dono na V2.1/V2.3; ver decisão D-V2-06.)*
- **RN-V2-20 — App pode ficar negativo.** Alertar quando o App 99 estiver negativo ("a 99 pode exigir recarga ou descontar dos próximos ganhos").
- **RN-V2-21 — Conciliação.** `Σ saldos dos locais = Σ saldos dos caixas (principal + manutenção)` (+ diferença "não classificado" enquanto o histórico não for classificado). Há **tela e teste** de conciliação.
- **RN-V2-22 — Caixas × locais.** Os **caixas** (principal/manutenção) continuam sendo a **visão de finalidade**; os **locais** são a **visão física**. O depósito de manutenção **não move dinheiro entre locais**, a menos que o dono registre uma transferência.

### 5.4 Intervalo e tempo
- **RN-V2-23 — Intervalo.** Só com **dia aberto**; **no máximo um intervalo aberto** por dia. Tipos: descanso, refeição, abastecimento, outro.
- **RN-V2-24 — Tempo.** `tempo_trabalhado = (fechado_em ou agora − aberto_em) − Σ intervalos`. **Ganho por hora líquido** usa o `tempo_trabalhado`.
- **RN-V2-25 — Fechar com intervalo aberto.** O sistema **encerra o intervalo agora** (o dono pode ajustar o horário na tela de fechamento).
- **RN-V2-26 — Lançar durante intervalo** é **permitido**, com aviso discreto.

### 5.5 Metas (ajustes)
- **RN-V2-27 — Progresso contínuo** (seção 4.1) e **nova métrica `ganho_liquido`** (P1), além das existentes. `corridas` passa a contar **corridas reais** (RN-V2-01).

### 5.6 Fechamento (v2)
- **RN-V2-28 — Conferência por local.** No fechamento, a contagem física compara **Bolso** (obrigatório se houver movimento em dinheiro); **App 99** e **bancos** podem ser conferidos **opcionalmente** (o dono digita o saldo que vê no app/banco). Diferenças geram **ajuste no local** correspondente.
- **RN-V2-29 — Depósito de manutenção** continua como no v1 (RN-11/12), agora informando **de qual local** o dono considera que saiu (opcional).
- **RN-V2-30 — Snapshot do dia** passa a incluir: partes por meio/local, taxas, saldos por local (abertura/fechamento), intervalos, tempo líquido (usado pelo PDF).

---

## 6. Requisitos funcionais (RF-V2)

> Formato: **ID · Requisito · Prioridade · Critério de aceite**. Todos atrás de **chave liga/desliga** (seção 3.2), exceto as **correções** (BUG-01) e a **barra do topo**, que entram direto **após testes e SIM**.

### 6.1 Barra de ações do topo (MUD-03)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-TOP-01 | **Barra fixa no topo** (abaixo da barra de status) com **[☕ Intervalo]** e **[✔ Fechar dia]** enquanto houver **dia aberto** | P0 | Visível **sem rolar** em 360 px; **removidos do rodapé**; respeita **áreas seguras** (web e APK) |
| RF-V2-TOP-02 | **Chip de status**: "Dia aberto · 5h42" e, em intervalo, "**Em intervalo · 00:12**" com cronômetro | P0 | Atualiza a cada minuto/segundo |
| RF-V2-TOP-03 | **Fechar dia** abre o **stepper de fechamento** (não fecha direto) | P0 | Exige confirmação final no último passo (evita toque acidental) |
| RF-V2-TOP-04 | Sem dia aberto: topo mostra **[⏱ Abrir dia]** | P0 | Mesmo local e estilo |
| RF-V2-TOP-05 | Barra presente nas telas principais (Início, Caixa, Metas) | P1 | Não cobre conteúdo; não duplica |
| RF-V2-TOP-06 | Desktop: botões no cabeçalho, à direita | P1 | — |
| RF-V2-TOP-07 | Alvos de toque **≥ 48 px**, foco visível, contraste AA | P0 | Teste de acessibilidade |

### 6.2 Intervalo (MUD-03)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-INT-01 | **Iniciar intervalo** (1 toque) com tipo opcional (descanso, refeição, abastecimento, outro) | P0 | Botão vira **[▶ Retomar]**; cronômetro no topo |
| RF-V2-INT-02 | **Encerrar intervalo** (Retomar) | P0 | Registra fim; soma ao dia |
| RF-V2-INT-03 | Fechar o dia com intervalo aberto **encerra automaticamente** | P0 | Tela de fechamento mostra o horário e permite ajustar |
| RF-V2-INT-04 | **Tempo trabalhado líquido** e **ganho por hora líquido** no Início, no fechamento e no PDF | P0 | RN-V2-24 |
| RF-V2-INT-05 | Lista de intervalos do dia (editar/excluir horários no dia aberto) | P1 | Dia fechado: somente leitura |
| RF-V2-INT-06 | **Lembrete visual** após X horas sem intervalo (configurável, **desligado por padrão**) | P2 | Sem notificação push |

### 6.3 Barras de progresso das metas (BUG-01 / MUD-04)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-MET-01 | Barra/anel com **preenchimento contínuo** de 0% a Ouro, com **marcos** 🥉🥈🥇 | P0 | Seção 4.1 (itens 1–5) |
| RF-V2-MET-02 | **Texto**: `R$ atual / R$ meta (xx,x%)` e "faltam R$ X" | P0 | Uma casa decimal; nunca "0%" quando há progresso |
| RF-V2-MET-03 | Início mostra **três barras** (diária, semanal, mensal) quando existirem metas | P0 | Cada uma com título e período |
| RF-V2-MET-04 | **Atualização imediata** após lançar/editar/excluir/fechar | P0 | Sem recarregar a página |
| RF-V2-MET-05 | Nova métrica **`ganho_liquido`** | P1 | Soma = receita − taxas − despesas (RN-V2-11) |
| RF-V2-MET-06 | Estado "sem meta" com botão **Criar meta** | P0 | Sem erro |
| RF-V2-MET-07 | **Teste automatizado** de diária, semanal e mensal | P0 | Seção 12 |

### 6.4 Locais do dinheiro — bolso, app e bancos (MUD-02 / MUD-05)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-LOC-01 | Criar automaticamente **Bolso** e **App 99** para cada usuário (também para os existentes) | P0 | Função idempotente; sem duplicar |
| RF-V2-LOC-02 | **Escolher bancos** em um catálogo (Inter, Mercado Pago, Santander, Nubank, Itaú, Bradesco, Caixa, BB, C6, PicPay, PagBank, Neon, Sicoob, Sicredi, Will, **Outro**) | P0 | Adicionar, renomear, ocultar e reordenar |
| RF-V2-LOC-03 | **Saldo inicial** por local (informado pelo dono) | P0 | Valores reais conferidos na entrevista |
| RF-V2-LOC-04 | **Cartões de saldo** no Início: **Bolso · App 99 · Bancos (soma, com detalhe)** e **Total** | P0 | Total = soma; app negativo em vermelho com alerta |
| RF-V2-LOC-05 | Tela **"Meu dinheiro"** com cada local, extrato e gráfico simples de distribuição | P1 | Filtros por período |
| RF-V2-LOC-06 | **Taxas por banco:** débito %, crédito %, Pix %, **prazo** (dias) | P0 | Preenchidas pelo dono; usadas na RN-V2-10 |
| RF-V2-LOC-07 | **Transferência entre locais** com taxa opcional (saque do app, depósito, retirada, recarga) | P0 | RN-V2-18; não infla receita |
| RF-V2-LOC-08 | **Saída com "pago com"** (local) | P0 | RN-V2-17 |
| RF-V2-LOC-09 | **Conciliação** (locais × caixas) com aviso de diferença | P0 | RN-V2-21 |
| RF-V2-LOC-10 | **Classificar o histórico** (ver 6.9) | P0 | Simulação + aprovação + backup |
| RF-V2-LOC-11 | Recebimentos **a receber** (crédito com prazo > 0) em visão separada | P2 | — |

### 6.5 Corrida única com pagamento em partes (BUG-02 / MUD-07)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-COR-01 | Tela **"Como você recebeu?"** ao lançar corrida: campos **Valor da corrida**, **Taxa99 (opcional)**, e **partes** (Bolso, Pix direto → banco, Cartão débito/crédito → banco) | P0 | Parte do **App 99 calculada automaticamente** (o que sobra) |
| RF-V2-COR-02 | Seletor do restante: **"Pago no app"** (padrão) ou **"Cupom 99"** | P0 | RN-V2-04 |
| RF-V2-COR-03 | **Atalhos:** "Tudo no app", "Tudo em dinheiro", "Dinheiro + app", "Pix + app", "Repetir última divisão" | P0 | 1 toque preenche |
| RF-V2-COR-04 | **Validação visual** em tempo real: soma, restante, erro se exceder | P0 | Botão Salvar só habilita se válido |
| RF-V2-COR-05 | Salvar gera **1 lançamento** (`qtd_corridas = 1`) + partes + taxas filhas, **numa transação** | P0 | RN-V2-01 a 10 |
| RF-V2-COR-06 | **Lista do dia** mostra a corrida **uma vez**, com resumo das partes (ícones) e taxas recolhidas | P0 | Expandir mostra detalhe |
| RF-V2-COR-07 | **Editar/excluir** corrida com partes (e desfazer) | P0 | RN-V2-07 |
| RF-V2-COR-08 | **Lançamento rápido** de 3 toques continua existindo (tudo no app ou tudo em dinheiro) | P0 | Não piora a rapidez do v1 |
| RF-V2-COR-09 | **Contagem de corridas** (Início, metas, relatórios, PDF) usa corridas reais | P0 | Teste com divisão em 3 partes → 1 corrida |
| RF-V2-COR-10 | Selo "**estimada**" quando a Taxa99 for estimada | P0 | Aparece na lista e no PDF com "~" |
| RF-V2-COR-11 | Lote do dia ("resumo por plataforma") continua funcionando | P0 | Sem regressão |

### 6.6 Taxas, pacote Taxa Zero e ganho líquido (MUD-01 / MUD-02)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-TAX-01 | **Taxa99** por corrida: digitar o valor **ou** informar o "Você recebe" (taxa = valor − recebe) | P0 | Cálculo automático e exibido |
| RF-V2-TAX-02 | **Modo estimado:** % configurável aplicado quando a taxa não é informada | P1 | Marcado como estimativa (RN-V2-14) |
| RF-V2-TAX-03 | **Pacote Taxa Zero:** cadastrar pacote (tipo, valor, início, fim/limite); aplica Taxa99 = 0 na vigência | P1 | RN-V2-12 |
| RF-V2-TAX-04 | **Devolução da Taxa99** (segunda-feira) como receita no app | P1 | RN-V2-13 |
| RF-V2-TAX-05 | **Taxa de maquininha automática** na parte do cartão | P0 | RN-V2-10 |
| RF-V2-TAX-06 | **Indicadores**: ganho bruto, **taxas (99 + maquininha)**, **taxa efetiva %**, **ganho líquido**, **ganho/hora líquido**, **lucro/km** | P0 | Fórmulas da seção 5.2/5.4 |
| RF-V2-TAX-07 | Categorias novas: **Taxa 99**, **Taxa de maquininha**, **Pacote Taxa 99**, **Taxa de saque**, **Devolução de taxa 99**, **Taxa de cancelamento recebida** | P0 | Criadas para novos e existentes (idempotente) |
| RF-V2-TAX-08 | **Comparar** valor do aceite × valor recebido (alerta de diferença > R$ 0,50) | P2 | Ajuda a auditar cupom |
| RF-V2-TAX-09 | Painel **"Taxas da semana"** (soma e % efetiva) | P1 | — |

### 6.7 Fechamento do dia v2 (MUD-02 / MUD-06)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-FEC-01 | Passo de **conferência por local** (Bolso obrigatório se houve dinheiro; App e bancos opcionais) | P0 | RN-V2-28 |
| RF-V2-FEC-02 | Resumo por **forma de recebimento** (dinheiro, Pix, débito, crédito, app, cupom) e por **local** | P0 | Soma = receita |
| RF-V2-FEC-03 | Mostra **tempo trabalhado líquido**, intervalos, km, corridas, ticket médio, ganho/hora líquido | P0 | RN-V2-24 |
| RF-V2-FEC-04 | Tela final com **[📄 Baixar PDF] [📤 Compartilhar] [🖨 Imprimir] [Concluir]** | P0 | Seção 10 |
| RF-V2-FEC-05 | `rpc_fechar_dia_v2` (atômica) mantendo **todo o comportamento do v1** | P0 | Teste do Anexo A do v1 continua passando |
| RF-V2-FEC-06 | **Reabrir** continua só no último dia e estorna ajustes/depósito do fechamento | P0 | Sem regressão |

### 6.8 Relatório do dia em PDF (MUD-06)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-PDF-01 | Gerar **PDF A4** do dia **no aparelho** (sem enviar dados a servidores) | P0 | < 3 s; funciona offline |
| RF-V2-PDF-02 | **Conteúdo** completo conforme seção 10.2 | P0 | Todas as seções presentes |
| RF-V2-PDF-03 | **Design atraente e fácil de entender** (seção 10.3) | P0 | Aprovado pelo dono com PDF real |
| RF-V2-PDF-04 | **Baixar**, **compartilhar** (WhatsApp/e-mail) e **imprimir** | P0 | Web e APK |
| RF-V2-PDF-05 | Disponível também em **Histórico → Dia** (dias fechados) | P0 | Mesmo PDF |
| RF-V2-PDF-06 | Opções: **colorido** ou **econômico (P&B)**; **com ou sem lista completa** de lançamentos | P1 | Escolha lembrada |
| RF-V2-PDF-07 | Nome do arquivo `DriveCash_Relatorio_AAAA-MM-DD.pdf` | P0 | — |
| RF-V2-PDF-08 | PDF **semanal/mensal** | P2 | Backlog |
| RF-V2-PDF-09 | Nenhum dado sensível além do necessário (**sem número de conta/agência**) | P0 | Revisão |

### 6.9 Migração e reparo do histórico (BUG-02 / MUD-05)
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-MIG-01 | **Foto antes × depois** (golden master) dos totais por dia e por caixa | P0 | Idênticos após as migrações (exceto reparo aprovado) |
| RF-V2-MIG-02 | **Relatório de auditoria** do histórico: quantos lançamentos, **corridas divididas** (candidatas), sem local, sem partes | P0 | Mostrado ao dono em tabela simples |
| RF-V2-MIG-03 | **Classificar histórico por regra** (Dinheiro → Bolso; Pix → banco padrão escolhido; Saldo do app → App 99; sem informação → regra escolhida) | P0 | **Simulação (dry-run)** → aprovação → aplicar com **backup** |
| RF-V2-MIG-04 | **Reparo de corridas divididas (opção A):** fundir em **1 corrida com partes** (soma = soma dos pedaços; `qtd_corridas = 1`) | P0 | Caso a caso para ambíguos; **desfazer** disponível |
| RF-V2-MIG-05 | **Reparo (opção B):** manter linhas e **zerar `qtd_corridas` das extras** | P0 | Alternativa de menor risco |
| RF-V2-MIG-06 | **Registro de auditoria** de todo reparo e **tabela de backup** (`..._pre_v2`) | P0 | Reversível |
| RF-V2-MIG-07 | **Valor legado:** corridas antigas **não** ganham taxa automática; ficam `taxa_origem = 'nenhuma'` | P0 | Sem alterar totais antigos |

### 6.10 Configurações e segurança
| ID | Requisito | Pri. | Critério de aceite |
|---|---|---|---|
| RF-V2-CFG-01 | Tela **"Recursos"** (administração do dono) com as chaves liga/desliga e **botão de emergência** | P0 | Desliga sem republicar |
| RF-V2-CFG-02 | Preferências de taxa: modo (informar/estimar) e % estimado | P1 | — |
| RF-V2-CFG-03 | Preferências do PDF (colorido/P&B, lista completa) | P1 | — |
| RF-V2-CFG-04 | **Versão do app e do banco** exibidas em Configurações | P1 | Ajuda no suporte |
| RF-V2-SEG-01 | RLS e testes de isolamento para **todas** as tabelas novas | P0 | Duas contas |
| RF-V2-SEG-02 | **Sem novos segredos** no cliente; **sem scripts externos** novos | P0 | Revisão |
| RF-V2-SEG-03 | Dados do PDF **nunca** saem do aparelho, exceto por ação explícita de compartilhar | P0 | Revisão |

---

## 7. Telas e fluxos

### 7.1 Barra do topo (dia aberto)
```
┌──────────────────────────────────────────┐
│ ● Dia aberto · 5h42    [☕ Intervalo] [✔ Fechar dia] │  ← fixa no topo
├──────────────────────────────────────────┤
│  CAIXA ATUAL  R$ 385,00                  │
│  META DIA   ████████░░░░░░  58,0%        │
│  META SEM   ███░░░░░░░░░░░  21,4%        │
│  META MÊS   █░░░░░░░░░░░░░   6,3%        │
```
Em intervalo: `● Em intervalo · 00:12    [▶ Retomar] [✔ Fechar dia]`.

### 7.2 Lançar corrida — "Como você recebeu?"
```
┌──────────────────────────────────────────┐
│ Valor da corrida          R$ 30,00       │
│ Taxa99 (opcional)         R$ 6,00        │
│ ─────────────────────────────────────── │
│ 💵 Dinheiro (bolso)       R$ 8,00        │
│ ⚡ Pix direto   [Inter ▾]  R$ 7,00        │
│ 💳 Cartão       [Mercado Pago ▾] [Déb ▾] R$ 5,00 │
│ 📱 Restante → App 99   ( ● Pago no app ○ Cupom )  R$ 10,00 │
│ ─────────────────────────────────────── │
│ ✔ Soma fecha: R$ 30,00     Corridas: 1   │
│ Ganho líquido estimado: R$ 23,90         │
│ Atalhos: [Tudo no app] [Tudo dinheiro] [Repetir última] │
│ [          SALVAR CORRIDA          ]     │
└──────────────────────────────────────────┘
```

### 7.3 "Meu dinheiro" (Início e tela própria)
```
┌──────────────────────────────────────────┐
│ MEU DINHEIRO                 Total R$ 1.234,50 │
│ 💵 Bolso            R$ 128,00            │
│ 📱 App 99           −R$ 12,00  ⚠ negativo │
│ 🏦 Inter            R$ 640,00            │
│ 🏦 Mercado Pago     R$ 310,50            │
│ 🏦 Santander        R$ 168,00            │
│ [ Transferir ]  [ Conciliação ✔ ]        │
└──────────────────────────────────────────┘
```

### 7.4 Fechamento v2 (passos)
`1 Resumo (por forma de recebimento e por local)` → `2 Lote por plataforma (opcional)` → `3 Conferência por local + km/horas + intervalos` → `4 Manutenção e confirmação` → **Tela final com PDF**.

### 7.5 Tela final — "Dia fechado!"
```
✅ Dia fechado!    Ganho líquido ~R$ 255,00   Corridas 14   Tempo 8h12 (líquido)
[📄 Baixar PDF] [📤 Compartilhar] [🖨 Imprimir] [Concluir]
```

---

## 8. Modelo de dados — SQL de referência (aditivo)

> **Adaptar ao banco real** após a auditoria. Cada bloco vira uma migração versionada (`0101` a `0108`), aplicada **primeiro no ambiente de testes**. Tudo é **aditivo**; funções antigas permanecem.

### 8.1 `0101_flags_e_backup.sql`
```sql
-- Chaves liga/desliga por usuário
alter table public.configuracoes
  add column if not exists recursos jsonb not null default
  '{"intervalo":false,"locais":false,"partes":false,"taxas":false,"pdf":false}'::jsonb;

-- Foto "antes" (golden master) dos totais por dia — somente leitura depois de criada
create table if not exists public.v2_snapshot_antes as
select d.id as dia_id, d.user_id, d.data_referencia, d.status,
       d.saldo_abertura_centavos, d.saldo_fechamento_centavos,
       r.receita_centavos, r.despesas_centavos, r.reserva_centavos, r.corridas
from public.dias_trabalho d
join public.vw_resumo_dia r on r.dia_id = d.id;

create table if not exists public.v2_snapshot_antes_caixas as
select caixa_id, user_id, tipo, saldo_centavos from public.vw_saldo_caixas;

alter table public.v2_snapshot_antes enable row level security;
alter table public.v2_snapshot_antes_caixas enable row level security;
create policy v2_snap_sel on public.v2_snapshot_antes for select using (user_id = auth.uid());
create policy v2_snap_caixas_sel on public.v2_snapshot_antes_caixas for select using (user_id = auth.uid());
```

### 8.2 `0102_intervalos.sql`
```sql
create table public.pausas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia_id uuid not null references public.dias_trabalho(id) on delete cascade,
  inicio timestamptz not null default now(),
  fim timestamptz,
  tipo text not null default 'descanso' check (tipo in ('descanso','refeicao','abastecimento','outro')),
  observacao text,
  criado_em timestamptz not null default now(),
  check (fim is null or fim >= inicio)
);
create unique index ux_pausa_aberta on public.pausas (dia_id) where fim is null;
create index ix_pausas_dia on public.pausas (dia_id);

alter table public.pausas enable row level security;
create policy pausas_sel on public.pausas for select using (user_id = auth.uid());
create policy pausas_ins on public.pausas for insert with check (user_id = auth.uid());
create policy pausas_upd on public.pausas for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy pausas_del on public.pausas for delete using (user_id = auth.uid());

alter table public.dias_trabalho
  add column if not exists minutos_pausa integer not null default 0,
  add column if not exists minutos_trabalhados integer;

create or replace function public.rpc_iniciar_intervalo(p_dia_id uuid, p_tipo text default 'descanso')
returns public.pausas language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid(); v_dia public.dias_trabalho; v_p public.pausas;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_dia from dias_trabalho where id = p_dia_id and user_id = v_user;
  if not found then raise exception 'DIA_NAO_ENCONTRADO'; end if;
  if v_dia.status <> 'aberto' then raise exception 'DIA_FECHADO'; end if;
  if exists (select 1 from pausas where dia_id = p_dia_id and fim is null) then raise exception 'INTERVALO_JA_ABERTO'; end if;
  insert into pausas (user_id, dia_id, tipo) values (v_user, p_dia_id, p_tipo) returning * into v_p;
  return v_p;
end $$;

create or replace function public.rpc_encerrar_intervalo(p_dia_id uuid)
returns public.pausas language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid(); v_p public.pausas;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  update pausas set fim = now() where dia_id = p_dia_id and user_id = v_user and fim is null returning * into v_p;
  if not found then raise exception 'SEM_INTERVALO_ABERTO'; end if;
  return v_p;
end $$;
```
> Criar também um *trigger* análogo ao dos lançamentos para **bloquear alterações em pausas de dia fechado**.

### 8.3 `0103_locais.sql`
```sql
create type public.tipo_local as enum ('bolso','app','banco');

create table public.bancos_catalogo (
  codigo text primary key, nome text not null, cor text not null default '#B4B4BB', ordem smallint not null default 0
);
insert into public.bancos_catalogo (codigo, nome, cor, ordem) values
 ('inter','Inter','#FF7A00',1),('mercado_pago','Mercado Pago','#00B1EA',2),('santander','Santander','#EC0000',3),
 ('nubank','Nubank','#820AD1',4),('itau','Itaú','#FF6200',5),('bradesco','Bradesco','#CC092F',6),
 ('caixa','Caixa','#0070AF',7),('banco_do_brasil','Banco do Brasil','#FCDF00',8),('c6','C6 Bank','#B4B4BB',9),
 ('picpay','PicPay','#21C25E',10),('pagbank','PagBank','#41B649',11),('neon','Neon','#00E1FF',12),
 ('sicoob','Sicoob','#00A68C',13),('sicredi','Sicredi','#5FB946',14),('will','Will Bank','#FFD400',15),
 ('outro','Outro','#B4B4BB',99)
on conflict do nothing;
alter table public.bancos_catalogo enable row level security;
create policy bancos_cat_sel on public.bancos_catalogo for select to authenticated using (true);

create table public.locais_dinheiro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo public.tipo_local not null,
  nome text not null check (char_length(nome) between 1 and 40),
  banco_codigo text references public.bancos_catalogo(codigo),
  cor text,
  saldo_inicial_centavos bigint not null default 0,
  taxa_debito_pct   numeric(5,2) not null default 0 check (taxa_debito_pct   between 0 and 30),
  taxa_credito_pct  numeric(5,2) not null default 0 check (taxa_credito_pct  between 0 and 30),
  taxa_pix_pct      numeric(5,2) not null default 0 check (taxa_pix_pct      between 0 and 30),
  prazo_credito_dias integer not null default 0 check (prazo_credito_dias between 0 and 365),
  ativo boolean not null default true,
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  check ((tipo = 'banco') or banco_codigo is null)
);
create unique index ux_local_unico on public.locais_dinheiro (user_id, tipo) where tipo in ('bolso','app');
create index ix_locais_user on public.locais_dinheiro (user_id, ativo);

alter table public.locais_dinheiro enable row level security;
create policy locais_sel on public.locais_dinheiro for select using (user_id = auth.uid());
create policy locais_ins on public.locais_dinheiro for insert with check (user_id = auth.uid());
create policy locais_upd on public.locais_dinheiro for update using (user_id = auth.uid()) with check (user_id = auth.uid());
-- sem DELETE: para "remover", marcar ativo = false

-- Cria Bolso e App 99 (idempotente) — chamada ao ligar o recurso e no cadastro de novos usuários
create or replace function public.rpc_inicializar_locais() returns void
language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  insert into locais_dinheiro (user_id, tipo, nome, ordem)
  select v_user, 'bolso', 'Bolso', 1 where not exists (select 1 from locais_dinheiro where user_id = v_user and tipo = 'bolso');
  insert into locais_dinheiro (user_id, tipo, nome, ordem)
  select v_user, 'app', 'App 99', 2 where not exists (select 1 from locais_dinheiro where user_id = v_user and tipo = 'app');
end $$;

create table public.locais_transferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_origem_id  uuid not null references public.locais_dinheiro(id),
  local_destino_id uuid not null references public.locais_dinheiro(id),
  valor_centavos bigint not null check (valor_centavos > 0),
  taxa_centavos  bigint not null default 0 check (taxa_centavos >= 0 and taxa_centavos <= valor_centavos),
  dia_id uuid references public.dias_trabalho(id) on delete set null,
  data_referencia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  observacao text,
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  check (local_origem_id <> local_destino_id)
);
alter table public.locais_transferencias enable row level security;
create policy loc_transf_sel on public.locais_transferencias for select using (user_id = auth.uid());
create policy loc_transf_ins on public.locais_transferencias for insert with check (user_id = auth.uid());
create policy loc_transf_upd on public.locais_transferencias for update using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### 8.4 `0104_partes_e_colunas.sql`
```sql
-- Colunas novas em lançamentos (todas com padrão: nada muda para o histórico)
alter table public.lancamentos
  add column if not exists local_id uuid references public.locais_dinheiro(id),          -- de onde saiu (saídas/ajustes)
  add column if not exists lancamento_pai_id uuid references public.lancamentos(id),     -- taxas automáticas apontam para a corrida
  add column if not exists modo_partes boolean not null default false,                    -- true = tem partes
  add column if not exists taxa_origem text not null default 'nenhuma'
      check (taxa_origem in ('nenhuma','informada','estimada','zero_pacote'));

-- Novos valores permitidos em "origem" (recriar a CHECK existente: descobrir o nome real na auditoria)
-- alter table public.lancamentos drop constraint <nome_real_da_check_origem>;
-- alter table public.lancamentos add constraint ck_lanc_origem check (origem in
--   ('manual','resumo_dia','deposito_manutencao','ajuste_abertura','conferencia','prioridade','transferencia','sistema',
--    'taxa_plataforma','taxa_meio','pacote_taxa_zero','devolucao_taxa'));

create index if not exists ix_lanc_pai on public.lancamentos (lancamento_pai_id) where lancamento_pai_id is not null;

create table public.lancamento_partes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lancamento_id uuid not null references public.lancamentos(id) on delete cascade,
  local_id uuid not null references public.locais_dinheiro(id),
  meio text not null check (meio in ('dinheiro','pix','debito','credito','app','cupom')),
  valor_centavos bigint not null check (valor_centavos > 0 and valor_centavos <= 100000000),
  legado boolean not null default false,                       -- true = criada na classificação do histórico
  criado_em timestamptz not null default now(),
  unique (lancamento_id, local_id, meio)
);
create index ix_partes_lanc on public.lancamento_partes (lancamento_id);
create index ix_partes_local on public.lancamento_partes (local_id);

alter table public.lancamento_partes enable row level security;
create policy partes_sel on public.lancamento_partes for select using (user_id = auth.uid());
create policy partes_ins on public.lancamento_partes for insert with check (user_id = auth.uid());
create policy partes_upd on public.lancamento_partes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy partes_del on public.lancamento_partes for delete using (user_id = auth.uid());

-- Garante, no COMMIT, que a soma das partes = valor da corrida (vale para qualquer caminho de escrita)
create or replace function public.fn_checa_soma_partes() returns trigger
language plpgsql set search_path = public as $$
declare v_id uuid; v_valor bigint; v_modo boolean; v_soma bigint;
begin
  v_id := case tg_table_name when 'lancamentos' then coalesce(new.id, old.id)
                              else coalesce(new.lancamento_id, old.lancamento_id) end;
  select valor_centavos, modo_partes into v_valor, v_modo from lancamentos where id = v_id and excluido_em is null;
  if not found or v_modo is not true then return null; end if;
  select coalesce(sum(valor_centavos), 0) into v_soma from lancamento_partes where lancamento_id = v_id;
  if v_soma <> v_valor then
    raise exception 'PARTES_NAO_FECHAM' using detail = format('lancamento %s valor %s partes %s', v_id, v_valor, v_soma);
  end if;
  return null;
end $$;

create constraint trigger trg_partes_soma after insert or update or delete on public.lancamento_partes
  deferrable initially deferred for each row execute function public.fn_checa_soma_partes();
create constraint trigger trg_lanc_soma after insert or update of valor_centavos, modo_partes on public.lancamentos
  deferrable initially deferred for each row execute function public.fn_checa_soma_partes();
```

### 8.5 `0105_categorias_v2.sql`
```sql
-- Garante as categorias novas (idempotente) para o usuário logado; também chamar no cadastro de novos usuários
create or replace function public.rpc_garantir_categorias_v2() returns void
language plpgsql set search_path = public as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  insert into categorias (user_id, tipo, nome, icone, natureza, sistema, ordem)
  select v_user, x.tipo, x.nome, x.icone, 'operacional', true, x.ordem
  from (values
    ('saida','Taxa 99','percent',20),
    ('saida','Taxa de maquininha','credit-card',21),
    ('saida','Pacote Taxa 99','package',22),
    ('saida','Taxa de saque','landmark',23),
    ('entrada','Devolução de taxa 99','undo-2',20),
    ('entrada','Taxa de cancelamento recebida','ban',21)
  ) as x(tipo, nome, icone, ordem)
  where not exists (select 1 from categorias c where c.user_id = v_user and c.tipo = x.tipo and c.nome = x.nome);
end $$;
```

### 8.6 `0106_rpc_corrida.sql` (núcleo do BUG-02)
```sql
create or replace function public.rpc_lancar_corrida(
  p_id uuid,                                   -- gerado no cliente (idempotência)
  p_dia_id uuid,
  p_plataforma_id uuid,
  p_categoria_id uuid,                         -- categoria de entrada "Corridas"
  p_valor_centavos bigint,                     -- valor cheio (recibo)
  p_partes jsonb default '[]'::jsonb,          -- [{"local_id":"…","meio":"dinheiro|pix|debito|credito","valor_centavos":800}]
  p_resto_tipo text default 'app',             -- 'app' (pago no app) | 'cupom'
  p_taxa_plataforma_centavos bigint default 0,
  p_taxa_origem text default 'nenhuma',
  p_qtd_corridas integer default 1,            -- 1 = corrida; 0 = gorjeta/bônus/devolução (não conta corrida)
  p_ocorrido_em timestamptz default now(),
  p_km numeric default null,
  p_descricao text default null
) returns public.lancamentos
language plpgsql set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_caixa uuid; v_app uuid; v_lanc public.lancamentos;
  v_cat_taxa99 uuid; v_cat_maq uuid; v_soma bigint := 0; v_resto bigint; p record; v_local public.locais_dinheiro; v_taxa bigint; v_pct numeric;
begin
  if v_user is null then raise exception 'NAO_AUTENTICADO'; end if;
  select * into v_lanc from lancamentos where id = p_id and user_id = v_user;      -- idempotência
  if found then return v_lanc; end if;
  if p_valor_centavos is null or p_valor_centavos <= 0 then raise exception 'VALOR_INVALIDO'; end if;
  if p_resto_tipo not in ('app','cupom') then raise exception 'RESTO_TIPO_INVALIDO'; end if;
  if p_taxa_plataforma_centavos < 0 or p_taxa_plataforma_centavos > p_valor_centavos then raise exception 'TAXA_INVALIDA'; end if;
  if p_qtd_corridas not in (0, 1) then raise exception 'QTD_CORRIDAS_INVALIDA'; end if;

  select id into v_caixa from caixas where user_id = v_user and tipo = 'principal';
  select id into v_app   from locais_dinheiro where user_id = v_user and tipo = 'app' and ativo;
  if v_app is null then raise exception 'LOCAL_APP_AUSENTE'; end if;
  select id into v_cat_taxa99 from categorias where user_id = v_user and tipo = 'saida' and nome = 'Taxa 99';
  select id into v_cat_maq    from categorias where user_id = v_user and tipo = 'saida' and nome = 'Taxa de maquininha';

  for p in select * from jsonb_to_recordset(p_partes) as x(local_id uuid, meio text, valor_centavos bigint) loop
    if p.valor_centavos is null or p.valor_centavos <= 0 then raise exception 'PARTE_INVALIDA'; end if;
    if p.meio not in ('dinheiro','pix','debito','credito') then raise exception 'MEIO_INVALIDO'; end if;
    if not exists (select 1 from locais_dinheiro where id = p.local_id and user_id = v_user and ativo) then raise exception 'LOCAL_INVALIDO'; end if;
    v_soma := v_soma + p.valor_centavos;
  end loop;
  v_resto := p_valor_centavos - v_soma;
  if v_resto < 0 then raise exception 'PARTES_EXCEDEM_VALOR'; end if;

  insert into lancamentos (id, user_id, caixa_id, dia_id, tipo, valor_centavos, categoria_id, plataforma_id,
                           descricao, qtd_corridas, km, ocorrido_em, origem, modo_partes, taxa_origem)
  values (p_id, v_user, v_caixa, p_dia_id, 'entrada', p_valor_centavos, p_categoria_id, p_plataforma_id,
          p_descricao, p_qtd_corridas, p_km, p_ocorrido_em, 'manual', true, p_taxa_origem)
  returning * into v_lanc;

  -- partes informadas (fora do app) + restante no app
  for p in select * from jsonb_to_recordset(p_partes) as x(local_id uuid, meio text, valor_centavos bigint) loop
    insert into lancamento_partes (user_id, lancamento_id, local_id, meio, valor_centavos)
    values (v_user, p_id, p.local_id, p.meio, p.valor_centavos);

    select * into v_local from locais_dinheiro where id = p.local_id;
    v_pct := case p.meio when 'debito' then v_local.taxa_debito_pct when 'credito' then v_local.taxa_credito_pct
                         when 'pix' then v_local.taxa_pix_pct else 0 end;
    v_taxa := round(p.valor_centavos * v_pct / 100.0);
    if v_taxa > 0 then
      insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, categoria_id, descricao, qtd_corridas,
                               ocorrido_em, origem, local_id, lancamento_pai_id)
      values (v_user, v_caixa, p_dia_id, 'saida', v_taxa, v_cat_maq, 'Taxa de maquininha/meio', 0,
              p_ocorrido_em, 'taxa_meio', p.local_id, p_id);
    end if;
  end loop;

  if v_resto > 0 then
    insert into lancamento_partes (user_id, lancamento_id, local_id, meio, valor_centavos)
    values (v_user, p_id, v_app, p_resto_tipo, v_resto);
  end if;

  if p_taxa_plataforma_centavos > 0 then
    insert into lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, categoria_id, descricao, qtd_corridas,
                             ocorrido_em, origem, local_id, lancamento_pai_id)
    values (v_user, v_caixa, p_dia_id, 'saida', p_taxa_plataforma_centavos, v_cat_taxa99, 'Taxa99', 0,
            p_ocorrido_em, 'taxa_plataforma', v_app, p_id);
  end if;
  return v_lanc;
end $$;
```
> **Nota:** se o valor da corrida for **100% fora do app** (restante = 0), **não existe** parte do app — a regra "sempre uma parte no app" significa **o restante vai para o app**, que pode ser R$ 0,00. A Taxa99 é **sempre** debitada do App 99.
> **A implementar (mesmo padrão):** `rpc_substituir_corrida` (editar), `rpc_excluir_corrida` (exclui corrida + partes + filhos, com desfazer), `rpc_transferir_local` (valida saldo da origem; app pode ficar negativo **apenas por taxas**, não por transferência) e `rpc_fechar_dia_v2`.

### 8.7 `0107_views_locais.sql`
```sql
create or replace view public.vw_saldo_locais with (security_invoker = true) as
select l.id as local_id, l.user_id, l.tipo, l.nome, l.banco_codigo, l.ordem,
  l.saldo_inicial_centavos
  + coalesce((select sum(p.valor_centavos) from lancamento_partes p join lancamentos x on x.id = p.lancamento_id
               where p.local_id = l.id and x.excluido_em is null and x.tipo = 'entrada'), 0)
  + coalesce((select sum(s.valor_centavos) from lancamentos s
               where s.local_id = l.id and s.excluido_em is null and s.tipo = 'ajuste_entrada'), 0)
  - coalesce((select sum(s.valor_centavos) from lancamentos s
               where s.local_id = l.id and s.excluido_em is null and s.tipo in ('saida','ajuste_saida')), 0)
  + coalesce((select sum(t.valor_centavos - t.taxa_centavos) from locais_transferencias t
               where t.local_destino_id = l.id and t.excluido_em is null), 0)
  - coalesce((select sum(t.valor_centavos) from locais_transferencias t
               where t.local_origem_id = l.id and t.excluido_em is null), 0) as saldo_centavos
from public.locais_dinheiro l;

-- Conciliação: locais × caixas (para o dono ver diferenças durante a classificação do histórico)
create or replace view public.vw_conciliacao with (security_invoker = true) as
select u.user_id,
  (select coalesce(sum(saldo_centavos),0) from vw_saldo_locais where user_id = u.user_id) as total_locais_centavos,
  (select coalesce(sum(saldo_centavos),0) from vw_saldo_caixas where user_id = u.user_id) as total_caixas_centavos
from (select distinct user_id from public.locais_dinheiro) u;

-- Corridas e receita por MEIO e por LOCAL no dia (usadas no fechamento e no PDF)
create or replace view public.vw_dia_por_meio with (security_invoker = true) as
select x.dia_id, p.meio, p.local_id, sum(p.valor_centavos)::bigint as valor_centavos
from public.lancamento_partes p join public.lancamentos x on x.id = p.lancamento_id
where x.excluido_em is null and x.tipo = 'entrada'
group by x.dia_id, p.meio, p.local_id;
```
> **Importante:** as views e funções **existentes** (`vw_resumo_dia`, `fn_valor_metrica`, `rpc_atualizar_metas`) **continuam** válidas: as **taxas automáticas** são **saídas operacionais** do caixa principal, então **já entram em despesas e lucro** sem alterar essas funções. `corridas` soma `qtd_corridas` de **entradas** (corrida = 1; filhos = 0).

### 8.8 Consultas de diagnóstico e reparo (somente leitura primeiro)
```sql
-- (1) Candidatos a "corrida dividida em vários lançamentos" (mesma ação, mesmo segundo)
select user_id, dia_id, plataforma_id,
       date_trunc('second', criado_em) as criado_seg,
       count(*)                as pedacos,
       sum(valor_centavos)     as total_centavos,
       sum(qtd_corridas)       as corridas_contadas
from public.lancamentos
where tipo = 'entrada' and excluido_em is null and origem = 'manual'
group by user_id, dia_id, plataforma_id, date_trunc('second', criado_em)
having count(*) > 1
order by criado_seg desc;

-- (2) Lançamentos sem local / sem partes (para a classificação do histórico)
select count(*) filter (where tipo = 'entrada' and not modo_partes) as entradas_sem_partes,
       count(*) filter (where tipo in ('saida','ajuste_entrada','ajuste_saida') and local_id is null) as saidas_sem_local
from public.lancamentos where excluido_em is null;
```
> **Atenção — dias fechados:** o banco **bloqueia** alterações em lançamentos de dias fechados (regra do v1). Reparos e classificações que precisem tocar neles devem usar **(a)** uma **função de reparo própria** (restrita ao dono via `auth.uid()`, que habilita uma exceção **somente dentro da própria transação** e **registra na `auditoria`**) **ou (b)** uma **tabela lateral** de classificação (sem alterar a linha original). **Nunca** desativar a proteção para todos. A escolha é apresentada ao dono e registrada em `DECISOES_V2.md`.

> **Reparo opção B (menor risco):** em cada grupo candidato **aprovado**, manter **uma** linha com `qtd_corridas` original e **zerar** `qtd_corridas` das demais. **Antes**: copiar as linhas afetadas para `lancamentos_pre_v2` e gravar `auditoria`. **Opção A:** criar 1 lançamento com partes e **excluir logicamente** os pedaços (também com backup e `auditoria`).

### 8.9 Conferência "antes × depois"
```sql
-- Depois das migrações, TODAS as linhas abaixo devem voltar vazias (exceto correções aprovadas de "corridas")
select a.dia_id from public.v2_snapshot_antes a
join public.vw_resumo_dia r on r.dia_id = a.dia_id
where (a.receita_centavos, a.despesas_centavos, a.reserva_centavos) is distinct from
      (r.receita_centavos, r.despesas_centavos, r.reserva_centavos);

select a.caixa_id from public.v2_snapshot_antes_caixas a
join public.vw_saldo_caixas s on s.caixa_id = a.caixa_id
where a.saldo_centavos is distinct from s.saldo_centavos;
```

---

## 9. Camada de dados e erros (v2)

| Operação | Mecanismo | Observação |
|---|---|---|
| Lançar/editar/excluir corrida | `rpc_lancar_corrida` · `rpc_substituir_corrida` · `rpc_excluir_corrida` | Substituem o caminho antigo **apenas quando a chave `partes` está ligada** |
| Saldos por local | `vw_saldo_locais` | Nunca somar no front |
| Conciliação | `vw_conciliacao` | Alerta se diferença ≠ 0 |
| Transferir entre locais | `rpc_transferir_local` | Taxa opcional |
| Intervalo | `rpc_iniciar_intervalo` · `rpc_encerrar_intervalo` | — |
| Fechar dia (v2) | `rpc_fechar_dia_v2` | Mantém o v1 e acrescenta conferência por local e snapshot |
| Resumo por meio/local | `vw_dia_por_meio` | PDF e fechamento |
| Chaves | `configuracoes.recursos` | Lidas no início da sessão |

**Chaves de cache novas (TanStack Query):** `['locais']` · `['locais','saldos']` · `['conciliacao']` · `['pausas',diaId]` · `['dia',id,'por-meio']` · `['recursos']`. Após toda mutação financeira invalidar também `['locais','saldos']` e `['conciliacao']`.

**Códigos de erro novos → mensagens (pt-BR):**
| Código | Mensagem |
|---|---|
| `PARTES_EXCEDEM_VALOR` | A soma das partes passou do valor da corrida. Ajuste os valores. |
| `PARTES_NAO_FECHAM` | As partes não fecham com o valor da corrida. Confira e tente de novo. |
| `PARTE_INVALIDA` | Informe um valor maior que zero em cada parte. |
| `MEIO_INVALIDO` | Forma de recebimento inválida. |
| `LOCAL_INVALIDO` | Escolha um banco ou local válido. |
| `LOCAL_APP_AUSENTE` | O local "App 99" ainda não foi criado. Ative os locais em Recursos. |
| `RESTO_TIPO_INVALIDO` | Escolha "Pago no app" ou "Cupom". |
| `TAXA_INVALIDA` | A taxa não pode ser maior que o valor da corrida. |
| `QTD_CORRIDAS_INVALIDA` | Quantidade de corridas inválida (use 1 para corrida ou 0 para gorjeta/bônus). |
| `INTERVALO_JA_ABERTO` | Você já está em intervalo. Toque em Retomar. |
| `SEM_INTERVALO_ABERTO` | Não há intervalo em andamento. |
| `SALDO_INSUFICIENTE` | Saldo insuficiente no local de origem. |

---

## 10. Relatório do dia em PDF (especificação)

### 10.1 Princípios
- Gerado **no aparelho** (web e APK), **sem enviar dados** a nenhum servidor.
- **Fácil de entender em 30 segundos:** primeiro os **números grandes**, depois os detalhes.
- **Atraente** (identidade vermelho/laranja/preto) e **amigável à impressão** (fundo branco, pouca tinta).
- **Honesto:** valores com taxa **estimada** aparecem com **"~"** e legenda.

### 10.2 Conteúdo (ordem das seções)
| # | Seção | Conteúdo |
|---|---|---|
| 1 | **Cabeçalho** | Faixa vermelho→laranja, nome do app, "Relatório do dia", **data por extenso**, nome do motorista, cidade, veículo, plataforma (99) |
| 2 | **Resumo em destaque** (cartões grandes) | **Ganho bruto** · **Taxas (99 + maquininha)** · **Despesas** · **Lucro líquido** · **Reserva de manutenção** · **Sobra livre** |
| 3 | **Corridas e tempo** | Nº de corridas · ticket médio · km rodados · **tempo trabalhado líquido** · intervalos (qtd e duração) · **ganho/hora líquido** · **lucro/km** |
| 4 | **Como o dinheiro entrou** | Tabela e **gráfico de barras horizontais** por forma: dinheiro, Pix, débito, crédito, pago no app, cupom (valor e % do total) |
| 5 | **Onde está o dinheiro** | Quadro **Bolso · App 99 · cada banco**: saldo de abertura → entradas → saídas → transferências → **saldo de fechamento** |
| 6 | **Taxas do dia** | Taxa99 (informada/estimada), taxas de maquininha por banco, pacote Taxa Zero (se houver), **taxa efetiva %** |
| 7 | **Despesas por categoria** | Tabela com valor e % (combustível, alimentação, etc.) |
| 8 | **Metas do dia** | Barra de progresso, medalha conquistada (🥉🥈🥇), estrelas ganhas, sequência |
| 9 | **Conferência de caixa** | Calculado × informado × diferença (sobra/falta) por local conferido |
| 10 | **Lançamentos do dia** *(opcional)* | Hora · descrição · forma/local · valor (corridas com partes aparecem **uma vez**, com as partes em subitens) |
| 11 | **Observações** | Texto do dia |
| 12 | **Rodapé** | Data/hora de geração, versão do app, página X de Y, aviso "Valores informados pelo motorista; não substitui comprovantes oficiais" |

### 10.3 Design
| Item | Especificação |
|---|---|
| Página | **A4 retrato**, margens 28 pt, grade de 12 colunas |
| Cores (colorido) | Faixa/títulos `#FF2D2D → #FF7A00`; texto `#111111`; texto auxiliar `#6B6B73`; cartões `#F4F4F6`; positivo `#15803D`; negativo `#D91E1E`; medalhas bronze `#CD7F32`, prata `#9AA3AF`, ouro `#E0A800` |
| Modo econômico | Sem faixa preenchida e sem fundos de cartão; **só linhas e texto preto**; destaques em negrito |
| Tipografia | **Sora** (títulos) e **Inter** (texto) **embutidas** no PDF (garantem acentos); números com algarismos tabulares |
| Tamanhos | Título 22 · seção 13 · cartão-valor 18 (negrito) · corpo 9,5 · rodapé 8 |
| Cartões | 3 por linha, cantos arredondados, rótulo pequeno + valor grande |
| Gráficos | Barras horizontais desenhadas como **vetor** (retângulos), sem imagens pesadas |
| Tabelas | Linhas alternadas suaves, cabeçalho escuro, valores **alinhados à direita** |
| Ícones | Emojis **não** (podem falhar na impressão); usar pequenos símbolos vetoriais ou texto |
| Acessibilidade | Contraste AA; **não depender só de cor** (sinais +/−) |
| Tamanho do arquivo | Normalmente **< 300 KB** |

### 10.4 Tecnologia (decidir na Fase V2.6 com o dono)
| Opção | Prós | Contras |
|---|---|---|
| **A ★ pdfmake** (documento declarativo) | Texto **vetorial**, tabelas e rodapés prontos, fontes embutidas | Biblioteca grande (carregar **sob demanda**) |
| **B @react-pdf/renderer** | Escreve o PDF com componentes React | Curva de aprendizado; fontes manuais |
| **C jsPDF** | Leve e conhecida | Layout manual; tabelas mais trabalhosas |
| **D Tela de impressão HTML** (`window.print`) | Simples e fiel ao design | **Não funciona bem no APK/WebView**; sem arquivo real |

**Regras comuns:** carregar a biblioteca **só ao tocar em "Baixar PDF"** (*lazy loading*); fontes **dentro do projeto** (sem CDN); **não** usar bibliotecas que enviem dados para fora; atualizar a CSP **somente** no necessário (ex.: `blob:`), **sem** abrir exceções amplas.

### 10.5 Comportamento por plataforma
| Ação | Web | APK (Android) |
|---|---|---|
| **Baixar** | Baixa o arquivo | **Salva** com *Filesystem* (pasta do app) |
| **Compartilhar** | Menu de compartilhar do navegador (se houver) ou baixar | **Share** do Android (WhatsApp, e-mail, Drive) com o arquivo |
| **Imprimir** | Abre o PDF numa aba e chama imprimir | Abre o PDF/compartilha para um app de impressão do sistema |
| Observação | — | O `download()` direto **não funciona** no WebView: usar **base64 → Filesystem → Share** |

### 10.6 Critérios de qualidade
- Conteúdo conferido contra o **fechamento** (mesmos números).
- Teste com **dia leve (3 corridas)** e **dia pesado (40 corridas com partes)**: máximo de **3 páginas** com lista completa.
- Acentos corretos em todas as seções; sem texto cortado; datas em pt-BR.
- PDF aprovado pelo dono **olhando um arquivo real**, impresso ou na tela.

---

## 11. Segurança e privacidade (v2)

| Tema | Regra |
|---|---|
| **RLS** | 100% das tabelas novas (`pausas`, `locais_dinheiro`, `locais_transferencias`, `lancamento_partes`, `bancos_catalogo`, tabelas de snapshot/backup) com políticas por `user_id`; teste com **duas contas** |
| **Escrita financeira** | Preferir **RPC** transacional; o banco **valida** (soma das partes, saldo, limites) mesmo se o cliente tentar escrever direto |
| **Sem DELETE** em dados financeiros | Exclusão lógica; locais "removidos" = `ativo = false` |
| **Chaves** | Nenhum segredo novo no cliente; `service_role` **só** em Edge Functions |
| **Scripts externos** | **Nenhum novo** (PDF e fontes empacotados no projeto) |
| **PDF** | Gerado localmente; só sai do aparelho por **ação explícita** de compartilhar; **sem número de conta/agência**; sem metadados pessoais além do nome do motorista |
| **Auditoria** | Reparos e migrações de dados gravam `auditoria` |
| **Backups** | Backup **antes** de cada fase de risco; tabelas `..._pre_v2` protegidas por RLS |
| **LGPD** | O app continua tratando só dados que o próprio usuário digita; **exportar** e **excluir conta** passam a incluir as tabelas novas (inclusive `pausas`, `locais*`, `partes`) |
| **APK** | Sem novas permissões; arquivos do PDF em área **privada** do app (cache) até o dono compartilhar; revisar `AndroidManifest.xml` |
| **Dependências** | `npm audit`; versões **fixas**; sem pacotes recém-publicados (< 14 dias) |
| **CSP/Headers** | Manter política atual; liberar apenas o mínimo (`blob:` para o PDF) |

---

## 12. Testes e não regressão

### 12.1 Regras
1. **Toda a suíte antiga** (unitários, componente, E2E, SQL) deve **continuar passando** em **todas** as fases.
2. **Teste que falha primeiro** para BUG-01 e BUG-02.
3. **Casos numéricos** do Anexo A (v2) e o **Anexo A do PRD v1** (caixa final R$ 380 etc.) rodam em toda fase.
4. **Duas contas** provam isolamento (RLS) nas tabelas novas.

### 12.2 "Foto antes × depois" (golden master)
- Antes de qualquer migração: criar `v2_snapshot_antes` e `v2_snapshot_antes_caixas` (seção 8.1) e **exportar uma cópia em arquivo**.
- Depois de cada migração/fase: rodar as consultas da seção 8.9. **Resultado esperado: vazio.** Diferença só é aceita em **`corridas`** dos grupos de corridas divididas **aprovadas para reparo**.

### 12.3 Casos obrigatórios
| # | Área | Caso | Resultado esperado |
|---|---|---|---|
| 1 | BUG-01 | Meta diária R$ 300; receita R$ 30 | Barra **10%**, texto "R$ 30,00 / R$ 300,00 (10,0%)" |
| 2 | BUG-01 | Receita R$ 0,50 | Preenchimento mínimo visível; "0,2%" |
| 3 | BUG-01 | Semanal e mensal somam dias fechados + dia aberto | Valores corretos nas 3 barras |
| 4 | BUG-01 | Excluir/editar lançamento | Barra atualiza na hora |
| 5 | BUG-01 | Sem meta cadastrada | "Criar meta" sem erro |
| 6 | BUG-02 | Dividir R$ 30 em bolso 8 + Pix 7 + cartão 5 + app 10 | **1 lançamento**, `qtd_corridas = 1`, `corridas = 1` |
| 7 | BUG-02 | Soma das partes ≠ valor | Erro `PARTES_EXCEDEM_VALOR` ou `PARTES_NAO_FECHAM` |
| 8 | BUG-02 | 100% dinheiro (restante 0) | Sem parte no app; Taxa99 (se houver) debita o app |
| 9 | Locais | Saldos do exemplo 1 | Bolso +8,00 · Inter +7,00 · MP +4,90 · App +4,00 |
| 10 | Locais | Conciliação | Σ locais = Σ caixas (após classificar histórico) |
| 11 | Locais | Transferência app → banco com taxa R$ 1 | Origem −V; destino +(V−1); receita inalterada |
| 12 | Taxas | Taxa99 informada R$ 6 | Saída filha "Taxa 99" no App; lucro reduzido em 6 |
| 13 | Taxas | Taxa estimada | Selo "estimada" e "~" no PDF |
| 14 | Taxas | Cartão débito 1,99% em R$ 5 | Taxa R$ 0,10 no banco da parte |
| 15 | Intervalo | Iniciar/encerrar; fechar com intervalo aberto | Tempo líquido correto; encerra automaticamente |
| 16 | Intervalo | Dois intervalos abertos | Erro `INTERVALO_JA_ABERTO` |
| 17 | Fechamento v2 | Anexo A do v1 | **Idêntico** ao v1 |
| 18 | Fechamento v2 | Conferência por local (bolso −R$ 5) | Ajuste no bolso |
| 19 | PDF | Números do PDF = fechamento | Idênticos |
| 20 | PDF | 40 corridas com partes | ≤ 3 páginas; acentos ok |
| 21 | Segurança | Usuário A não vê locais/partes/pausas do B | Nenhuma linha |
| 22 | Segurança | Escrita direta inconsistente em partes | Rejeitada no COMMIT |
| 23 | Migração | Golden master | Consultas 8.9 vazias |
| 24 | Migração | Reparo A e B com backup e desfazer | Reversível |
| 25 | APK | Paridade (Anexo H do v1) + PDF compartilhado | OK no celular real |

---

## 13. Plano de execução — 6 fases de atualização

| Fase | Nome | Entrega principal | Risco |
|---|---|---|---|
| **V2.1** | Auditoria, backup e rede de segurança | Relatório de auditoria, backup, ambiente de testes, chaves liga/desliga, bases de teste (golden master), decisões de negócio da 99 | Baixo (sem mudar comportamento) |
| **V2.2** | Correções rápidas: barras de meta, topo e Intervalo | BUG-01 corrigido; barra do topo; Intervalo; tempo líquido | Baixo/Médio |
| **V2.3** | Locais do dinheiro: bolso, app e bancos | Locais, catálogo de bancos, saldos, transferências, conciliação, classificação do histórico | **Médio** (dados) |
| **V2.4** | Corrida única com pagamento em partes | `lancamento_partes`, `rpc_lancar_corrida`, nova tela, cupom, **reparo do BUG-02** | **Alto** (núcleo financeiro) |
| **V2.5** | Taxas e ganho líquido plausível + fechamento v2 | Taxa99, estimativa, Pacote Taxa Zero, maquininha, indicadores, `rpc_fechar_dia_v2`, conferência por local | **Alto** |
| **V2.6** | Relatório PDF e publicação | PDF (baixar/compartilhar/imprimir), release com plano de volta, APK sincronizado, documentação | Médio |

**Migrações por fase:** V2.1 → `0101` · V2.2 → `0102` · V2.3 → `0103`, `0104`, `0107` + `rpc_inicializar_locais` e `rpc_transferir_local` · V2.4 → `0105`, `0106` (+ `rpc_substituir_corrida`, `rpc_excluir_corrida`) · V2.5 → `0108` (tabela de **pacotes Taxa Zero**, com RLS), funções de indicadores/meta `ganho_liquido` e `rpc_fechar_dia_v2` · V2.6 → nenhuma migração de dados (o PDF só lê).

**Ordem e portões (gates):** cada fase só começa após **SIM** da anterior. **V2.4 e V2.5 exigem backup do dia anterior e prévia aprovada** antes da produção. Dependências: partes (V2.4) exigem locais (V2.3); PDF (V2.6) usa tudo.

---

## 14. Publicação, plano de volta e monitoramento

### 14.1 Passo a passo de publicação (por fase)
1. Tudo verde no **ambiente de testes** (testes + golden master).
2. **Backup** de produção (exportação) e conferência de que abre.
3. Aplicar migrações em **produção** (chaves **desligadas**).
4. Publicar o front em **prévia**; o dono testa o roteiro da fase.
5. **SIM do dono** → publicar em produção; ligar a chave **só para o dono** (ou o único usuário).
6. Observar 24–48 h; registrar em `PROGRESSO_V2.md`.

### 14.2 Plano de volta (por situação)
| Situação | Ação |
|---|---|
| Erro de tela | **Desligar a chave** do recurso (tela "Recursos") |
| Erro após publicar | **Reverter o deploy** para a versão anterior (tag `pre-v2` ou `v2.N-1`) |
| Erro em reparo de dados | **Restaurar** da tabela `..._pre_v2` conforme script de desfazer + `auditoria` |
| Erro grave no banco | Restaurar o **backup** (exportação) em ambiente de testes **primeiro**, depois decidir |
| APK com problema | Reinstalar o APK anterior; republicar versão corrigida com `versionCode` maior |

### 14.3 Monitoramento
Sentry (se existir) sem dados pessoais; checagem diária de `vw_conciliacao`; painel de **inconsistências** (partes que não fecham, locais negativos fora do App, corridas sem partes após ligar a chave).

---

## 15. Riscos e decisões em aberto

### 15.1 Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| Migração mexer em dados reais | Alto | Aditiva + backup + dry-run + golden master + prévia |
| Reparo de corridas divididas errar | Alto | Opção B (zerar contagem) como plano seguro; casos ambíguos revistos **um a um**; desfazer |
| Taxa99 digitada errada ou estimada | Médio | Selo "estimada", comparação aceite × recebido, ajuste fácil |
| Regras da 99 mudarem (taxas, saques, pacote) | Médio | Valores **configuráveis**; nada fixo no código; relatório de pesquisa com data |
| Usuário sem paciência para digitar partes | Médio | Atalhos de 1 toque e tela de 3 toques preservada |
| PDF pesado no celular | Baixo | *Lazy loading*, vetor, sem imagens |
| Conciliação não fecha | Médio | Tela de diferença + classificação do histórico guiada |
| Quebrar o APK | Médio | `android:sync`, paridade e reinstalação de teste |
| Dependência nova com falha de segurança | Médio | `npm audit`, versões fixas, sem pacotes novos de rede |

### 15.2 Decisões em aberto (resolvidas nas entrevistas; padrão indicado)
| ID | Decisão | Padrão (★) | Fase |
|---|---|---|---|
| D-V2-01 | Valor que o dono digita hoje (líquido do aceite × total do recibo) | **Total do recibo** nas corridas novas | V2.1 |
| D-V2-02 | Taxa99: digitar × estimar | **Digitar (opcional)**; estimar só se pedir | V2.1/V2.5 |
| D-V2-03 | Bancos que aparecem | Inter, Mercado Pago, Santander + outros que escolher | V2.3 |
| D-V2-04 | Regra de classificação do histórico | Dinheiro→Bolso; Pix→banco padrão; app→App 99; sem info→Bolso | V2.3 |
| D-V2-05 | Onde fica a reserva de manutenção | Em um banco escolhido | V2.3 |
| D-V2-06 | "Crédito no app" = transferência (recarga) × despesa | **Transferência** | V2.1/V2.3 |
| D-V2-07 | Reparo de corridas divididas: A fundir × B zerar | **B** (menor risco); **A** se o dono preferir | V2.4 |
| D-V2-08 | Restante no app: pago no app × cupom | **Pago no app**, com opção **Cupom** em 1 toque | V2.4 |
| D-V2-09 | Pacote Taxa Zero: cadastrar? | Conforme cidade do dono | V2.1/V2.5 |
| D-V2-10 | Taxas de maquininha por banco | **Valores do contrato do dono** | V2.5 |
| D-V2-11 | Conferência por local no fechamento | **Bolso obrigatório**; app/bancos opcionais | V2.5 |
| D-V2-12 | Biblioteca de PDF | **pdfmake** | V2.6 |
| D-V2-13 | PDF colorido × econômico | Colorido, com opção econômica | V2.6 |
| D-V2-14 | Lista completa de lançamentos no PDF | **Sim** (com opção de ocultar) | V2.6 |
| D-V2-15 | APK já existe e precisa atualizar? | Conforme resposta | V2.1/V2.6 |

---

## 16. Anexos

### Anexo A — Exemplos numéricos de referência (usar nos testes)

**A.1 — Corrida mista com cupom** *(a do relato do dono)*
- Valor da corrida **R$ 30,00** · cupom **R$ 10,00** · Taxa99 **R$ 6,00** (informada).
- Partes: **Bolso R$ 8,00** (dinheiro) · **Inter R$ 7,00** (Pix) · **Mercado Pago R$ 5,00** (débito 1,99%) · **App 99 R$ 10,00** (cupom, restante).
- Taxa de maquininha = round(500 × 1,99%) = **R$ 0,10** (saída no Mercado Pago). Taxa99 = **R$ 6,00** (saída no App 99).
- **Corridas = 1.** Ganho líquido = 30,00 − 6,00 − 0,10 = **R$ 23,90**.
- Saldos movidos: Bolso **+8,00** · Inter **+7,00** · Mercado Pago **+4,90** · App 99 **+4,00** (= 10,00 − 6,00). **Soma = 23,90 ✔**

**A.2 — Corrida 100% dinheiro:** R$ 24,00 · Taxa99 R$ 4,80 → Bolso **+24,00** · App 99 **−4,80** · ganho líquido **R$ 19,20** · corridas 1.

**A.3 — Corrida 100% no app:** R$ 30,00 · Taxa99 R$ 6,00 → App 99 **+24,00** · ganho líquido **R$ 24,00** · corridas 1.

**A.4 — Transferência (saque):** App 99 → Inter, **R$ 100,00**, taxa **R$ 1,00** → App 99 **−100,00** · Inter **+99,00** · receita **inalterada** · "Taxa de saque" R$ 1,00.

**A.5 — Dia completo com v2** *(extensão do Anexo A do v1)*
Abertura **R$ 150,00** (todo no Bolso). Corridas: A.1 + A.2 + A.3 (**3 corridas**, receita bruta **R$ 84,00**, Taxa99 total **R$ 16,80**, maquininha **R$ 0,10**). Despesas: combustível R$ 20,00 (Bolso). 
- **Ganho líquido do dia** = 84,00 − 16,80 − 0,10 − 20,00 = **R$ 47,10**.
- **Locais:** Bolso 150 + 8 + 24 − 20 = **R$ 162,00** · Inter **R$ 7,00** · Mercado Pago **R$ 4,90** · App 99 (10 − 6) + (−4,80) + (30 − 6) = **R$ 23,20**.
- **Total locais** = 162,00 + 7,00 + 4,90 + 23,20 = **R$ 197,10** = **abertura 150,00 + ganho líquido 47,10** ✔ (conciliação).

### Anexo B — Microcopy v2 (pt-BR)
| Contexto | Texto |
|---|---|
| Topo — status | "Dia aberto · {tempo}" · "Em intervalo · {tempo}" |
| Botões | "☕ Intervalo" · "▶ Retomar" · "✔ Fechar dia" · "⏱ Abrir dia" |
| Parte no app | "Restante no App 99 · {valor}" |
| Tipo do restante | "Pago no app" · "Cupom 99" |
| Soma | "Soma fecha: {valor}" · "Faltam {valor} para fechar" · "Passou {valor} do valor da corrida" |
| Corrida | "Corridas: 1" |
| Taxa estimada | "Taxa estimada (~)" |
| Ganho líquido | "Ganho líquido {valor}" |
| App negativo | "O App 99 está negativo em {valor}. A 99 pode exigir recarga ou descontar dos próximos ganhos." |
| Conciliação | "Tudo conferido ✔" · "Diferença de {valor} entre seus locais e seus caixas" |
| Transferir | "Mover dinheiro entre locais" |
| PDF | "Baixar PDF" · "Compartilhar" · "Imprimir" · "Gerando seu relatório…" |
| Sem meta | "Você ainda não tem meta. Criar meta" |
| Reparo | "Encontramos {n} corridas que parecem ter sido divididas em mais de um lançamento. Vamos revisar juntos?" |

### Anexo C — Checklist de publicação da atualização
- [ ] Backup do banco exportado e **testado** (2 cópias).
- [ ] Tag `pre-v2` criada; branch `v2-atualizacao` mesclada somente após SIM.
- [ ] **Suíte antiga** + novos testes passando; lint/typecheck/build ok.
- [ ] Golden master (8.9) **vazio**; conciliação sem diferença.
- [ ] RLS testado com **duas contas** nas tabelas novas.
- [ ] Chaves liga/desliga **funcionando** (testado desligar/ligar).
- [ ] Prévia aprovada pelo dono; roteiro de cada fase executado.
- [ ] PDF real aprovado (colorido e econômico), impresso ou na tela.
- [ ] APK sincronizado e testado em celular real (se existir).
- [ ] `PROGRESSO_V2.md` e `DECISOES_V2.md` atualizados; documentação de "como voltar atrás".

### Anexo D — Glossário da 99 (para o dono e para o agente)
| Termo | Significado |
|---|---|
| **Taxa99** | Valor que a 99 cobra por corrida (aparece no recibo) |
| **Ganho do motorista / Total do motorista** | Valor da corrida menos a Taxa99 |
| **Conta99 / carteira 99** | Carteira digital do motorista dentro do app (onde caem pagamentos feitos no app) |
| **99Pay** | Carteira/conta digital da 99 (passageiros e motoristas) |
| **Pagamento combinado** | Parte em dinheiro e parte via saldo 99Pay |
| **Pacote Taxa Zero** | Pacote pago para rodar com Taxa99 de 0% (por tempo ou por ganhos) |
| **Taxa Garantida** | Teto semanal de taxa (19,99%) anunciado anteriormente; confirmar vigência |
| **Taxa99 devolvida** | Valor cobrado a mais e devolvido (segunda-feira) |
| **Saiba quanto vai ganhar** | Valor líquido mostrado antes de aceitar a corrida |
| **Central de Ganhos** | Tela do app com ganhos, taxas e devoluções |
| **Cupom** | Desconto ao passageiro; a 99 repassa a parte do cupom ao motorista |
| **Cartão99** | Cartão físico ligado à Conta99 |
