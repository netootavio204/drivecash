# FASE 7 de 7 — APK Android (pasta `APK/`) e finalização no Android Studio

> **Comando para colar no Antigravity:**
> ```
> Leia docs/REGRAS_DO_AGENTE.md, docs/PROGRESSO.md, docs/DECISOES.md e docs/fases/FASE_7_APK_ANDROID.md.
> Execute a Fase 7 seguindo o ciclo das regras. Comece confirmando se as Fases 1 a 6 estão aprovadas e depois faça a entrevista inicial, em português.
> Esta fase converte o MESMO sistema web em app Android, dentro de uma pasta chamada APK na raiz do projeto. Não mude funções, design, APIs nem banco. Pergunte tudo o que for necessário ANTES de criar qualquer arquivo.
> ```

## 1. Objetivo
Criar a pasta **`APK/`** na raiz do projeto e nela preparar o **mesmo sistema que já funciona online** como **aplicativo Android**, com **as mesmas funções, o mesmo design, as mesmas APIs e o mesmo banco (Supabase)**. No final, o dono **finaliza no Android Studio**: abre o projeto, roda no emulador/celular e gera o **APK** (teste e release assinado). Nada é reescrito: o app reaproveita o código web.

## 2. Pré-condição (verificar PRIMEIRO)
Leia `docs/PROGRESSO.md`. **Se as Fases 1 a 6 não estiverem todas aprovadas** (tag `fase-6-aprovada`) ou o web não estiver publicado e estável, **PARE** e avise o dono: *"Ainda faltam fases do web app. Quer terminar a Fase X antes?"* Não prossiga sem o SIM.

## 3. O que ler (contexto mínimo)
`docs/PRD.md`: **0** (regra 11), **3.1**, **5.3**, **5.4**, **7.14** (RF-APK-01 a 27), **12.8**, **14.1**, **15 inteira** (estratégia do APK), **16.2** (decisões 9 a 16), **Anexo D2**, **Anexo F** (guia do Android Studio) e **Anexo H** (paridade). Do código, leia apenas o necessário (`src/lib/supabase.ts`, `src/lib/config.ts`, rotas, `vite.config`, onde há downloads/exportação, service worker/PWA).

## 4. O que existirá no final
- Pasta **`APK/`** na raiz, com projeto Capacitor, `android/`, scripts, `README_APK.md` e `.gitignore` adequado.
- **Mesma interface e funções do web** (Anexo H 100% conferido), usando o **mesmo Supabase**.
- Adaptação nativa isolada em `src/lib/plataforma.ts`: botão voltar, barras do sistema/áreas seguras, teclado, sessão persistente, links de e-mail (deep links), exportação de arquivos, rede, vibração, tela "Sem conexão".
- Ícone adaptativo, splash preta com a marca, nome e versão definidos.
- **APK de teste (debug)** e **release assinado** (APK e/ou AAB), com **keystore guardada em 2 cópias**.
- Dono guiado no **Android Studio** (Anexo F) até gerar e instalar o APK no celular.
- *(Se escolhido)* ficha da Play Store preparada em português.

## 5. Entrevista inicial
> Explique ao dono, em uma frase: *"Vou transformar o seu site em um aplicativo Android, sem refazer nada. Preciso de algumas decisões agora para não dar erro no meio do caminho."*

**Rodada 1 — Seu computador e seu celular**
1. **Seu computador é Windows, Mac ou Linux?** E o **Android Studio já está instalado**? A) ★ Não, me guie na instalação  B) Já instalei (versão?)
2. **Você tem um celular Android** para testar? A) ★ Sim (qual modelo e versão do Android?)  B) Não, só emulador. *(O emulador exige um computador com virtualização.)*
3. **Você tem cabo USB** para ligar o celular ao computador? A) ★ Sim  B) Não (alternativa: copiar o APK para o celular)
4. **Qual a versão mais antiga de Android** que você quer suportar? A) ★ Deixe no padrão recomendado  B) Quero suportar Android bem antigo (informe a versão). *(Quanto mais antigo, mais risco de problema.)*

**Rodada 2 — Identidade do app**
5. **Nome que aparece embaixo do ícone no celular:** A) ★ O mesmo nome do app web ({APP_NAME})  B) Outro (qual?)
6. **Código do pacote do app (applicationId).** Formato: `br.com.seunome.drivecash`. ★ Sugira um com base no meu nome ou domínio. ⚠️ **Depois de publicado na Play Store, não dá para mudar.** Qual você prefere?
7. **Ícone e tela de abertura (splash):** A) ★ Usar a logo/ícone escolhidos na Fase 1 (fundo preto, marca em vermelho/laranja)  B) Vou enviar uma imagem nova  C) Preciso de novas ideias
8. **Versão inicial:** A) ★ 1.0.0 (código de versão 1)  B) Outra
9. **Orientação da tela:** A) ★ Somente em pé (retrato)  B) Também deitado (automático)

**Rodada 3 — Estrutura e comportamento**
10. **Estrutura da pasta `APK/`:** A) ★ Projeto Android que **reaproveita o código da raiz** (um único código; para atualizar, roda 1 comando)  B) **Cópia completa** do código dentro de `APK/` (independente, mas você teria dois códigos para manter). *Antes de decidir, confira na documentação oficial do Capacitor se o padrão A é o recomendado hoje e me conte.*
11. **Qual banco o app usa?** A) ★ O mesmo de produção do web  B) O de testes primeiro, trocar depois
12. **Botão "voltar" do Android no Início:** A) ★ "Toque de novo para sair"  B) Minimizar o app  C) Sair direto
13. **Vibração** ao salvar, ganhar medalha e mudar de fase: A) ★ Sim, respeitando a configuração de efeitos  B) Não
14. **Bloqueio ao abrir o app (biometria/PIN):** A) ★ Não nesta fase *(fica para depois)*  B) Sim, quero agora *(é item extra e aumenta o trabalho)*
15. **Exportar CSV/dados no celular:** A) ★ Abrir o menu Compartilhar do Android (WhatsApp, Drive, e-mail, salvar)  B) Salvar direto na pasta Downloads

**Rodada 4 — E-mail e links (importante para o login)**
16. **O cadastro e a recuperação de senha usam links enviados por e-mail.** No celular, ao tocar no link: A) ★ Abrir **direto no app** (deep link)  B) Abrir no navegador e eu volto ao app manualmente
17. **Você tem domínio próprio** (ex.: meuapp.com.br)? A) ★ Não, vamos usar o link de esquema próprio do app  B) Sim (qual?) — *permite links ainda mais diretos (App Links), com configuração extra*
18. **O Supabase de produção já tem os e-mails de confirmação e recuperação em português?** Se não, ajusto agora.

**Rodada 5 — Entrega e publicação**
19. **O que você quer ao final?** A) ★ Um **APK para instalar no meu celular e de conhecidos** (fora da loja)  B) **Publicar na Google Play**  C) Os dois
20. **Se B ou C:** você já tem **conta de desenvolvedor Google Play**? É **pessoal ou de empresa**? *(Vou conferir as regras atuais do Google no site oficial: taxa única, verificação de identidade e, para contas pessoais novas, teste fechado com vários testadores por 14 dias seguidos. Contas de empresa têm regras diferentes. Não envio nada à loja sem a sua aprovação.)*
21. **Chave de assinatura (keystore):** **vou criar com você** e você guarda **2 cópias** fora do computador (pen drive + nuvem privada) mais as senhas num gerenciador. Combinado? A) ★ Sim  B) Preciso de ajuda para escolher onde guardar
22. **Política de privacidade (para Play Store):** A) ★ Usar a página publicada na Fase 6  B) Outra

**Rodada 6 — Fechamento**
23. **Existe alguma dificuldade, dúvida ou coisa que você imaginou diferente?**

➡️ Depois: **resumo das decisões** (use as palavras do dono) → grave em `docs/DECISOES.md` (atualize também os itens 9 a 16 do PRD 16.2) → peça confirmação → **plano curto** → aprovação.

## 6. Tarefas de execução (nesta ordem)
1. **Branch** `fase-7-apk`. **Verificar o ambiente** (Node, Git, Java, Android Studio/SDK, `adb`) com `APK/scripts/verificar-ambiente.mjs` ou comandos equivalentes; guiar a instalação do que faltar, **um passo por vez**. *Conferir na documentação oficial do Capacitor e do Android as versões exigidas hoje.*
2. **Criar a pasta `APK/`** e a estrutura do PRD 15.4. Criar `APK/.gitignore` (ignorar `www/`, `android/build`, `android/.gradle`, `local.properties`, `keystore/`, `keystore.properties`, `node_modules`).
3. **Preparar o web para o app nativo (mudanças mínimas e seguras na raiz):**
   - arquivo `.env.android` e script `build:android` (modo `android`, `VITE_PLATAFORMA=android`);
   - `src/lib/plataforma.ts`: `isNativo()` e funções para voltar, rede, vibração, armazenamento de sessão, arquivos e links externos, sempre com **fallback para web**;
   - **desativar service worker e prompt de instalação** quando for nativo;
   - **tela "Sem conexão"** (RF-APK-19);
   - **rodar os testes web**: `npm test`, `lint`, `typecheck`, `build` continuam verdes.
4. **Criar o projeto Capacitor em `APK/`** (`cap init`, `cap add android`) com o `appId`/nome da entrevista, `webDir: www`, **sem `server.url`**, `androidScheme` conforme a documentação atual.
5. **Script `sincronizar-web.mjs`** e comandos `android:sync`, `android:abrir`, `android:rodar` (PRD 15.4): build web → copia `dist` para `APK/www` → `cap sync`. *(Se a pergunta 10 for B, seguir a alternativa de cópia completa.)*
6. **Plugins** (App, Haptics, SplashScreen, StatusBar, Keyboard, Network, Preferences, Filesystem, Share, Browser): instalar **na raiz e em `APK/` com a mesma versão**; registrar em `DECISOES.md`.
7. **Adaptações nativas** (PRD 15.5 e 15.6):
   - **Botão voltar:** fecha sheets/modais → volta a rota → no Início segue a pergunta 12;
   - **Barras do sistema e áreas seguras** corretas (preto, ícones claros) usando a solução oficial atual;
   - **Teclado** sem cobrir campos (teclado numérico próprio continua);
   - **Sessão do Supabase** guardada no armazenamento do Capacitor;
   - **Deep links:** esquema no `AndroidManifest.xml`, ouvir `appUrlOpen`, concluir confirmação de e-mail/nova senha; **adicionar as URLs de redirecionamento no painel do Supabase** (guie o dono clique a clique) e ajustar os modelos de e-mail;
   - **Exportar CSV/dados** com Filesystem + Compartilhar;
   - **Indicador online/offline** e **vibração** (se escolhido).
8. **Identidade:** ícone adaptativo e splash (ferramenta oficial de geração de recursos), nome, `versionName`/`versionCode`, orientação, `minSdk` (pergunta 4) e `targetSdk` exigido pela Google Play (hoje API 36; **confirmar**), permissões mínimas, tráfego só HTTPS, `allowBackup` avaliado, depuração do WebView desligada no release.
9. **Compilar por linha de comando** (Gradle) para provar que o projeto Android compila **antes** de pedir ao dono para abrir o Android Studio. Corrigir erros (até 2 tentativas; depois resumo + 2 opções, conforme as regras).
10. **Segurança do pacote:** buscar `service_role` e chaves secretas no projeto e no APK gerado; confirmar que **não há `server.url`**; revisar `AndroidManifest.xml`.
11. **Guiar o dono no Android Studio** (Anexo F), **um passo por vez**: instalar → abrir `APK/android` → sincronizar Gradle → criar emulador → rodar → rodar no celular real (se houver).
12. **Teste de paridade (Anexo H)** com o dono, no celular real. Corrigir qualquer diferença. Rodar também o roteiro da seção 8.
13. **Release assinado:** criar a **keystore com o dono** (Anexo F.7 e F.8), configurar `keystore.properties` **fora do Git**, gerar **APK release** e, se for publicar, **AAB**. **Confirmar que o dono guardou 2 cópias da keystore e das senhas** antes de continuar.
14. **Play Store (somente se a pergunta 19 for B ou C):** preparar textos em português (título, descrição curta e completa), lista de capturas de tela, formulário de Segurança dos dados fiel ao que o app coleta, classificação de conteúdo, política de privacidade, plano de teste fechado. **Conferir as regras atuais no site oficial do Google.** **Não enviar nada sem aprovação do dono.**
15. **Documentação:** `APK/README_APK.md` em português ("como atualizar o app", "como gerar nova versão", "onde está a keystore", "problemas comuns"); atualizar `PROGRESSO.md` e `DECISOES.md`; marcar o Anexo D2 do PRD.

## 7. Testes obrigatórios
- **Web não quebrou:** `npm test`, `lint`, `typecheck` e `build` verdes na raiz.
- **Build Android compila** por linha de comando (debug e release).
- **Segurança:** nenhuma ocorrência de `service_role`; sem `server.url`; permissões mínimas.
- **Fluxos no celular real:** cadastro com link de e-mail abrindo o app; login/logout; sessão continua após fechar e reabrir; recuperar senha; abrir dia → lançar → fechar; meta com confete; Caixa Manutenção; prioridades; relatórios; exportar CSV; botão voltar; teclado; sem internet; troca de app e retorno.
- **Desempenho:** abertura em menos de 3 s em celular intermediário (informar o resultado medido).
- **Paridade:** Anexo H completo.

## 8. Roteiro de teste prático para o dono
1. No Android Studio, rode o app no **emulador** e depois no **seu celular** (ou instale o APK de teste).
2. **Entre com a mesma conta do site:** seus dados devem estar iguais.
3. Faça um **dia completo**: abrir, 2 entradas, 1 saída, fechar. Confira caixa, medalha e confete.
4. Toque no **botão voltar** em várias telas: deve voltar uma tela, fechar janelas e só sair do app no Início.
5. **Exporte o CSV** e abra pelo menu Compartilhar.
6. **Desligue a internet** e abra o app: deve aparecer "Sem conexão" com o botão **Tentar de novo**.
7. **Feche o app** e abra de novo: você continua logado.
8. Teste um **cadastro novo** e toque no link recebido por e-mail: o app deve abrir e concluir.
9. Gere o **APK assinado** seguindo o guia e **instale no celular**.

## 9. Entrevista final e aprovação
Pergunte: *"O app está igual ao site, no visual e nas funções? Algo ficou diferente, cortado ou estranho no celular? A chave (keystore) e as senhas estão guardadas em 2 lugares?"* Corrija o que pedir. Como esta é a **última fase**, no lugar de "Fase 8" entregue o **resumo final** (o que foi criado, onde estão os arquivos, como atualizar) e pergunte: **"Projeto concluído? (SIM / AJUSTAR)"**.

## 10. Fora do escopo desta fase
iOS; notificações push; biometria/PIN *(a menos que escolhida na pergunta 14)*; login com Google; widgets; modo offline com fila; qualquer mudança de funções, design, APIs ou banco em relação ao web.

## 11. Definição de pronto
- [ ] Pasta `APK/` criada, com `README_APK.md`, e Android Studio abre `APK/android` sem erro.
- [ ] **Anexo H (paridade) 100%** conferido no celular real.
- [ ] Web continua com testes, lint e build verdes.
- [ ] APK debug e release assinado gerados e instalados; **keystore em 2 cópias fora do Git**.
- [ ] Sem `service_role` no pacote; sem `server.url`; permissões mínimas.
- [ ] Anexo D2 do PRD completo; `PROGRESSO.md` e `DECISOES.md` atualizados; tag `fase-7-aprovada` após o SIM.
