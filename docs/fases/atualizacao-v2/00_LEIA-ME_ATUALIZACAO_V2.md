# Como usar a Atualização v2 do DriveCash

> **Atualização do sistema que já funciona.** Corrige as barras de meta, põe **Intervalo** e **Fechar dia** no topo, mostra **saldo do bolso, do app e dos bancos**, divide a corrida em **partes sem contá-la duas vezes**, calcula **taxas e ganho líquido** e gera o **relatório do dia em PDF**.
> **Regra número 1: não quebrar o que já funciona e não reduzir a segurança.**

## O que tem aqui
| Arquivo | Para quê |
|---|---|
| `PRD_ATUALIZACAO_V2.md` | O projeto completo da atualização (regras, telas, banco, PDF, testes) |
| `RELATORIO_PESQUISA_99_TAXAS_E_PAGAMENTOS.md` | **Pesquisa** sobre taxas da 99, cupons e pagamentos mistos (com fontes) |
| `REGRAS_DE_ATUALIZACAO_SEGURA.md` | Regras de segurança que o agente segue em **todas** as fases |
| `fases/V2_FASE_1…6.md` | Instruções de cada fase (o agente lê só a fase atual) |
| `PROGRESSO_V2.md` | Memória da atualização (o agente atualiza a cada fase) |
| `DECISOES_V2.md` | Tudo o que você responder nas entrevistas |

## Preparação (uma vez só)
1. **Não apague nada do projeto atual.** Copie a pasta `docs/atualizacao-v2/` **para dentro** da pasta `docs/` do seu projeto (fica `seuprojeto/docs/atualizacao-v2/...`).
2. Abra o projeto no **Antigravity**.
3. Tenha em mãos: acesso ao **Supabase** (painel) e ao **GitHub**. O agente guia o resto.

## Como funciona cada fase
1. Cole o **comando da fase** (abaixo) no agente.
2. O agente **entrevista você** em português (poucas perguntas por vez; opção ★ = recomendada; pode responder "você escolhe").
3. Ele mostra o **plano**, faz tudo primeiro em **ambiente de testes**, e entrega uma **prévia** com um **roteiro de teste** para você.
4. Antes de mexer nos dados reais ele confirma: **backup feito ✔ · testes antigos ✔ · números antes × depois iguais ✔**.
5. Ele pergunta: **"Posso publicar e seguir para a próxima fase?"** Responda **SIM**, **AJUSTAR** (diga o que mudar) ou **PARAR**. **Sem o seu SIM, ele não avança.**

> 💡 Abra uma **conversa nova** em cada fase. O agente recupera tudo em `PROGRESSO_V2.md` e `DECISOES_V2.md`.
> 💡 Se o agente se perder: *"Releia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md e docs/atualizacao-v2/PROGRESSO_V2.md e continue de onde parou."*

## As 6 fases e os comandos para colar

**V2.1 — Auditoria, backup e rede de segurança** *(não muda nada que você vê; é a base de tudo)*
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_1_AUDITORIA_E_SEGURANCA.md.
Execute a Fase V2.1 seguindo o ciclo das regras. Esta fase NÃO muda o comportamento do app. Comece pela entrevista inicial, em português.
```

**V2.2 — Barras de meta, botões no topo e Intervalo**
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_2_CORRECOES_TOPO_METAS_INTERVALO.md.
Execute a Fase V2.2 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**V2.3 — Locais do dinheiro: bolso, app 99 e bancos**
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_3_LOCAIS_DO_DINHEIRO.md.
Execute a Fase V2.3 seguindo o ciclo das regras. Esta fase mexe na estrutura do banco: pergunte tudo ANTES de criar tabelas e não toque nos dados reais sem simulação e aprovação.
```

**V2.4 — Corrida única com pagamento em partes (e fim da corrida dobrada)**
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_4_CORRIDA_UNICA_COM_PARTES.md.
Execute a Fase V2.4 seguindo o ciclo das regras. Esta fase mexe no núcleo financeiro: backup do dia, ambiente de testes primeiro e nenhum reparo de dados sem simulação e aprovação.
```

**V2.5 — Taxas, ganho líquido plausível e fechamento v2**
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_5_TAXAS_E_GANHO_LIQUIDO.md.
Execute a Fase V2.5 seguindo o ciclo das regras. Esta fase mexe no cálculo do lucro e no fechamento do dia: backup do dia, ambiente de testes primeiro e o Anexo A do PRD v1 precisa continuar idêntico.
```

**V2.6 — Relatório do dia em PDF, publicação e APK**
```
Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_6_RELATORIO_PDF_E_PUBLICACAO.md.
Execute a Fase V2.6 seguindo o ciclo das regras. Comece pela entrevista inicial, em português. O PDF é gerado no aparelho; nenhum dado financeiro pode sair sem ação explícita do dono.
```

## Cuidados importantes
- **Faça os testes primeiro na PRÉVIA**, nunca direto nos dados reais. O agente só publica com o seu **SIM**.
- **Guarde o backup em 2 lugares** (pen drive + nuvem privada). Nunca envie backup, chaves ou senhas pelo chat.
- **Nunca cole no chat a chave `service_role` do Supabase.** Só *Project URL* e *anon key* são seguros.
- Os recursos novos ficam atrás de **chaves liga/desliga**: se algo der errado, **desligue a chave** e o app volta ao comportamento anterior, **sem perder dados**.
- **Confira os números com os recibos da 99.** O relatório de pesquisa mostra que a taxa varia muito de corrida para corrida; o app não "adivinha": usa o que **você** informa (ou uma estimativa **marcada como estimada**).
- Se o **APK** já existe, a **V2.6** (e as fases anteriores, quando tocam em tela) sincronizam e testam o app Android; **a mesma chave (keystore) deve ser usada**.
