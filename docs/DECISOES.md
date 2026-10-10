# Decisões do projeto DriveCash

> O agente registra aqui **todas as respostas das entrevistas** e qualquer mudança em relação ao PRD. Marque "padrão adotado" quando o dono responder "não sei" ou "você escolhe".

## Decisões em aberto (do PRD, seção 16.2) — serão resolvidas nas entrevistas
| # | Tema | Padrão do PRD | Resolvida na fase | Escolha final |
|---|---|---|---|---|
| 1 | Nome do app | DriveCash | 1 | **Meta Driver** |
| 2 | Significado de "Prioridades" | Contas e obrigações em ordem de importância | 2 | **Contas e obrigações a pagar com urgência e vencimento** |
| 3 | Dinheiro físico × saldo no app | Um caixa só | 2 | **Um caixa unificado** (com registro de forma de pagamento) |
| 4 | Quando depositar na manutenção | No fechamento do dia (editável) | 2 e 4 | **Valor fixo editável (padrão R$ 20,00)** no onboarding/fechamento |
| 5 | Níveis das metas | 70% / 100% / 130% | 5 | _(pendente)_ |
| 6 | Dias de folga e sequência | Nenhum | 5 | _(pendente)_ |
| 7 | Identidade visual (logo, ícone) | Proposta na Fase 1 | 1 e 6 | **Logo próprio do dono** (carro + pino de mapa + carteira + gráfico, laranja/vermelho sobre preto) |
| 8 | Quem vai usar (só eu / público) | Multiusuário seguro | 2 e 6 | **Público / Qualquer motorista (multiusuário RLS)** |

## Registro de decisões
| Data | Fase | Decisão | Origem (resposta do dono / padrão adotado) |
|---|---|---|---|
| 2026-10-10 | 1 | Ambiente: Windows, Node v24.12.0, Git 2.52 | verificado pelo agente |
| 2026-10-10 | 1 | Nome do app: **Meta Driver** (`APP_NAME` em `config.ts`) | resposta do dono |
| 2026-10-10 | 1 | Código no GitHub: `https://github.com/netootavio204/drivecash.git` (repositório já existente) | resposta do dono |
| 2026-10-10 | 1 | Brilho e animação: **média** | resposta do dono (★) |
| 2026-10-10 | 1 | Cantos de botões e cartões: **bem arredondados** | resposta do dono (★) |
| 2026-10-10 | 1 | Referência visual: nenhuma (seguir PRD seção 9) | resposta do dono |
| 2026-10-10 | 1 | Logo: imagem enviada pelo dono (usada como logo e base dos ícones) | resposta do dono |
| 2026-10-10 | 1 | Tema: **somente escuro** por enquanto | resposta do dono (★) |
| 2026-10-10 | 1 | Dificuldades relatadas: nenhuma | resposta do dono |
| 2026-10-10 | 2 | Supabase: usuário já possui conta | resposta do dono |
| 2026-10-10 | 2 | Conexão: via chaves de ambiente no `.env.local` | resposta do dono |
| 2026-10-10 | 2 | Público: qualquer motorista (multiusuário isolado via RLS) | resposta do dono |
| 2026-10-10 | 2 | Confirmação de e-mail: desativada em testes locais para agilidade | resposta do dono |
| 2026-10-10 | 2 | Plataformas: padrões pré-cadastrados (Uber, 99, inDrive, Particular, Outros) com permissão para adicionar novas personalizadas | resposta do dono |
| 2026-10-10 | 2 | Categorias de ganhos: padrões pré-cadastrados com opção de adicionar novas | resposta do dono |
| 2026-10-10 | 2 | Categorias de despesas: padrões pré-cadastrados com opção de adicionar novas | resposta do dono |
| 2026-10-10 | 2 | "Crédito no app": classificado como saldo/recarga antecipada para taxas/comissões | resposta do dono |
| 2026-10-10 | 2 | Controle de caixa: unificado (saldo total consolidado) | resposta do dono |
| 2026-10-10 | 2 | Despesas fixas: flexíveis, com suporte a recorrência diária, semanal e mensal | resposta do dono |
| 2026-10-10 | 2 | Veículo ativo: 1 no dia a dia, com suporte no banco para múltiplos | resposta do dono |
| 2026-10-10 | 2 | Prioridades: obrigações financeiras por ordem de urgência e vencimento | resposta do dono |
| 2026-10-10 | 2 | Fuso horário: Brasília (`America/Sao_Paulo`) | resposta do dono |
| 2026-10-10 | 2 | Reserva de manutenção: valor fixo (sugestão R$ 20,00) com valor livremente ajustável | resposta do dono |

## Mudanças em relação ao PRD
| Data | Fase | O que mudou | Motivo |
|---|---|---|---|
| 2026-10-10 | 1 | Nome do app passa de "DriveCash" para **"Meta Driver"** (repositório continua `drivecash`) | escolha do dono |
| 2026-10-10 | 2 | Categorias e Plataformas ganham suporte explícito a itens customizados por motorista (`user_id NULL` para do sistema ou `user_id` para do motorista) | solicitado pelo dono |
| 2026-10-10 | 2 | Prioridades ganha suporte a recorrência diária explícita | solicitado pelo dono |
