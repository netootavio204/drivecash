# FASE V2.6 de 6 — Relatório do dia em PDF, publicação e APK

> **Comando para colar no Antigravity:**
> ```
> Leia docs/atualizacao-v2/REGRAS_DE_ATUALIZACAO_SEGURA.md, docs/REGRAS_DO_AGENTE.md, docs/atualizacao-v2/PROGRESSO_V2.md, docs/atualizacao-v2/DECISOES_V2.md e docs/atualizacao-v2/fases/V2_FASE_6_RELATORIO_PDF_E_PUBLICACAO.md.
> Execute a Fase V2.6 seguindo o ciclo das regras. Comece pela entrevista inicial, em português. O PDF é gerado no aparelho; nenhum dado financeiro pode sair sem ação explícita do dono.
> ```

## 1. Objetivo
Entregar o **relatório detalhado do dia em PDF** (visual atraente e fácil de entender) com **baixar, compartilhar e imprimir**, disponível **ao fechar o dia** e no **histórico**; fazer a **publicação final com plano de volta**, **sincronizar o APK** (se existir) e **fechar a documentação** da atualização.

## 2. O que ler (contexto mínimo)
`PRD_ATUALIZACAO_V2.md`: **6.7**, **6.8**, **7.5**, **10 inteira**, **11**, **12.3** (casos 19, 20, 25), **14**, **Anexo B**, **Anexo C**. PRD v1: **Anexo H** (paridade web ↔ APK) e **seção 15.5** (adaptações Android), se existir `APK/`. `AUDITORIA_V2.md`.

## 3. O que existirá no final
- **Relatório PDF A4** com as **12 seções** do PRD 10.2, em **colorido** ou **econômico (P&B)**, **com ou sem** lista completa de lançamentos.
- **Tela final do fechamento** com **[📄 Baixar PDF] [📤 Compartilhar] [🖨 Imprimir] [Concluir]**; também em **Histórico → Dia**.
- Geração **100% local**, biblioteca carregada **sob demanda**, **fontes dentro do projeto**.
- **Web e APK:** no APK, **Filesystem + Share** (o `download()` direto não funciona no WebView).
- **Publicação final** com checklist (PRD Anexo C), **plano de volta** e **APK sincronizado** (se existir).
- Documentação de **"como voltar atrás"** e **"como atualizar"** para o dono.

## 4. Entrevista inicial

**Rodada 1 — Aparência**
1. **Estilo do PDF:** A) ★ **Colorido** (faixa vermelho→laranja) com opção **econômica P&B**  B) Só econômico  C) Só colorido
2. **Mostrar a lista completa de lançamentos?** A) ★ Sim (com opção de ocultar)  B) Não, só os resumos
3. **Logo/nome no topo:** A) ★ Nome do app + logo escolhida na Fase 1  B) Só o nome  C) Meu nome como motorista em destaque
4. **Dados do cabeçalho** (marque): seu nome · cidade · veículo/placa · plataforma(s). *(Número de conta/agência **não** entra.)*

**Rodada 2 — Uso**
5. **Como você quer usar o PDF?** A) Enviar no **WhatsApp**  B) **Imprimir**  C) Guardar no **Drive/e-mail**  D) Todos
6. **Impressora:** imprime em **A4**? Prefere **economia de tinta**? A) ★ Opção econômica sempre disponível  B) Não imprimo
7. **Relatório semanal/mensal em PDF** (item futuro): vale priorizar depois? A) ★ Depois  B) Já pedir agora *(fica no backlog)*

**Rodada 3 — Publicação**
8. **O APK já foi gerado e está no seu celular?** Ele precisa receber **esta atualização**? A) ★ Sim  B) Só o site por enquanto
9. **Melhor dia/horário para publicar** sem atrapalhar o trabalho?
10. **Quem usa o app?** A) Só eu  B) Outras pessoas também. *(Define se a chave dos recursos fica ligada só para você ou para todos.)*
11. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: resumo → `DECISOES_V2.md` (**D-V2-12, 13, 14, 15**) → confirmação → plano curto → aprovação.

## 5. Tarefas de execução (nesta ordem)
1. **Checklist de segurança** (REGRAS, seção 4); branch `v2-fase-6-pdf`; **backup de produção de hoje**.
2. **Escolher a biblioteca de PDF com o dono** (PRD 10.4; padrão **pdfmake**). Instalar com **versão fixa**, **sem pacote publicado há menos de 14 dias**, `npm audit` limpo. **Carregar só ao tocar em "Baixar PDF"** (lazy loading). **Fontes (Sora e Inter) dentro do projeto**, sem CDN.
3. **Dados do relatório:** montar uma função única que lê o **snapshot do dia fechado** (e, para dia aberto, os dados ao vivo) — **mesmos números do fechamento** (RN-V2-30). Corridas com partes aparecem **uma vez**, com partes em subitens; taxas estimadas com **"~"** e legenda.
4. **Layout:** implementar as **12 seções** do PRD 10.2 com o **design do PRD 10.3**: faixa de cabeçalho, **cartões grandes** com os 6 números principais, **gráfico de barras vetorial** de "Como o dinheiro entrou", quadro **Bolso · App 99 · Bancos**, tabelas com linhas alternadas, rodapé com página X de Y e aviso. **Sem emojis** no PDF; contraste AA; sinais +/−.
5. **Modos:** **colorido** e **econômico (P&B)**; **com/sem lista completa**; lembrar a escolha do dono.
6. **Ações:** **Baixar** (nome `DriveCash_Relatorio_AAAA-MM-DD.pdf`), **Compartilhar** (menu do sistema) e **Imprimir** (abrir o PDF e chamar impressão). **No APK:** gerar **base64 → Filesystem (cache do app) → Share**; sem novas permissões Android.
7. **Telas:** botões na **tela final do fechamento** e em **Histórico → Dia**; estado "**Gerando seu relatório…**" e tratamento de erro.
8. **Segurança:** PDF **só local**; **sem** número de conta/agência; **sem** envio automático; CSP com **apenas** o mínimo necessário (ex.: `blob:`); revisar `AndroidManifest.xml` (APK).
9. **Testes:** casos **19** (números do PDF = fechamento), **20** (40 corridas com partes → **≤ 3 páginas**, acentos ok), **25** (APK); teste de **conteúdo** (texto extraído do PDF contém os valores-chave); **suíte antiga inteira**; **E2E**: fechar dia → baixar PDF; **medir tempo** (< 3 s) e **tamanho** (normalmente < 300 KB).
10. **Aprovação visual:** gerar **PDF de um dia real do dono** (e um de exemplo leve e um pesado), em **colorido e econômico**; o dono confere **na tela e, se possível, impresso**. Ajustar até aprovar.
11. **APK (se existir):** `npm run android:sync`; **aumentar `versionCode`**; gerar **APK assinado** (guia do PRD v1, Anexo F); rodar o **Anexo H (paridade)** + compartilhar o PDF **no celular real**; manter a **mesma keystore**.
12. **Publicação final** (PRD 14.1) e **Checklist do Anexo C**; ligar as chaves **para o dono** e, se houver outros usuários, **gradualmente**.
13. **Documentação:** `PROGRESSO_V2.md` final; guia **"Como voltar atrás"** (chaves, deploy anterior, restaurar backup) e **"Como atualizar o APK"**; arquivar relatório de auditoria e decisões.

## 6. Roteiro de teste prático para o dono
1. **Feche um dia** e toque em **Baixar PDF**: o arquivo abre com **números grandes primeiro** e depois os detalhes.
2. Confira se os **números do PDF = os da tela de fechamento** (receita, taxas, lucro, saldos por local, corridas).
3. Teste **Compartilhar** (WhatsApp) e **Imprimir**; teste a versão **econômica (P&B)**.
4. Abra **Histórico → um dia anterior** e gere o PDF de lá.
5. No celular (APK): gere e **compartilhe** o PDF; confirme acentos e que nada ficou cortado.
6. Desligue e ligue uma **chave** em "Recursos" para ver que o **plano de volta funciona**.

## 7. Entrevista final e aprovação
Pergunte: *"O PDF está bonito e fácil de entender? Falta alguma informação? Você se sente seguro com o backup e com o jeito de voltar atrás?"* Como esta é a **última fase**, entregue o **resumo final** (o que mudou, onde estão os guias, como voltar atrás) e pergunte: **"Atualização v2 concluída? (SIM / AJUSTAR)"**.

## 8. Fora do escopo desta fase
PDF semanal/mensal, notificações, leitura automática de extratos, qualquer mudança de regra de negócio sem aprovação.

## 9. Definição de pronto
- [ ] PDF com **todas as seções**, **números idênticos** ao fechamento, **≤ 3 páginas** com 40 corridas e **aprovado pelo dono** com arquivo real.
- [ ] Baixar/compartilhar/imprimir funcionando (web e APK, se existir); sem novas permissões; sem scripts externos.
- [ ] Biblioteca com versão fixa e `npm audit` limpo; carregada sob demanda.
- [ ] **Checklist do Anexo C completo**; backup final feito; plano de volta testado.
- [ ] Suíte antiga verde; antes × depois vazio; APK testado (se existir).
- [ ] `PROGRESSO_V2.md` final; tag `v2-6-aprovada` após o SIM.

## 10. Plano de volta
**Desligar a chave `pdf`** (o resto continua). Se necessário, **reverter o deploy** para a tag `v2-5-aprovada` e **reinstalar o APK anterior**. Nenhum dado é alterado por esta fase (o PDF só lê).
