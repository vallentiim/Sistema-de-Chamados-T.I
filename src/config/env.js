// Biblioteca para trabalhar com caminhos do sistema operacional.
const path = require('path');

// Carrega variáveis de ambiente do arquivo .env.
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Função utilitária para converter texto em número com valor padrão.
function getNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Centraliza as configurações da aplicação.
module.exports = {
  app: {
    port: getNumber(process.env.PORT, 3000),
    host: process.env.HOST || '0.0.0.0',
    sessionSecret: process.env.SESSION_SECRET || 'troque-essa-chave-em-producao',
  },
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sistema_chamados',
    password: process.env.DB_PASSWORD || '',
    port: getNumber(process.env.DB_PORT, 5432),
  },
};
