# FASE V2.2 de 6 — Barras de meta, botões no topo e Intervalo

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_2_CORRECOES_TOPO_METAS_INTERVALO.md.
> Execute a Fase V2.2 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Entregar as **correções visíveis mais rápidas**: (1) **barras de progresso das metas** que **realmente preenchem** (BUG-01); (2) **barra fixa no topo** com **Intervalo** e **Fechar dia** (saem do rodapé); (3) **Intervalo** funcionando, com **tempo trabalhado líquido** e **ganho por hora líquido**.

## 2. O que ler (contexto mínimo)
`PRD_ATUALIZACAO_V2.md`: **4.1**, **5.4**, **5.5**, **6.1**, **6.2**, **6.3**, **7.1**, **8.2**, **12.3** (casos 1 a 5, 15, 16), **Anexo B**; `AUDITORIA_V2.md` (seção do BUG-01). Código: componentes de meta, layout/rodapé, tela Início, fluxo de fechar dia.

## 3. O que existirá no final
- **Barras de meta** (diária, semanal, mensal) com **preenchimento contínuo**, **marcos** 🥉🥈🥇, texto `R$ atual / R$ meta (xx,x%)`, atualização imediata.
- **Barra fixa no topo** (dia aberto): `● Dia aberto · 5h42   [☕ Intervalo] [✔ Fechar dia]`; sem dia aberto: `[⏱ Abrir dia]`. **Removidos do rodapé.**
- **Intervalo:** iniciar/retomar, cronômetro no topo, tipos, lista do dia, fechar com intervalo aberto encerra automaticamente.
- **Tempo trabalhado líquido** e **ganho/hora líquido** no Início e no fechamento.
- Migração `0102` (tabela `pausas`) aplicada **no ambiente de testes e depois em produção**; recurso **`intervalo` atrás de chave**.
- Correção do BUG-01 e da barra do topo entram **direto** (após testes e SIM), sem chave.

## 4. Entrevista inicial

**Rodada 1 — Barras de meta**
1. **Suas metas atuais:** quais existem (diária, semanal, mensal) e com que valores? A barra "não marca" em **todas** ou só em algumas?
2. **Formato preferido:** A) ★ **Barra horizontal** com marcos  B) **Anel** circular  C) Os dois (barra no Início, anel na tela Metas)
3. **No Início, mostrar:** A) ★ As **3 barras** (dia, semana, mês) compactas  B) Só a do dia  C) A do dia e as outras ao tocar
4. **Texto da barra:** A) ★ `R$ 30,00 / R$ 300,00 (10,0%)` + "faltam R$ X"  B) Só porcentagem  C) Só valores

**Rodada 2 — Topo e Intervalo**
5. **Barra do topo:** A) ★ **Fixa** (fica ao rolar a tela)  B) Rola junto com a tela
6. **Tamanho dos botões do topo:** A) ★ Grandes (fáceis de tocar com o carro parado)  B) Compactos
7. **Tipos de intervalo:** A) ★ Descanso, Refeição, Abastecimento, Outro  B) Só "Intervalo" simples  C) Outros nomes (quais?)
8. **Durante o intervalo, você pode lançar corrida?** A) ★ Sim, com aviso discreto  B) Não permitir
9. **Lembrete visual após X horas sem intervalo?** A) ★ Desligado  B) Ligado — depois de quantas horas?
10. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Checklist de segurança** (REGRAS, seção 4): backup de hoje, testes, branch `v2-fase-2-correcoes`.
2. **BUG-01 — teste primeiro:** ativar os testes dos casos 1 a 5 (do PRD 12.3), ver falhar; **registrar a causa real** (H1–H9) no `AUDITORIA_V2.md`.
3. **Corrigir o cálculo/visual:** progresso **contínuo** (0 → Ouro), **preenchimento mínimo visível** (≥ 2%) quando houver progresso, **uma casa decimal**, marcos sobre a barra, estado "sem meta → Criar meta". Garantir `rpc_atualizar_metas` chamada **após cada lançar/editar/excluir/fechar** e **invalidação de cache**. Se a causa estiver no banco (`fn_valor_metrica`, períodos, fuso), corrigir com **nova função versionada** e provar por teste — **sem alterar histórico**.
4. **Início com as 3 barras** conforme pergunta 3; atualizar a tela **Metas**.
5. **Barra do topo:** criar componente fixo com os botões e o chip de status; **remover Intervalo/Fechar dia do rodapé**; respeitar **áreas seguras** (web e APK) e alvos ≥ 48 px; **Fechar dia abre o stepper** (nunca fecha direto).
6. **Migração `0102`** (PRD 8.2): aplicar **primeiro no ambiente de testes**, rodar a suíte, depois em **produção**. Criar o *trigger* que **bloqueia alterações em pausas de dia fechado** e uma **view de tempo** (`minutos_pausa`, `minutos_trabalhados`) para o dia aberto e fechado.
7. **Intervalo (chave `intervalo`):** botão **Intervalo/Retomar**, cronômetro no topo, tipos conforme pergunta 7, lista do dia, **encerrar automaticamente ao fechar o dia** (nesta fase, o front chama `rpc_encerrar_intervalo` **antes** do fechamento atual; a função de fechamento v2 vem na V2.5).
8. **Indicadores:** **tempo trabalhado líquido** e **ganho/hora líquido** (RN-V2-24) no Início e na tela final do fechamento.
9. **Testes:** casos 1–5 (BUG-01) agora **verdes**; casos 15–16 (Intervalo); **suíte antiga inteira verde**; **antes × depois** (8.9) **vazio**; **E2E**: abrir dia → intervalo → retomar → lançar → ver barras → fechar dia pelo topo.
10. **APK (se existir):** `npm run android:sync`, testar topo/áreas seguras/botão voltar em **celular real**; **aumentar `versionCode`**.
11. **Prévia → SIM → produção** (PRD 14.1). **Documentos:** `PROGRESSO_V2.md`, `DECISOES_V2.md`.

## 6. Roteiro de teste prático para o dono
1. Abra o app: **Fechar dia e Intervalo estão no topo**, sem rolar a tela.
2. Lance uma corrida pequena: **as 3 barras de meta se movem** na hora (mesmo com poucos %).
3. Toque em **Intervalo**: o topo mostra o cronômetro; toque em **Retomar**.
4. Apague a corrida: a barra **volta**.
5. Toque em **Fechar dia**: abre o passo a passo (não fecha direto). Veja o **tempo trabalhado líquido** e o **ganho por hora**.
6. No celular (APK): confira o topo **abaixo da barra de status** e o botão voltar.

## 7. Entrevista final e aprovação
Pergunte: *"As barras agora mostram o progresso certinho? O topo ficou fácil de alcançar? O Intervalo funciona do seu jeito?"* Ajuste e use o **modelo de aprovação** para pedir o SIM para a **V2.3**.

## 8. Fora do escopo desta fase
Locais do dinheiro, partes de pagamento, taxas, PDF, reparo de histórico, fechamento v2.

## 9. Definição de pronto
- [ ] Causa do BUG-01 documentada; testes 1–5 verdes (diária, semanal, mensal).
- [ ] Topo fixo com Fechar dia e Intervalo; rodapé sem esses botões; áreas seguras ok.
- [ ] Intervalo funcionando (chave `intervalo`), tempo líquido correto.
- [ ] Suíte antiga verde; antes × depois vazio; APK testado (se existir).
- [ ] `PROGRESSO_V2.md`/`DECISOES_V2.md` atualizados; tag `v2-2-aprovada` após o SIM.

## 10. Plano de volta
**Tela com problema:** desligar a chave `intervalo`; para barras/topo, **reverter o deploy** para a tag `v2-1-aprovada`. A tabela `pausas` é aditiva e pode ficar sem uso.
