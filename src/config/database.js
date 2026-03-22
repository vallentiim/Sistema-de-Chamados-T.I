// Pool do PostgreSQL: mantém conexões reutilizáveis com o banco.
const { Pool } = require('pg');

// Carrega as configurações vindas do arquivo .env.
const { db: dbConfig } = require('./env');

// Cria a pool de conexões.
const pool = new Pool(dbConfig);

// Escuta erros inesperados de conexão para facilitar depuração.
pool.on('error', (error) => {
  console.error('Erro inesperado na pool do PostgreSQL:', error);
});

module.exports = pool;
