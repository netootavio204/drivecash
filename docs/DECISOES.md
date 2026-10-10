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
| 2026-10-10 | 3 | Rotina de lançamento: flexível (corrida a corrida e em lote no fim do dia) | resposta do dono (★) |
| 2026-10-10 | 3 | Turno de madrugada: suporte a virada de meia-noite mantendo a data do dia aberto | resposta do dono (★) |
| 2026-10-10 | 3 | Plataforma preferencial: 99 inicial com memorização da última usada e reordenação | resposta do dono |
| 2026-10-10 | 3 | Valores rápidos em 1 toque: R$ 5, R$ 10, R$ 20, R$ 50 e R$ 100 | resposta do dono (★) |
| 2026-10-10 | 3 | Destaque principal do Início: Caixa Atual com valor em maior destaque | resposta do dono (★) |
| 2026-10-10 | 3 | Km ao abrir o dia: opcional, com opção de pular | resposta do dono (★) |
| 2026-10-10 | 3 | Aviso de caixa negativo: alerta discreto e amigável | resposta do dono (★) |
| 2026-10-10 | 3 | Atalhos de modelos/repetição: digitação direta e limpa, sem modelos por enquanto | resposta do dono |
| 2026-10-10 | 4 | Conferência de dinheiro em mãos: opcional, permitindo pular | resposta do dono (★) |
| 2026-10-10 | 4 | Lote por plataforma: perguntar 'somar ou substituir' caso já haja lançamentos | resposta do dono (★) |
| 2026-10-10 | 4 | Km final e horas no fechamento: sim, ambos opcionais | resposta do dono (★) |
| 2026-10-10 | 4 | Observações do dia: campo de texto livre opcional | resposta do dono (★) |
| 2026-10-10 | 4 | Depósito de manutenção: valor fixo editável (padrão R$ 20,00) | resposta do dono (★) |
| 2026-10-10 | 4 | Pular reserva: livre sem cobrança ou pendência interna | resposta do dono (★) |
| 2026-10-10 | 4 | Meta de manutenção: sim, com valor alvo (padrão R$ 1.500) e barra de progresso | resposta do dono (★) |
| 2026-10-10 | 4 | Gastar manutenção: debita da reserva; se faltar, divide com o caixa principal | resposta do dono (★) |
| 2026-10-10 | 4 | Sugestão de contas iniciais: sim, pré-sugerir contas comuns de motorista | resposta do dono (★) |
| 2026-10-10 | 4 | Recorrências nas contas: diária, semanal, mensal e anual | resposta do dono (★) |
| 2026-10-10 | 4 | Níveis de importância: Alta (🔴), Média (🟡) e Baixa (🟢) | resposta do dono (★) |
| 2026-10-10 | 4 | Pagar conta: debita do Caixa do Dia e agenda a próxima ocorrência se recorrente | resposta do dono (★) |
| 2026-10-10 | 5 | Valores das metas iniciais: Diária R$ 300, Semanal R$ 1.800, Mensal R$ 7.500 (totalmente editáveis) | resposta do dono |
| 2026-10-10 | 5 | Métrica principal das metas: Receita Bruta (total gerado nos apps) | resposta do dono (★) |
| 2026-10-10 | 5 | Níveis das medalhas: padrão 70% (Bronze), 100% (Prata) e 130% (Ouro) | resposta do dono (★) |
| 2026-10-10 | 5 | Dias de folga fixos: nenhum fixo (flexível, ritmo livre) | resposta do dono (★) |
| 2026-10-10 | 5 | Estilo das medalhas: Neon/Tecnológico com brilho | resposta do dono (★) |
| 2026-10-10 | 5 | Confetes e serpentina: intensidade média equilibrada | resposta do dono (★) |
| 2026-10-10 | 5 | Efeito sonoro: desligado por padrão, com chave para ligar/desligar | resposta do dono (★) |
| 2026-10-10 | 5 | Nomes das fases: Aprendiz, Estradeiro, Profissional, Veterano, Mestre do Volante, Elite, Lenda | resposta do dono (★) |
| 2026-10-10 | 5 | Catálogo de conquistas: manter todas as 22 conquistas padrão do Anexo C | resposta do dono (★) |
| 2026-10-10 | 5 | Meta mínima sugerida pelas contas: ativada com botão 'Usar como meta diária' | resposta do dono (★) |
| 2026-10-10 | 5 | Dias de trabalho por semana: 6 dias | resposta do dono (★) |
| 2026-10-10 | 5 | Sem dúvidas ou impedimentos | resposta do dono |

## Mudanças em relação ao PRD

| Data | Fase | O que mudou | Motivo |
|---|---|---|---|
| 2026-10-10 | 1 | Nome do app passa de "DriveCash" para **"Meta Driver"** (repositório continua `drivecash`) | escolha do dono |
| 2026-10-10 | 2 | Categorias e Plataformas ganham suporte explícito a itens customizados por motorista (`user_id NULL` para do sistema ou `user_id` para do motorista) | solicitado pelo dono |
| 2026-10-10 | 2 | Prioridades ganha suporte a recorrência diária explícita | solicitado pelo dono |
