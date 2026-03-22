// Middleware global de tratamento de erros.
// Todo erro lançado nas rotas passa por aqui.
module.exports = (error, req, res, next) => {
  console.error(error);

  // Se a resposta já tiver começado a ser enviada, delega ao Express.
  if (res.headersSent) {
    return next(error);
  }

  // Caso contrário, renderiza a página padrão de erro interno.
  return res.status(500).render('500');
};
