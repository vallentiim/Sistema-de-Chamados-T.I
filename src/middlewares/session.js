// Middleware responsável por criar e manter sessões no Express.
const session = require('express-session');
const { app: appConfig } = require('../config/env');

module.exports = session({
  // Nome do cookie de sessão salvo no navegador.
  name: 'sid_sistema_chamados',

  // Chave usada para assinar o cookie.
  secret: appConfig.sessionSecret,

  // Evita regravar a sessão se nada mudou.
  resave: false,

  // Não cria sessão vazia para visitantes que ainda não fizeram login.
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 8,
  },
});
