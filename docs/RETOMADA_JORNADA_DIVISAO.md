# Memória de Contexto & Plano de Retomada: Jornada e Divisão de Ganhos

**Palavra-chave de Retomada:** `RETOMAR-MOTORISTA` (ou apenas `RETOMAR`)  
**Data do Registro:** 16/10/2026  
**Status:** ✅ **CONCLUÍDO E SINCRONIZADO COM SUCESSO** (Web e APK validados com zero erros).

---

## 1. Contexto Geral Levantado

O motorista identificou necessidades práticas fundamentais da rotina real de rua:

### A. Jornada de Trabalho (Abrir Dia / Intervalos / Fechar Dia)
1. **Controle de Pausas e Intervalos**:
   - Possibilidade de pausar a jornada (almoço, café, descanso, abastecimento) sem fechar o dia em definitivo.
   - Poder registrar múltiplos intervalos durante o dia e registrar a retomada do trabalho.
2. **Abertura Retroativa / Registro Fora de Hora**:
   - Se o motorista esquecer de abrir o dia de manhã e trabalhar, poder abrir com a data/hora retroativa ou registrar as corridas e despesas sem que o sistema trave ou gere inconsistências.

### B. Tela "Adicionar Corrida / Entrada" (EntradaRapidaSheet)
1. **Data Automática & Manual**:
   - Padrão: dia atual (automático).
   - Editável: permitir selecionar outra data para lançamentos retroativos.
2. **Horário Automático & Manual**:
   - Padrão: hora atual (automático).
   - Editável: campo de horário que pode ser ajustado manualmente se necessário.
3. **Input de KM da Corrida (KM Produtivo vs Deslocamento / Pessoal)**:
   - Campo para informar a quilometragem da corrida específica (ex: 7,5 km).
   - Resolve o problema de cálculo distorcido de R$/KM: diferencia os quilômetros em que havia passageiro a bordo dos quilômetros de deslocamento sem corrida ou viagens pessoais particulares durante o dia.
4. **Divisão de Ganhos em Múltiplos Destinos na Mesma Corrida (Caso Real da 99 / Apps)**:
   - Exemplo clássico da 99: Corrida com valor bruto de R$ 12,00. O passageiro pagou R$ 6,00 direto ao motorista (dinheiro no bolso, Pix na conta ou maquininha), e os outros R$ 6,00 ficaram retidos no saldo do app 99.
   - O motorista precisa de botões para indicar para onde foi o dinheiro e quanto foi para cada destino:
     - **Bolso** (Dinheiro em espécie)
     - **Pix** (Conta bancária: Inter, Mercado Pago, etc.)
     - **Cartão Débito / Crédito** (Maquininha)
     - **Saldo no App** (99, Uber, etc.)
5. **Ciclo de Repasse Semanal do Saldo Retido no App**:
   - O valor retido no aplicativo acumula ao longo dos dias e é repassado semanalmente para a conta bancária em dia configurável/editável.

---

## 2. Entrevista / Alinhamento de Decisões

### Questão 1: Na divisão de valor da corrida, como você prefere a interface?
- **Opção A (Calculadora Inteligente - Recomendada)**: Você informa o valor total da corrida (ex: R$ 12,00). O sistema joga para o app por padrão. Se o passageiro te pagou parte em dinheiro/pix/cartão, você clica no botão correspondente, digita o valor (ex: R$ 6,00) e o sistema já calcula automaticamente o restante no app.
- **Opção B (Dois campos independentes)**: "Recebido do Passageiro" (com botões Bolso/Pix/Cartão) e "Retido no App 99".

### Questão 2: Sobre as Contas Bancárias / Destinos
- **Opção A (Categorias Gerais com Sub-identificação)**: Botões diretos para [Bolso / Dinheiro], [Pix], [Cartão Débito/Crédito], [Saldo App 99].
- **Opção B (Vários Caixas Específicos)**: Criar caixas individuais cadastrados como bancos (ex: Banco Inter, Mercado Pago, Bolso, Carteira 99).

### Questão 3: Campo de KM da Corrida
- **Opção A (Opcional na tela rápida com atalho)**: Campo de KM visível diretamente na tela de entrada rápida (com valor numérico decimal, ex: 8.5 km), opcional para quem quiser registrar a métrica com precisão.
- **Opção B (Obrigatório sempre que registrar corrida)**.

### Questão 4: Intervalos do Dia de Trabalho
- **Opção A (Botão Pausar / Retomar)**: No card do dia em andamento, ter botão "Pausar Dia" (inicia intervalo) e "Retomar Rodagem" (encerra intervalo).
- **Opção B (Registro ao fechar)**: Informar o tempo total parado de intervalo no fechamento do dia.

---

## 3. Diretriz de Segurança Técnica
- **Banco de Dados (Supabase)**: A coluna `km` e `ocorrido_em` já existem na tabela `lancamentos`. O que faremos preserva 100% da integridade existente sem deletar nem resetar nada.
- **Sincronia Dupla**: Manter alterações sincronizadas tanto no diretório raiz (`src/`) quanto no diretório do aplicativo mobile (`APK/src/`).
- **Validação Passo a Passo**: Apresentar os arquivos alterados e testar a build antes de finalizar.
