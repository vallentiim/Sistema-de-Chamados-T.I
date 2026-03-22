// Rotas ligadas à autenticação.
const express = require('express');
const asyncHandler = require('../utils/async-handler');
const authController = require('../controllers/auth-controller');

const router = express.Router();

// Tela inicial de login.
router.get('/', authController.renderLogin);

// Envio do formulário de login.
router.post('/login', asyncHandler(authController.login));

// Encerramento da sessão.
router.get('/logout', authController.logout);

module.exports = router;
