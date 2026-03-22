// Serviço responsável por preparar a estrutura mínima do banco.
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Usuários padrão criados automaticamente para facilitar testes locais.
const usuariosIniciais = [
  { nome: 'Admin TI', email: 'ti@email.com', senha: '123', perfil: 'TI' },
  { nome: 'Supervisor', email: 'supervisor@email.com', senha: '123', perfil: 'SUPERVISOR' },
  { nome: 'Operador 01', email: 'op01@email.com', senha: '123', perfil: 'OPERADOR' },
];

// Cria as tabelas principais caso ainda não existam.
async function createTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      perfil VARCHAR(30) NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS chamados (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(120) NOT NULL,
      descricao TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'Aberto',
      prioridade VARCHAR(20) NOT NULL,
      usuario VARCHAR(120) NOT NULL,
      tecnico VARCHAR(120),
      ilha VARCHAR(30),
      anexo TEXT,
      sla TIMESTAMP,
      data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Insere ou atualiza os usuários iniciais.
async function seedUsers() {
  for (const usuario of usuariosIniciais) {
    // A senha sempre é armazenada de forma criptografada.
    const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

    await db.query(
      `
        INSERT INTO usuarios (nome, email, senha, perfil)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET
          nome = EXCLUDED.nome,
          senha = EXCLUDED.senha,
          perfil = EXCLUDED.perfil
      `,
      [usuario.nome, usuario.email, senhaCriptografada, usuario.perfil],
    );
  }
}

// Fluxo principal de inicialização do banco.
async function initializeDatabase() {
  await createTables();
  await seedUsers();
  console.log('Banco de dados inicializado com sucesso.');
}

module.exports = initializeDatabase;
