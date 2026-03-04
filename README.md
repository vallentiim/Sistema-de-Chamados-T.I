# Sistema de Chamados T.I - AGS Telecom

Sistema de Service Desk desenvolvido em **Node.js + PostgreSQL** para controle de chamados internos.

## Funcionalidades
- Login de usuários
- Abertura de chamados
- Painel técnico
- Atualização de status
- Cálculo de SLA
- Redirecionamento inteligente após atualização

## Tecnologias
- Node.js
- PostgreSQL
- EJS
- CSS
- dotenv

## Como rodar o projeto


### 1. Instale as dependências
npm install

### 2. Configure o arquivo .env
Crie um arquivo .env na raiz do projeto:

PORT=3000
HOST=0.0.0.0
SESSION_SECRET=SUA_SENHA
DB_HOST=localhost
DB_PORT=5432
DB_NAME=NOME_DB
DB_USER=postgres
DB_PASSWORD=SENHA_DB

### 3. Inicie o projeto
npm start ou node server.js
