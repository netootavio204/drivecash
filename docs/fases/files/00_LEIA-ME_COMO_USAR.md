# Como usar este pacote (DriveCash — Web App + APK Android em 7 fases)

## O que tem aqui
| Arquivo | Para quê |
|---|---|
| `PRD.md` | O projeto completo (fonte da verdade) |
| `REGRAS_DO_AGENTE.md` | Regras que o agente segue em todas as fases (entrevista, aprovação, segurança) |
| `fases/FASE_1…7.md` | As instruções de cada fase (o agente lê só a fase atual). A **Fase 7** cria o app Android na pasta `APK/` |
| `PROGRESSO.md` | Memória do projeto: o agente atualiza a cada fase |
| `DECISOES.md` | Tudo o que você responder nas entrevistas |

## Preparação (uma vez só)
1. Crie uma pasta para o projeto (ex.: `drivecash`).
2. Extraia o conteúdo do `.zip` **dentro dessa pasta**, de modo que fique `drivecash/docs/...`.
3. Abra a pasta `drivecash` no **Antigravity**.

## Como funciona cada fase
1. Cole o **comando da fase** (abaixo) no agente.
2. O agente **entrevista você** em português (poucas perguntas por vez; opção ★ = recomendada; pode responder "você escolhe").
3. Ele resume o que entendeu e pede sua confirmação, mostra o plano e **só então programa**.
4. No fim, entrega um **roteiro de teste** para você e pergunta: **"Aprova seguir para a próxima fase?"**
5. Responda **SIM**, **AJUSTAR** (diga o que mudar) ou **PARAR**. Sem o seu SIM, ele não avança.

> 💡 **Dica:** abra uma **conversa nova** em cada fase. O agente recupera tudo lendo `PROGRESSO.md` e `DECISOES.md`, e o contexto fica leve.
> 💡 Se o agente "se perder", escreva: *"Releia docs/REGRAS_DO_AGENTE.md e docs/PROGRESSO.md e continue de onde parou."*

## As 7 fases e os comandos para colar

**FASE 1 — Fundação e Design System** (projeto no ar localmente, visual vermelho/laranja/preto)
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_1_FUNDACAO_E_DESIGN.md.
Execute a Fase 1 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**FASE 2 — Banco de dados (Supabase) e Acesso** (a mais importante: o agente vai te perguntar muito sobre o seu jeito de trabalhar)
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_2_BANCO_E_ACESSO.md.
Execute a Fase 2 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
Esta fase define a estrutura do banco: pergunte tudo o que for necessário ANTES de criar qualquer tabela.
```

**FASE 3 — Núcleo do caixa** (abrir o dia, lançar entradas e saídas, extrato)
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_3_NUCLEO_DO_CAIXA.md.
Execute a Fase 3 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**FASE 4 — Fechamento do dia, Caixa Manutenção e Prioridades**
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_4_FECHAMENTO_MANUTENCAO_PRIORIDADES.md.
Execute a Fase 4 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**FASE 5 — Metas, medalhas, estrelas, fases e confete**
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_5_METAS_E_GAMIFICACAO.md.
Execute a Fase 5 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**FASE 6 — Histórico, relatórios, configurações, PWA e publicação**
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_6_RELATORIOS_CONFIG_E_PUBLICACAO.md.
Execute a Fase 6 seguindo o ciclo das regras. Comece pela entrevista inicial, em português.
```

**FASE 7 — APK Android** (pasta `APK/`: o mesmo sistema vira app Android, finalizado no Android Studio). *Só comece depois de aprovar a Fase 6 e deixar o site funcionando.*
```
Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_7_APK_ANDROID.md.
Execute a Fase 7 seguindo o ciclo das regras. Comece confirmando se as Fases 1 a 6 estão aprovadas e depois faça a entrevista inicial, em português.
Esta fase converte o MESMO sistema web em app Android, dentro de uma pasta chamada APK na raiz do projeto. Não mude funções, design, APIs nem banco. Pergunte tudo o que for necessário ANTES de criar qualquer arquivo.
```

> 🛠️ **Para a Fase 7 você vai precisar:** do **Android Studio** (o agente guia a instalação), de preferência de um **celular Android** com cabo USB e de um computador com espaço livre (alguns GB). Ao final, você gera o **APK** no Android Studio e guarda a **chave (keystore)** em 2 lugares.

## Cuidados importantes
- **Nunca cole no chat a chave `service_role` do Supabase.** Só a *Project URL* e a *anon/publishable key* são seguras para compartilhar.
- **Não pule fases:** cada uma depende da anterior.
- **O APK só é feito na Fase 7**, dentro da pasta `APK/`. Nas Fases 1 a 6 o agente não mexe em Android.
- **Na Fase 7, guarde a keystore (chave do app) em 2 cópias fora do computador e as senhas num gerenciador.** Se perder, você não consegue atualizar o app. Nunca envie a chave ou as senhas pelo chat.
- Itens "P2" do PRD (fila offline, notificações, login com Google, PDF…) ficam no **backlog pós-lançamento**.
