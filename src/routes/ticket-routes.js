// Rotas ligadas aos chamados.
const express = require('express');
const asyncHandler = require('../utils/async-handler');
const ticketController = require('../controllers/ticket-controller');
const { requireAuth, requireTech } = require('../middlewares/auth');

const router = express.Router();

// Painel do usuário comum.
router.get('/dashboard', requireAuth, asyncHandler(ticketController.renderDashboard));

// Painel restrito para equipe técnica e supervisão.
router.get('/painel-tecnico', requireAuth, requireTech, asyncHandler(ticketController.renderPainelTecnico));

// Formulário e criação de novo chamado.
router.get('/novo', requireAuth, ticketController.renderNovoChamado);
router.post('/novo', requireAuth, ticketController.upload.single('anexo'), asyncHandler(ticketController.createChamado));

// Visualização de um chamado específico.
router.get('/chamado/:id', requireAuth, asyncHandler(ticketController.renderChamado));

// Ações exclusivas do time técnico.
router.post('/status/:id', requireAuth, requireTech, asyncHandler(ticketController.updateStatus));
router.post('/assumir/:id', requireAuth, requireTech, asyncHandler(ticketController.assumirChamado));

module.exports = router;
