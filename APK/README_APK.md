# 📱 Meta Driver — Guia do Aplicativo Android (APK)

Este documento contém o passo a passo completo para você abrir o aplicativo no **Android Studio**, testar no seu celular físico via cabo USB e gerar o arquivo **APK** final para instalar e compartilhar.

---

## 🚀 1. Abrir o Projeto no Android Studio

1. Abra o **Android Studio** no seu computador.
2. Na tela inicial, clique em **Open** (ou no menu superior: `File` → `Open...`).
3. Navegue até a pasta do seu projeto e selecione a pasta:
   ```
   D:\Sistemas em vibecode\PROJETO MOTORISTA\APK\android
   ```
   *(Atenção: selecione especificamente a pasta `android` que fica dentro de `APK`).*
4. Clique em **OK**.
5. Aguarde o Android Studio sincronizar os arquivos do projeto (barra de progresso no rodapé direito com o nome **Gradle Sync**). Na primeira vez, isso pode levar de 1 a 3 minutos para baixar os componentes necessários.

---

## 📲 2. Rodar no seu Celular Físico via Cabo USB

Para testar o aplicativo diretamente no seu celular real:

1. **Ativar o Modo Desenvolvedor no celular:**
   - No seu celular Android, vá em **Configurações** → **Sobre o telefone**.
   - Procure por **Número da versão** (ou *Número de compilação*) e toque nele **7 vezes seguidas** até aparecer a mensagem *"Você agora é um desenvolvedor!"*.
   - Volte em **Configurações** → **Opções do desenvolvedor** (ou *Sistema* → *Opções do desenvolvedor*).
   - Ative a chave **Depuração USB** (*USB Debugging*).

2. **Conectar ao Computador:**
   - Conecte o celular ao computador com o cabo USB.
   - Na tela do celular, aparecerá um aviso: *"Permitir depuração USB deste computador?"*. Marque **Sempre permitir** e toque em **Permitir**.

3. **Executar pelo Android Studio:**
   - No topo do Android Studio, na barra de ferramentas, onde aparece a lista de dispositivos (ao lado do botão verde de Play ▶), o **nome do seu celular** irá aparecer selecionado.
   - Clique no botão verde **Run 'app'** (ícone de Play ▶) ou aperte `Shift + F10`.
   - O aplicativo será compilado e instalado automaticamente no seu celular em alguns segundos!

---

## 📦 3. Como Gerar o Arquivo APK Instalável

Se você quiser gerar o arquivo `.apk` pronto para enviar para o seu celular (por WhatsApp, Google Drive ou pendrive):

### Opção A — APK de Teste Rápido (Debug APK)
1. No menu superior do Android Studio, clique em:
   `Build` → `Build Bundle(s) / APK(s)` → **`Build APK(s)`**.
2. Aguarde a notificação no canto inferior direito:
   *"Build APK(s): APK(s) generated successfully."*
3. Clique no link azul **locate** que aparece na notificação.
4. Uma pasta do Windows abrirá diretamente no arquivo:
   ```
   app-debug.apk
   ```
   *(Localizado em: `APK/android/app/build/outputs/apk/debug/app-debug.apk`)*
5. Você já pode enviar esse arquivo para qualquer celular Android e tocar nele para instalar!

---

### Opção B — APK Release Assinado (Com Keystore Própria)
Para gerar uma versão final com sua assinatura digital permanente:

1. No menu superior do Android Studio, clique em:
   `Build` → **`Generate Signed Bundle / APK...`**.
2. Selecione **APK** e clique em **Next**.
3. Em *Key store path*, clique em **Create new...**:
   - **Key store path**: escolha onde salvar (ex: crie uma pasta segura fora do projeto, como `C:\MinhasChaves\metadriver.jks`).
   - **Password**: crie uma senha segura (anote!).
   - **Alias**: deixe `key0` ou `metadriver`.
   - **Password (Key)**: crie uma senha para a chave.
   - **Validity (years)**: 25.
   - **First and Last Name**: Seu nome ou Meta Driver.
   - Clique em **OK**.
4. ⚠️ **IMPORTANTE:** Guarde o arquivo `.jks` e as senhas em **2 locais seguros** (ex: pendrive e Google Drive pessoal). Se um dia você publicar na Play Store, essa chave nunca poderá ser perdida!
5. Clique em **Next**.
6. Selecione a variante de destino: **release**.
7. Marque as caixas de assinatura (V1 e V2 / Full APK Signature) se solicitado, e clique em **Finish**.
8. O APK final assinado será gerado em:
   ```
   APK/android/app/release/app-release.apk
   ```

---

## 🔄 4. Como Atualizar o App após Alterações

Se no futuro você alterar qualquer tela ou código dentro da pasta `APK/`:
Abra o terminal na pasta `APK` e rode:
```bash
npm run build
npx cap sync android
```
Depois é só clicar em **Run ▶** no Android Studio novamente para aplicar as mudanças!

---

## 🛡️ 5. Recursos Nativos Ativos no App
- **Botão Voltar Inteligente**: Ao tocar no botão físico voltar na tela inicial, o app exibe *"Toque de novo para sair do Meta Driver"* para evitar fechamento acidental no carro.
- **Vibração Tátil**: Resposta de vibração nativa em conquistas, fechamento de caixa e lançamentos.
- **Exportação Nativa**: Exportação de CSV abre diretamente o menu Compartilhar do Android (WhatsApp, Drive, etc.).
- **Barra de Notificações Escura**: Barra de status integrada com cor `#0A0A0A` combinando com o tema escuro neon.
- **Deep Links**: Suporte a links no formato `metadriver://`.
