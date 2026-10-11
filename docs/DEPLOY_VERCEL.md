# Guia de Publicação na Vercel — Meta Driver

Este guia passo a passo ensina como publicar o **Meta Driver Web App** na **Vercel** de forma rápida, segura e com suporte a SPA e SSL automático.

---

## 1. Pré-requisitos
- Uma conta gratuita na [Vercel](https://vercel.com) (pode fazer login com GitHub).
- As credenciais do Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 2. Passo a Passo de Publicação

### Opção A: Pelo Painel Web da Vercel (Recomendado se o código estiver no GitHub)
1. Acesse o [Painel da Vercel](https://vercel.com/dashboard) e clique em **"Add New..."** -> **"Project"**.
2. Conecte o repositório GitHub do Meta Driver.
3. Nas configurações do projeto:
   - **Framework Preset:** `Vite` (a Vercel detecta automaticamente através do nosso `vercel.json`).
   - **Root Directory:** `./` (raiz do projeto).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Na seção **Environment Variables**, adicione exatamente as 2 variáveis:
   - `VITE_SUPABASE_URL`: sua URL do projeto no Supabase (ex: `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: sua chave pública `anon` do Supabase.
   > ⚠️ **ATENÇÃO:** NUNCA adicione a chave `service_role` aqui!
5. Clique em **Deploy**.
6. Em cerca de 1 minuto, o aplicativo estará online com link próprio (ex: `https://seu-projeto.vercel.app`)!

---

### Opção B: Publicação via Terminal (Vercel CLI)
Se você preferir publicar direto do terminal do seu computador:

1. Instale ou execute a CLI da Vercel:
   ```bash
   npx vercel
   ```
2. Siga as instruções do terminal para fazer login no navegador.
3. Responda às perguntas:
   - *Set up and deploy?* `Y`
   - *Which scope?* Selecione sua conta
   - *Link to existing project?* `N`
   - *Project name?* `meta-driver`
   - *In which directory is code located?* `./`
   - *Auto-detected Project Settings (Vite)?* `Y`
4. Quando perguntado, adicione as variáveis de ambiente ou publique a versão de produção com:
   ```bash
   npx vercel --prod
   ```

---

## 3. Passo Final Obrigatório no Supabase
Para que os links de recuperação de senha e autenticação funcionem perfeitamente no domínio da Vercel:

1. Acesse o **Painel do Supabase** -> **Authentication** -> **URL Configuration**.
2. No campo **Site URL**, coloque o endereço gerado pela Vercel:
   `https://seu-projeto.vercel.app`
3. No campo **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app/**`
   - `http://localhost:5173/**` (para desenvolvimento local)
   - `metadriver://**` (para o aplicativo APK Android)
4. Clique em **Save**.

Pronto! Seu Web App está 100% publicado, seguro e disponível para motoristas em qualquer dispositivo!
