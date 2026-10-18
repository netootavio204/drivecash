# Decisões da Atualização v2 — DriveCash

> O agente registra aqui **todas as respostas das entrevistas** e qualquer mudança em relação ao PRD v2. Marque "padrão adotado" quando o dono responder "não sei" ou "você escolhe".

## Decisões em aberto (do PRD v2, seção 15.2)
| ID | Tema | Padrão (★) | Fase | Escolha final |
|---|---|---|---|---|
| D-V2-01 | Valor que o dono digita hoje (líquido do aceite × total do recibo) | Total do recibo nas corridas novas | V2.1 | Total do recibo da corrida (valor total pago pelo passageiro) |
| D-V2-02 | Taxa99: digitar × estimar | Digitar (opcional) | V2.1 / V2.5 | Digitar taxa quando quiser (opcional) |
| D-V2-03 | Bancos que aparecem | Inter, Mercado Pago, Santander + outros | V2.3 | Banco Inter e Mercado Pago no catálogo inicial ativo (editável nas configurações) |
| D-V2-04 | Regra de classificação do histórico | Dinheiro→Bolso; Pix→banco padrão; app→App 99; sem info→Bolso | V2.3 | Não classificar em massa o histórico antigo agora (campos de local nulos no legado) |
| D-V2-05 | Onde fica a reserva de manutenção | Em um banco escolhido | V2.3 | Provável no Mercado Pago (configurável nas opções de locais) |
| D-V2-06 | "Crédito no app": transferência × despesa | Transferência (recarga) | V2.1 / V2.3 | Manter histórico antigo como despesa comum; novas recargas via transferências |
| D-V2-07 | Reparo de corridas divididas (A fundir × B zerar × não reparar) | B (zerar a contagem das extras) | V2.4 | Corrigir corridas novas com partes (1 corrida = 1 lançamento); criar ferramenta de reset seletivo nas configs para recomeço limpo opcional |
| D-V2-08 | Restante no app: pago no app × cupom | Pago no app, cupom em 1 toque | V2.4 | Padrão 'Tudo no app' (99 cobre valor do cupom e retém no saldo do app); suporte a Gorjeta (corridas = 0) |
| D-V2-09 | Pacote Taxa Zero: cadastrar? | Conforme a cidade do dono | V2.1 / V2.5 | Estrutura pronta nas configs; usuário não compra rotineiramente |
| D-V2-10 | Taxas de maquininha por banco | Valores do contrato do dono | V2.5 | Configuração ativa por banco nas Configurações (ex: Mercado Pago padrão configurável) |
| D-V2-11 | Conferência por local no fechamento | Bolso obrigatório; app/bancos opcionais | V2.5 | Bolso obrigatório (se houve dinheiro no dia); App 99 e Bancos opcionais; diferenças geram ajuste automático |
| D-V2-12 | Biblioteca de PDF | pdfmake | V2.6 | _(pendente)_ |
| D-V2-13 | PDF colorido × econômico | Colorido com opção econômica | V2.6 | _(pendente)_ |
| D-V2-14 | Lista completa de lançamentos no PDF | Sim (com opção de ocultar) | V2.6 | _(pendente)_ |
| D-V2-15 | APK já existe e precisa atualizar? | Conforme resposta | V2.1 / V2.6 | Sim, APK já existe e instalado no celular; sincronizar na V2.6 |

## Respostas da entrevista de negócio (V2.1)
| Pergunta | Resposta do dono |
|---|---|
| Cidade e Pacote Taxa Zero (tipo e valor) | Cidade sem taxa municipal; sem taxa zero fixa; lembra de ~10-11%, com dúvidas se é fixa ou dinâmica |
| Modalidades que roda | 99Pop |
| Formas de recebimento (dinheiro, Pix direto, maquininha, app) | Todas as opções: dinheiro em espécie, Pix direto, saldo retido no app (99Pay/cartão no app), maquininha de cartão |
| Bancos e maquininha usados | Pix no Banco Inter; máquina de cartão Mercado Pago (provisório, permitir ajustes futuros) |
| Como saca do app (e taxa) | Repasse automático semanal da 99 toda quarta-feira para a conta do Inter |
| Prioridade das mudanças (1 a 6) | 1º Metas / botões topo -> 2º Saldos (bolso/app/bancos) -> 3º Fim da corrida dupla -> 4º Taxas -> 5º PDF do dia |

## Registro de decisões
| Data | Fase | Decisão | Origem (resposta do dono / padrão adotado) |
|---|---|---|---|
| 2026-10-18 | V2.1 | DriveCash é usado no Site e no APK no celular do motorista | Resposta do dono (Rodada 1) |
| 2026-10-18 | V2.1 | Supabase gratuito atual de produção mantido; ambiente protegido via backups pré-etapas, migrations aditivas e chaves liga/desliga | Resposta do dono e alinhamento de infraestrutura |
| 2026-10-18 | V2.1 | Repositório no GitHub confirmado; tag pre-v2 e branch v2-atualizacao serão criadas | Resposta do dono (Rodada 1) |
| 2026-10-18 | V2.1 | Autorizada leitura de dados reais em modo somente leitura para auditoria (contagem de corridas divididas e locais) | Resposta do dono (Rodada 1) |
| 2026-10-18 | V2.1 | Digita o valor total do recibo; taxa da 99 será campo opcional | Resposta do dono (Rodada 2) |
| 2026-10-18 | V2.1 | Prioridade definida: Metas/topo -> Locais -> Corrida em partes -> Taxas -> PDF | Resposta do dono (Rodada 4) |
| 2026-10-18 | V2.2 | Metas em formato barra horizontal com marcos Bronze (70%), Prata (100%) e Ouro (130%) | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Exibir as 3 barras (Dia, Semana, Mês) compactas na tela Início | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Texto das barras: R$ Atual / R$ Meta com porcentagem e valor que falta pro marco | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Barra de Ações Rápidas (Intervalo e Fechar Dia) fixa no topo da tela | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Botões do topo confortáveis e fáceis de tocar (≥ 48px) | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Tipos de intervalo: Descanso, Refeição, Abastecimento e Outro | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Permitido lançar corrida mesmo em intervalo (com aviso discreto) | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.2 | Lembrete automático de intervalo desligado | Resposta do dono (Fase V2.2) |
| 2026-10-18 | V2.3 | Locais iniciais: Bolso, App 99, Banco Inter e Mercado Pago com saldos de abertura R$ 0,00 | Resposta do dono (Fase V2.3) |
| 2026-10-18 | V2.3 | Histórico antigo não será classificado em massa agora para evitar divergências e garantir 100% de segurança dos dados | Resposta do dono (Fase V2.3) |
| 2026-10-18 | V2.3 | Despesas antigas de 'Crédito no app' mantidas como despesas comuns | Resposta do dono (Fase V2.3) |
| 2026-10-18 | V2.3 | Cartões de saldo visíveis no Início abaixo do Caixa Atual com alerta discreto em vermelho para App 99 negativo | Resposta do dono (Fase V2.3) |
| 2026-10-18 | V2.4 | Padrão de lançamento rápido: 'Tudo no app' | Resposta do dono (Fase V2.4) |
| 2026-10-18 | V2.4 | Cupons da 99: 99 cobre o valor integral no saldo do app; adicionar atalho rápido de Cupom e seção de Gorjeta (com corridas = 0) | Resposta do dono (Fase V2.4) |
| 2026-10-18 | V2.4 | Campo 'Taxa 99 (do recibo)' opcional na tela de entrada | Resposta do dono (Fase V2.4) |
| 2026-10-18 | V2.4 | Histórico de corridas antigas preservado; opção de reset seletivo nas configurações com segurança máxima para recomeço limpo | Resposta do dono (Fase V2.4) |
| 2026-10-18 | V2.5 | Taxa 99 digitada diretamente (sem campo 'Você recebe') quando o motorista quiser olhar o recibo/Central de Ganhos | Resposta do dono (Fase V2.5) |
| 2026-10-18 | V2.5 | Taxa 99 devolvida lançada como entrada no App 99 com categoria devolucoes e qtd_corridas = 0 | Resposta do dono (Fase V2.5) |
| 2026-10-18 | V2.5 | Pacote Taxa Zero mantido como suporte estrutural nas configurações, sem obrigatoriedade de compra | Resposta do dono (Fase V2.5) |
| 2026-10-18 | V2.5 | Transferências e saques rotineiros sem taxa mandatória (saque 1:1) | Resposta do dono (Fase V2.5) |
| 2026-10-18 | V2.5 | Maquininha de cartão configurável por banco nas Configurações (com cálculo automático de desconto na parte) | Resposta do dono (Fase V2.5) |
| 2026-10-18 | V2.5 | Fechamento v2: conferência do Bolso obrigatória (se houve dinheiro em espécie); App 99 e Bancos opcionais; diferenças geram ajuste com motivo | Resposta do dono (Fase V2.5) |

## Mudanças em relação ao PRD v2
| Data | Fase | O que mudou | Motivo |
|---|---|---|---|
| 2026-10-18 | V2.1 | Em vez de exigir um segundo projeto Supabase na nuvem, usaremos o Supabase gratuito do usuário com proteção máxima (backup prévio antes de qualquer migração, chave liga/desliga 0101 e scripts de rollback) | Economia e praticidade para o usuário, mantendo 100% de segurança dos dados |
