# Sistema de Chamados

Sistema de Service Desk desenvolvido com **Node.js**, **Express**, **EJS** e **PostgreSQL** para controle de chamados internos.

## Funcionalidades

- Login com sessão de usuário
- Abertura de chamados com anexo
- Painel técnico com filtro por ilha
- Atualização de status dos chamados
- Assunção de chamados por técnico
- Cálculo automático de SLA por prioridade
- Redirecionamento conforme perfil do usuário

## Tecnologias

- Node.js
- Express
- PostgreSQL
- EJS
- CSS
- dotenv
- express-session
- multer

## Estrutura do projeto

```bash
src/
  config/
  controllers/
  middlewares/
  routes/
  services/
  utils/
views/
public/
uploads/
server.js
```

## Como rodar o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`.

### 3. Crie o banco PostgreSQL

Crie manualmente um banco com o nome informado em `DB_NAME`.

Exemplo:

```sql
CREATE DATABASE sistema_chamados;
```

### 4. Inicie o projeto

```bash
npm start
```

O sistema ficará disponível em:

```bash
http://localhost:3000
```

## Usuários iniciais

Ao iniciar a aplicação, o sistema cria ou atualiza estes usuários padrão:

- **TI**: `ti@email.com` / `123`
- **Supervisor**: `supervisor@email.com` / `123`
- **Operador**: `op01@email.com` / `123`