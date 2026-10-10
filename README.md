# 🚗 Meta Driver (Web App)

> **Gerenciador financeiro e de metas para motoristas de aplicativo** (Uber, 99, inDrive e Corridas Particulares).

---

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
- **Node.js** (v20 ou superior instalado)
- **Git**

### 2. Passo a passo

No terminal, dentro da pasta do projeto:

```bash
# 1. Instalar as dependências (caso não tenha instalado ainda)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra o navegador no endereço exibido (normalmente **`http://localhost:5173`**).

---

## 🧪 Como rodar os testes e checagens

```bash
# Testes unitários e de componentes
npm test

# Verificação estrita de TypeScript
npm run typecheck

# Verificação de padrões de código
npm run lint

# Build de produção
npm run build
```

---

## 🎨 Design System e Demonstração
Para visualizar todos os botões, cartões, teclado numérico, máscara de dinheiro, confetes e medalhas em uma única tela:
- Acesse **`http://localhost:5173/design-system`** no navegador.

---

## 📂 Estrutura de Documentação
- `docs/00_LEIA-ME_COMO_USAR.md`: Instruções de ciclo de desenvolvimento em 6 fases.
- `docs/PRD.md`: Documento de requisitos e regras de negócio normativas.
- `docs/REGRAS_DO_AGENTE.md`: Regras do ciclo de trabalho e segurança.
- `docs/PROGRESSO.md`: Histórico e memória das fases entregues.
- `docs/DECISOES.md`: Registro de todas as decisões tomadas pelo dono do produto.
