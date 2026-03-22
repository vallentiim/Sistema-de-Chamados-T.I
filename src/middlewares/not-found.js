// Middleware executado quando nenhuma rota acima respondeu.
module.exports = (req, res) => {
  res.status(404).render('404');
};
