# Relatório de pesquisa — Como a 99 paga o motorista (taxas, cupons e pagamentos mistos)

> **Data da pesquisa:** 17/10/2026 · **Objetivo:** servir de base para o gerenciador **DriveCash** calcular um **ganho plausível** quando o passageiro usa cupom e paga de várias formas (Pix, crédito, débito e dinheiro).
> **Aviso importante:** a 99 muda regras com frequência e **não publica uma tabela nacional de taxas**. Tudo aqui deve ser **conferido no seu app de motorista** (Central de Ganhos, recibo e tela de aceite). Este relatório **não é consultoria jurídica, contábil nem tributária**.

---

## 1. Resumo executivo (o que você precisa saber)

1. **A taxa da 99 não é um percentual fixo.** A própria 99 mostra o **valor líquido que você recebe antes de aceitar** a corrida, e o percentual da **"Taxa99"** aparece no **recibo** de cada corrida. Nos recibos que encontrei, a Taxa99 variou de cerca de **3%** (R$ 1,80 numa corrida de R$ 58,20) a cerca de **23%** (R$ 7,60 numa corrida de R$ 32,60). **Conclusão: o app deve registrar o valor real da taxa de cada corrida, e usar percentual estimado só como plano B.**
2. **Cupom de desconto não reduz o seu ganho (regra oficial).** A central de ajuda da 99 diz que o motorista **sempre recebe o valor cheio da corrida**, e que, **mesmo se o passageiro pagar em dinheiro, a parte referente ao cupom é transferida para a conta do motorista** (na carteira digital 99). Há **reclamações antigas** de motoristas dizendo que, em alguns casos, o desconto foi para o bolso do motorista; por isso a recomendação é **conferir cada recibo**.
3. **Dinheiro físico:** o motorista **fica com todo o valor** da corrida e a 99 **desconta só a Taxa99 do saldo do app** (a carteira do motorista). Por isso o **saldo do app pode ficar negativo** depois de várias corridas em dinheiro.
4. **Pagamentos feitos dentro do app** (cartão cadastrado, Pix pelo app, saldo 99Pay, voucher) **caem na carteira do motorista (Conta99)**, já sem a Taxa99.
5. **Pix:** quando o passageiro paga Pix **pelo app**, o dinheiro vai **para a 99**, não para a chave Pix do motorista (a 99 até alerta o passageiro para **não** pagar na chave do motorista). Se o passageiro fizer Pix **direto para você**, isso acontece **fora do fluxo do app** (na prática, equivale a "dinheiro" para a 99).
6. **Maquininha própria:** a 99 permite que o passageiro pague com **cartão na maquininha do motorista**. Nesse caso as **taxas da maquininha** (Mercado Pago, Getnet/Santander, Inter etc.) **são suas** e devem entrar no cálculo do ganho.
7. **Pagamento combinado:** a 99 tem o recurso **"Pagamento Combinado"** (parte em dinheiro físico e parte via saldo 99Pay). É o cenário típico de **cupom + dinheiro**.
8. **Taxa Zero por pacote (2026):** em várias cidades (inclusive **cidades do interior de SP**: Bauru, Botucatu, Bragança Paulista, Marília, São José do Rio Preto e outras) a 99 passou a exigir **compra de pacote** para receber chamadas de 99Pop e afins. Com o pacote, a taxa é **0%**, mas o **pacote é um custo** que precisa entrar nas contas.
9. **Saques:** os ganhos ficam na Conta99; há **transferência automática semanal gratuita** e, segundo fontes de 2026, **saque manual pode custar R$ 1,00**. As regras mudaram ao longo dos anos.
10. **Intervalo:** o app da 99 tem um **intervalo obrigatório após certo tempo online** (a 99 menciona isso, mas **não encontrei o número de horas**). O botão **Intervalo** do gerenciador serve para **descontar as pausas do seu tempo de trabalho** e calcular **ganho por hora líquido**.

**O que isso muda no DriveCash:** (a) cada corrida é **uma só** e o dinheiro dela é **dividido em partes** (bolso, bancos, app); (b) **uma parte fica sempre no app** (o restante, que pode ser cupom ou pagamento no app); (c) **Taxa99** e **taxa de maquininha** viram **despesas automáticas** ligadas à corrida; (d) os saldos passam a ser mostrados por **local do dinheiro** (bolso, app e cada banco).

---

## 2. Como a 99 paga e cobra o motorista

### 2.1 Valor antes do aceite e recibo
- A 99 informa que os **ganhos são fixos**: o valor mostrado **antes de aceitar** é o valor que o motorista recebe no fim (com exceções, como **mudança de destino, parada extra ou rota muito diferente** da estimada). *(Fonte: página oficial de ganhos da 99 e recurso "Saiba quanto vai ganhar".)*
- O **recibo** da corrida (visão do passageiro) mostra: **Valor da corrida**, **Método de pagamento**, **Ganhos do motorista ("Total do motorista")** e **Ganhos da 99 ("Taxa99")**. Pode haver ainda **Taxa de cancelamento**.
- **Exemplos reais de recibos públicos (99Pop):**

| Corrida | Valor da corrida | Total do motorista | Taxa99 | Taxa99 em % |
|---|---|---|---|---|
| 51 min · 33,4 km (fev/2024) | R$ 58,20 | R$ 56,40 | R$ 1,80 | ≈ 3,1% |
| 30 min · 11,1 km (nov/2024) | R$ 32,60 | R$ 25,00 | R$ 7,60 | ≈ 23,3% |

→ **A mesma plataforma, no mesmo ano, cobrou percentuais muito diferentes.** Não existe um "% padrão" confiável.

### 2.2 Como a Taxa99 foi comunicada ao longo do tempo
| Tema | O que a 99 comunicou | Situação / confiança |
|---|---|---|
| **Taxa Garantida 99** | Teto semanal de **19,99%** para quem faz **10+ corridas na semana**; excedente **devolvido na segunda-feira** | Divulgada em 2022–2024. Em 2026 fontes tratam como **referência histórica**, não como taxa nacional vigente. **Confirmar no app.** |
| **Taxa Zero (dias/horários)** | Em dias e horários específicos, **100%** da corrida para o motorista | Programa antigo; em 2026 foi **substituído por pacotes** em várias cidades |
| **Taxa Reduzida** | Teto máximo de taxa em dias específicos | Condições variam por cidade |
| **Pacote Taxa Zero (2026)** | **Compra obrigatória** de pacote para receber 99Pop, 99Pop Expresso, 99Negocia, 99Plus e 99electric-Pro nas cidades participantes | **Confirmado na página oficial da 99.** Valores variam por cidade |
| **Recibo** | Mostra o aviso **"Taxa99 semanal de 0% garantida"** e, depois, **"Taxa99 devolvida"** | Confirmado (oficial) |

### 2.3 Pacote Taxa Zero (detalhes oficiais)
- **Tipos:** (1) **por tempo** (diário ou 3 dias): taxa zero durante todo o período, **sem limite de ganhos**; (2) **por ganhos**: taxa zero **até atingir o valor de ganhos do pacote**, em até **180 dias**.
- **Contagem de tempo:** o pacote por tempo **continua contando mesmo se você não estiver online** (inclusive durante o intervalo).
- **Não cancela, não pausa e não reembolsa** depois de comprado.
- **Renovação automática** no pacote diário (24 h) se você não escolher outro (dá para desativar nas configurações do app).
- **Pagamento do pacote:** segundo a imprensa, é feito **com o saldo da carteira 99** (o gerenciador deve tratar como **despesa paga a partir do app**).
- **Taxa99 semanal 0%:** se a 99 cobrar comissão durante a semana, **o valor a mais é devolvido toda segunda-feira, a partir das 7h**.
- **Valor pago pelo passageiro menor que o seu ganho:** o recibo mostra o total pago de forma simplificada; **quando é menor que o seu ganho, a 99 paga a diferença**.
- **Cidades participantes (lista da página oficial, consultada em 17/10/2026):** Bauru, Boa Vista, Botucatu, Bragança Paulista, Campina Grande, Cascavel (PR), Caxias do Sul, Criciúma, Feira de Santana, Imperatriz, Juiz de Fora, Londrina, Macaé, Marília, Maringá, Palmas (TO), Ponta Grossa, Porto Velho, Rondonópolis, São José do Rio Preto, Serrana, Teresina, Uberaba, Umuarama e Vitória da Conquista. *(A lista muda; confirme a sua cidade no app. Notícias de junho/2026 citavam 20 cidades, com lista diferente.)*
- **Preços:** a página oficial **não publica valores** ("consulte o seu app"). Uma fonte secundária cita **R$ 29,99/dia** e **R$ 199/semana**, mas **isso não foi confirmado oficialmente**; **use o valor que aparece no seu app**.
- **Quem não compra pacote** (nas cidades participantes) deixa de receber chamadas das categorias acima, mas pode rodar **99Entrega** com a taxa regular.

### 2.4 Outras linhas de ganho que podem aparecer
- **Taxa de cancelamento** (recebida quando o passageiro cancela após certo ponto ou quando o motorista já está esperando) — proporcional a tempo e distância.
- **Taxa de congestionamento** (anunciada em 2021 para trânsito parado/muito lento).
- **Adicional variável de combustível** (2022) — aparece como linha própria no recibo.
- **Incentivos e bônus** (Completa 99, Acelera 99, Multiplica 99, Corra e Ganhe, Deslocamento Bônus etc.) — variam por cidade e período.
- **Proteção anticalote / reembolso:** se o passageiro não pagar, o motorista pode pedir **reembolso pelo app** (em material de 2021–2022 o limite era **R$ 50 por corrida**; **confirmar** se continua valendo).
- **Troco pelo app:** se o passageiro paga a mais em dinheiro, o troco pode ser **transferido da carteira do motorista para a do passageiro** (exige **saldo positivo** suficiente).

---

## 3. Formas de pagamento do passageiro: onde o dinheiro cai

| # | Como o passageiro paga | Onde o dinheiro chega ao motorista | Taxa99 | Outras taxas | Observação |
|---|---|---|---|---|---|
| 1 | **Cartão de crédito/débito cadastrado no app** | **Conta99 (app)**, automaticamente | Já descontada | — | Cai no app; depois você saca |
| 2 | **Pix pelo app** | **Conta99 (app)** | Já descontada | — | O Pix vai para a 99, não para a sua chave |
| 3 | **Saldo 99Pay / voucher** | **Conta99 (app)** | Já descontada | — | — |
| 4 | **Dinheiro físico** | **Bolso** (você fica com tudo) | **Debitada do saldo do app** | — | Pode deixar o app negativo |
| 5 | **Pix direto na sua chave** (fora do app) | **Seu banco** (Inter, Mercado Pago, Santander…) | Debitada do saldo do app (corrida marcada como dinheiro) *(inferência; confirmar no seu app)* | Pix costuma ser grátis para recebedor pessoa física | A 99 **desaconselha** esse caminho |
| 6 | **Cartão na maquininha do motorista** | **Banco da maquininha** (ex.: Mercado Pago, Getnet/Santander) | Debitada do saldo do app (corrida marcada como dinheiro) *(inferência; confirmar)* | **Taxa da maquininha** (ver seção 6) e prazo de recebimento | Corrida deve estar marcada como dinheiro |
| 7 | **Pagamento combinado** (dinheiro + saldo 99Pay) | Parte no **bolso**, parte no **app** | Debitada do app | — | Recurso oficial da 99 |
| 8 | **Cupom de desconto** | **Parte do cupom vai para o app** (99 paga) | Debitada do app | — | Mesmo se o resto foi em dinheiro |
| 9 | **Dinheiro + Pix direto + cartão + cupom** (misto) | Cada parte no seu lugar | Debitada do app | Taxa da maquininha na parte do cartão | **É o caso que o gerenciador precisa dividir** |

> **Regra de ouro para o gerenciador:** a **corrida é uma só**. Dividimos apenas **o valor**, em **partes por local**, e **o restante fica sempre no app**.

---

## 4. Cupons de desconto — como funciona e como lançar

**Regra oficial (central de ajuda da 99):** o motorista **sempre recebe o valor cheio da corrida**, independentemente de qualquer desconto; **mesmo com pagamento em dinheiro**, a parte do cupom **é transferida para a carteira do motorista**.

**Exemplo (corrida de R$ 30,00 com cupom de R$ 10,00):**
- Passageiro paga **R$ 20,00** (por exemplo, R$ 8 em dinheiro + R$ 7 em Pix + R$ 5 em cartão na sua maquininha).
- A 99 paga **R$ 10,00** (parte do cupom) → **cai no app**.
- A **Taxa99** (digamos R$ 6,00) é **descontada do app**.

**Cuidados (por que conferir sempre):**
- Há **relatos de motoristas** (Reclame Aqui, 2021–2023) de corridas em que o valor recebido ficou **menor** que o mostrado, associando isso a desconto ao passageiro. A empresa respondeu citando "mau uso do aplicativo" em um caso e remeteu à conferência no app em outro. **Não é possível afirmar que isso ocorre hoje**, mas é motivo para **comparar o valor da tela de aceite com o que entrou**.
- O gerenciador deve permitir **marcar a parte do cupom** (para você auditar se o valor chegou ao app).

---

## 5. Saques, transferências e prazos (Conta99)

| Tema | O que foi encontrado | Confiança |
|---|---|---|
| **Entrada dos ganhos no app** | Em 2023 a 99 informou que os ganhos do dia entravam na Conta99 **todos os dias às 23h59**; materiais de 2026 citam **recebimento em até 20 minutos** com o Cartão99 | Média (muda) |
| **Transferência automática para o banco** | Resposta da 99 em 2026: transferência automática **gratuita toda quarta-feira** | Média |
| **Saque manual sob demanda** | Fontes de 2026 citam **R$ 1,00** por transferência manual para outra conta bancária | Média |
| **Regra antiga** | Material antigo: **1 transferência Pix grátis por semana** e **R$ 5,00** a partir da segunda | Baixa (histórico) |
| **Pix com saldo da 99Pay** | Gratuito (a taxa de cartão só existe em Pix parcelado) | Média |
| **Cartão99** | Cartão físico ligado à Conta99, sem tarifa/anuidade segundo a 99 | Média |

→ **No gerenciador:** transferência **app → banco** é um **movimento entre locais** (o dinheiro continua seu), com **taxa opcional** (ex.: R$ 1,00). O saque **não é receita**.

---

## 6. Maquininha e bancos (para a parte "cartão")

Dados de **tabelas públicas de 2026** (promoções e faixas por faturamento mudam; **use as taxas do SEU contrato**):

| Maquininha | Débito | Crédito à vista | Recebimento | Observação |
|---|---|---|---|---|
| **Mercado Pago (Point)** | de ~0,74% (promoção) a **1,99%** | de ~0,74% (promoção) a **4,98%** (na hora); 3,79% (14 dias) e 3,03% (30 dias) | Na hora, 14 ou 30 dias | Taxa cai com o faturamento; Pix em QR pode ter 0%–0,99% |
| **Getnet (Santander)** | **0,95%–1,89%** | **~2,95%–3,79%** | **D+1 a D+2** | Plano PF: ~1,39% / 3,49% |
| **Inter** | *não consegui confirmar uma tabela pública oficial nesta pesquisa* | — | — | **Informe as taxas do seu contrato** |

→ **No gerenciador:** cada **banco/local** terá **taxa de débito, crédito e Pix (%)** e **prazo de recebimento**, **preenchidos por você**. O app calcula a **taxa da maquininha** da parte do cartão e lança como **despesa automática**.

---

## 7. Intervalo e tempo de trabalho

- O **app da 99** possui **intervalo obrigatório** após um limite de horas online (mencionado no FAQ oficial do Pacote Taxa Zero; **o número de horas não foi encontrado**).
- As regras de **jornada e descanso da "Lei do Motorista"** (ex.: 30 min a cada 4–5,5 h de direção) valem para **motoristas profissionais empregados** (CLT) e **não foram feitas para autônomos de aplicativo**. Mesmo assim, **pausas regulares são recomendadas por segurança**.
- **No gerenciador:** o botão **Intervalo** registra **início e fim** de cada pausa, desconta do **tempo de trabalho** e alimenta **ganho por hora líquido**. (Se o seu pacote Taxa Zero for por tempo, lembre que ele **continua contando durante o intervalo**.)

---

## 8. Como isso vira regra do aplicativo (modelo recomendado)

### 8.1 Conceitos
- **Valor da corrida (cheio):** o que consta no recibo como **"Valor da corrida"** (inclui a parte do cupom).
- **Taxa99:** valor cobrado pela 99 (do recibo ou da tela de aceite). Registrada como **despesa automática** (categoria **"Taxa 99"**), **paga pelo app**.
- **Partes de recebimento:** divisão do valor cheio entre **locais**: **Bolso**, **bancos** (Pix direto/maquininha) e **App 99** (cupom ou pago no app). **A soma das partes = valor cheio.**
- **Taxa de maquininha/meio:** para partes em cartão (e, se houver, Pix), taxa % do banco escolhido → **despesa automática** (categoria **"Taxa de maquininha"**), **paga pelo banco**.
- **Ganho líquido da corrida** = **valor cheio − Taxa99 − taxa de maquininha**.
- **Saldos por local** = saldo inicial + partes recebidas − despesas pagas naquele local + transferências recebidas − transferências enviadas.

### 8.2 Exemplo 1 — corrida mista com cupom (a do seu relato)
**Corrida: R$ 30,00 · cupom R$ 10,00 · Taxa99 R$ 6,00 · cartão na maquininha do Mercado Pago a 1,99% (débito)**

| Parte | Local | Valor |
|---|---|---|
| Dinheiro | **Bolso** | R$ 8,00 |
| Pix direto | **Inter** | R$ 7,00 |
| Cartão (débito) | **Mercado Pago** | R$ 5,00 |
| **Restante (cupom 99)** | **App 99** | **R$ 10,00** |
| **Soma** | | **R$ 30,00** ✔ |

- **Corridas contadas: 1** (e não 4).
- Taxa de maquininha: 1,99% × R$ 5,00 = **R$ 0,10** (despesa no Mercado Pago).
- Taxa99: **R$ 6,00** (despesa no App 99).
- **Saldos movidos:** Bolso **+8,00** · Inter **+7,00** · Mercado Pago **+5,00 − 0,10 = +4,90** · App 99 **+10,00 − 6,00 = +4,00**.
- **Ganho líquido:** 30,00 − 6,00 − 0,10 = **R$ 23,90** (= 8,00 + 7,00 + 4,90 + 4,00 ✔).

### 8.3 Exemplo 2 — corrida 100% dinheiro
**R$ 24,00 · Taxa99 R$ 4,80**
- Bolso **+24,00** · App 99 **−4,80** (saldo do app pode ficar negativo).
- **Ganho líquido: R$ 19,20.**

### 8.4 Exemplo 3 — corrida 100% no app (cartão do passageiro)
**R$ 30,00 · Taxa99 R$ 6,00**
- App 99 **+30,00 − 6,00 = +24,00** · Bolso e bancos **0**.
- **Ganho líquido: R$ 24,00.**

### 8.5 Exemplo 4 — pacote Taxa Zero
- Pacote diário comprado por **R$ X** (valor do seu app) → **despesa** paga pelo **App 99** (distribuída no dia ou na vigência).
- Corridas com **Taxa99 = 0**; se houver **"Taxa99 devolvida"** na segunda-feira, registrar como **receita "Devolução de taxa 99"** no **App 99**.

---

## 9. Grau de confiança das afirmações

| Afirmação | Fonte principal | Confiança | Como conferir |
|---|---|---|---|
| 99 não publica % fixo; mostra líquido antes do aceite; Taxa99 no recibo | Página oficial de ganhos da 99 e análises de 2026 | **Alta** | Tela de aceite e recibo |
| Motorista recebe valor cheio mesmo com cupom; cupom em dinheiro vai para a conta | Central de ajuda oficial da 99 (≈ 2025) | **Alta** (oficial), com **ressalvas** de relatos antigos | Comparar aceite × ganho |
| Dinheiro: motorista fica com tudo e 99 debita só a Taxa99 do saldo do app | Comunicado oficial da 99 (2023) | **Alta** | Extrato da Conta99 |
| Pix pelo app vai para a 99, não para a chave do motorista | Reportagem (Exame) citando a 99 | **Alta** | Orientação oficial |
| Pacote Taxa Zero obrigatório em cidades listadas | Página oficial da 99 (2026) | **Alta** | App, tela "Taxa Zero" |
| Preço do pacote (R$ 29,99/dia; R$ 199/semana) | Fonte secundária | **Baixa** | **Valor no seu app** |
| Taxa Garantida 19,99% semanal | Imprensa (2022–2024) | **Média/histórica** | Central de Ganhos |
| Saque manual R$ 1,00; automático toda quarta | Respostas da 99 no Reclame Aqui e blog (2026) | **Média** | App, tela de saque |
| Taxas de maquininha | Tabelas públicas de 2026 | **Média** (variam por contrato) | **Seu contrato** |
| Pix direto/maquininha "equivale a dinheiro" para a 99 (Taxa99 debitada do saldo) | **Inferência** a partir das regras de pagamento em dinheiro | **Baixa/Média** | Teste com 1–2 corridas e extrato |
| Número de horas do intervalo obrigatório | Não encontrado | **Desconhecido** | Aviso no app |

---

## 10. O que ainda precisa ser confirmado com você (perguntas para as entrevistas)

1. **Cidade** onde você roda e se ela está na lista do **Pacote Taxa Zero** (e qual pacote você compra).
2. **Modalidades** (99Pop, Pop Expresso, Negocia, Plus, Entrega).
3. **Qual valor você digita hoje:** o **líquido** do aceite ou o **total do recibo**?
4. Se você consegue ver a **Taxa99** de cada corrida (recibo/Central de Ganhos) e se quer **digitar** ou **estimar**.
5. **Bancos/contas** que usa (Inter, Mercado Pago, Santander, outros) e **qual maquininha** (com as taxas do seu contrato).
6. Como você trata o **"Crédito no app"**: é **recarga para cobrir taxa** (movimento entre locais) ou despesa?
7. Como e quando você **saca** do app (automático quarta-feira ou manual) e se paga taxa.
8. Se, quando o **Pix cai direto na sua chave**, a corrida fica marcada como **dinheiro** no app.

---

## 11. Fontes consultadas (17/10/2026)

**Oficiais da 99**
- Pacote Taxa Zero (motoristas): https://motoristas.99app.com/pacote-taxa-zero-drv-4w/
- Ganhos dos motoristas parceiros: https://99app.com/motorista/ganhos/
- Ajuda — "O motorista perde dinheiro quando o passageiro usa desconto?": https://99app.com/ajuda/motorista/o-motorista-perde-dinheiro-quando-o-passageiro-usa-desconto/
- Conta99: https://99app.com/motorista/conta-99/
- Pagamento em dinheiro / formas de pagamento (passageiro): https://99app.com/passageiro/pagamento-em-dinheiro/
- Blog 99 — formas de pagamento para o motorista: https://99app.com/blog/motorista/motorista-99-nao-fique-sem-receber-pela-viagem/
- 99Pay (dúvidas): https://99app.com/99pay/duvidas-frequentes/
- Central de ajuda do motorista: https://99app.com/ajuda/motorista/

**Imprensa e análises**
- Exame — 99 aceita Pix (pagamento vai para o app): https://exame.com/tecnologia/99-passa-a-aceitar-pagamento-de-corridas-com-pix/
- Diário do Nordeste — pacote taxa zero (jun/2026): https://diariodonordeste.verdesmares.com.br/ultima-hora/automovel/99-segue-uber-e-anuncia-pacote-que-zera-cobranca-de-tarifa-a-motoristas-veja-cidades-1.3769399
- Canaltech — Taxa Garantida 19,99%: https://canaltech.com.br/apps/99-vai-reembolsar-motoristas-taxados-em-mais-de-1999-227656/
- Garagem360 — Taxa Garantida (Central de Ganhos): https://garagem360.com.br/?p=184118
- Mobile Time — programa de ganhos 99 (taxa de cancelamento, congestionamento): https://www.mobiletime.com.br/noticias/01/10/2021/99-aumenta-ganho-de-motoristas-entre-10-e-25/
- Vida de Motorista — comparativo de taxas 2026: https://vidademotorista.com.br/apps-transporte-comparativo/
- Tecnoblog — como funciona a 99Pay: https://tecnoblog.net/responde/o-que-e-a-99pay-e-como-ela-funciona/
- Rota do Motorista — 99Pay para motorista (2026): https://rotadomotorista.pro/99pay-vale-a-pena-motorista/
- Comunicado 99 sobre pagamento em dinheiro e Conta99 (2023): https://www.ocimar.com/saiba-como-os-motoristas-recebem-os-ganhos-com-as-corridas-na-99/

**Recibos reais públicos (exemplos de Taxa99)**
- https://www.camara.leg.br/cota-parlamentar/documentos/publ/2235/2024/7697094.pdf
- https://www.camara.leg.br/cota-parlamentar/documentos/publ/3609/2024/7843767.pdf

**Relatos de motoristas (anedóticos)**
- Reclame Aqui — descontos ao passageiro e valor recebido; saque via Pix: https://www.reclameaqui.com.br/99taxis/ e https://www.reclameaqui.com.br/99pay/

**Maquininhas (tabelas de 2026)**
- https://jota.ai/blog/arquivo/taxas-maquininha-mercadopago-2026/ · https://www.maquinatop.com.br/maquininha/getnet · https://maquininhareview.com.br/taxas/ · https://www.infinitepay.io/blog/maquininha-de-cartao-menor-taxa
