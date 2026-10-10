# FASE 5 de 6 — Metas, medalhas, estrelas, fases, conquistas e confete

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_5_METAS_E_GAMIFICACAO.md.
> Execute a Fase 5 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
> ```

## 1. Objetivo
Dar **motivação** ao motorista: **metas** diária, semanal, mensal e anual; **medalhas** bronze/prata/ouro; **estrelas**, **mudança de fase**, **conquistas** e **confete/serpentina** nas vitórias.

## 2. O que ler (contexto mínimo)
`docs/PRD.md`: **6.4** (RN-17 a 23), **6.5** (RN-25), **7.7**, **7.8**, **7.9** (RF-PRI-04), **9.7** e **9.8**, **10.4** (`rpc_atualizar_metas`, `fn_valor_metrica`, `fn_limites_periodo`), **10.5** (fases e conquistas), **13.4**, **Anexo A**, **Anexo B**, **Anexo C**.

## 3. O que existirá no final
- **Metas:** criar, editar, pausar, arquivar; métricas (receita bruta, lucro líquido, corridas, dias trabalhados, reserva de manutenção); níveis Bronze/Prata/Ouro com prévia em R$.
- **Painel de metas** com anel de progresso e marcos 🥉🥈🥇; meta diária em destaque no Início; "faltam R$ X".
- **Medalhas** com animação e **confete/serpentina** (uma celebração por nível/ciclo).
- **Estrelas e Fases** (Aprendiz → Lenda), com modal de **mudança de fase**.
- **Conquistas** (galeria) e **sequência** 🔥 de dias.
- **Meta mínima sugerida** a partir das Prioridades (RN-25) e **sugestão de meta** pelo histórico.
- Configuração de **efeitos, som e vibração** (mínima, em "Mais → Efeitos").
- Função `rpc_avaliar_conquistas` criada e testada.

## 4. Entrevista inicial

**Rodada 1 — Suas metas reais**
1. **Quais metas você quer criar de verdade?** Informe valores aproximados: diária, semanal, mensal e anual (anual é opcional).
2. **A meta principal deve medir:** A) ★ Receita bruta (o que entrou)  B) Lucro líquido (depois das despesas)  C) Número de corridas
3. **Níveis das medalhas:** o padrão é Bronze = 70% da meta, Prata = 100% (a meta), Ouro = 130%. A) ★ Manter  B) Mudar (para quanto?)
4. **Dias de folga fixos** (ex.: domingo), que não quebram a sequência? A) ★ Nenhum  B) Quais dias?

**Rodada 2 — Visual e sensação**
5. **Estilo das medalhas:** A) ★ Metal brilhante (realista)  B) Neon (combina com o app)  C) Simples e chapado
6. **Confete e serpentina:** A) Discreto  B) ★ Médio  C) Festa total no Ouro. *Efeitos podem ser desligados nas configurações.*
7. **Som ao bater meta:** A) ★ Desligado por padrão (posso ligar)  B) Ligado
8. **Nomes das fases** (Aprendiz, Estradeiro, Profissional, Veterano, Mestre do Volante, Elite, Lenda): A) ★ Manter  B) Quero outros nomes (quais?)

**Rodada 3 — Conquistas e prioridades**
9. **Conquistas:** o PRD tem 22 (Anexo C). A) ★ Manter todas  B) Quero tirar ou adicionar algumas (quais?)
10. **Meta mínima sugerida pelas suas contas** (RN-25: soma o que precisa por dia para pagar as prioridades): A) ★ Ativar com botão "Usar como meta diária"  B) Não quero
11. **Quantos dias por semana você costuma trabalhar?** (usado nos cálculos; padrão 6)
12. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo das decisões → `docs/DECISOES.md` → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Camada de dados** (`features/metas`, `gamificacao`): hooks para metas, ciclos, gamificação e conquistas.
2. **Criar/editar meta:** formulário com período, métrica, valor, níveis (padrão da pergunta 3), recorrência; validar `bronze < prata < ouro`; **prévia dos níveis em R$**. Pausar e arquivar sem apagar ciclos passados.
3. **Painel de Metas:** abas Diária/Semanal/Mensal/Anual, `ProgressRing` com marcos, "faltam R$ X", ritmo/projeção (ticket médio dos últimos 14 dias), **sugestão de meta** (média de 14 dias + 10%). Detalhe da meta com histórico de ciclos e melhor ciclo.
4. **Início:** meta diária em destaque com anel e marcos.
5. **Atualização automática:** após **cada** lançamento, edição, exclusão, fechamento e pagamento de prioridade, chamar `rpc_atualizar_metas` e tratar os **eventos** retornados.
6. **Celebrações:** `src/lib/confete.ts` (PRD 9.8) com Bronze, Prata, Ouro e Fase; **fila de celebrações** (nunca duas ao mesmo tempo); uma vez por nível/ciclo; respeitar "reduzir movimento" e a configuração de efeitos; limitar partículas em celulares simples.
7. **Medalhas:** componente `Medalha` em SVG com brilho animado, conforme pergunta 5. Integrar à tela final do fechamento da Fase 4 (medalhas ganhas no dia).
8. **Estrelas e Fases:** exibir no topo e no perfil, barra até a próxima fase, **modal de mudança de fase** com efeito máximo.
9. **Conquistas:** criar `rpc_avaliar_conquistas()` no banco (sequência RN-21, catálogo do Anexo C, estrelas bônus, retornando eventos); popular `conquistas_catalogo` conforme pergunta 9; tela **Conquistas** (bloqueadas em cinza com dica); sequência 🔥 no Início. Migração `0007` e testes SQL.
10. **Prioridades → meta:** implementar RN-25 (meta mínima sugerida) e o botão **"Usar como meta diária"** (RF-PRI-04), se a pergunta 10 for A.
11. **Efeitos:** tela mínima "Mais → Efeitos" com chaves de efeitos, som e vibração (RF-GAM-06), salvas em `configuracoes`.
12. **Testes:** PRD 13.4 (casos 14 a 20) + **Anexo A**: meta diária de R$ 300 com receita R$ 400 → **Ouro**, **+5 ⭐**. Teste de componente: celebração **dispara uma única vez** por nível/ciclo.
13. **Documentos:** atualizar `PROGRESSO.md` e `DECISOES.md`.

## 6. Roteiro de teste prático para o dono
1. Crie uma **meta diária** (ex.: R$ 300 de receita) e veja os valores de Bronze, Prata e Ouro.
2. Abra o dia e lance entradas até **R$ 210**: aparece **Bronze** com confete pequeno. Continue até **R$ 300** (**Prata**) e **R$ 390** (**Ouro**, festa maior).
3. **Apague** uma entrada: a medalha já ganha **não some** e o confete **não repete**.
4. Veja suas **estrelas** subirem e, ao cruzar o limite, a **mudança de fase**.
5. Abra **Conquistas** e veja as desbloqueadas.
6. Em **Mais → Efeitos**, desligue os efeitos: a medalha aparece sem confete.
7. Em **Prioridades**, teste **"Usar como meta diária"**.

## 7. Entrevista final e aprovação
Pergunte: *"As metas e medalhas estão motivadoras? O confete está na medida certa? Algo que você achou exagerado ou fraco?"* Ajuste e use o **modelo de aprovação** para pedir o SIM para a **Fase 6**.

## 8. Fora do escopo desta fase
Relatórios e gráficos, configurações completas, exportar dados, PWA, publicação, notificações, compartilhar medalha (P2), APK.

## 9. Definição de pronto
- [ ] Níveis e estrelas corretos (casos 14 a 20) e o exemplo do Anexo A reproduzido.
- [ ] Celebração única por nível/ciclo; fila sem sobreposição; efeitos desligáveis.
- [ ] Mudança de fase e conquistas funcionando com dados reais.
- [ ] Testes passando; 360 px sem quebra; `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-5-aprovada` após o SIM.
