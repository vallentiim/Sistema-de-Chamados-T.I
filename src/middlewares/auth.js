// Lista de perfis que possuem acesso ao painel técnico.
const { PERFIS_TECNICOS } = require('../utils/constants');

// Injeta informações do usuário nas views.
// Assim não precisamos passar usuario/isTecnico manualmente em toda rota.
function attachAuthLocals(req, res, next) {
  const usuario = req.session?.usuario ?? null;

  res.locals.usuario = usuario;
  res.locals.isAutenticado = Boolean(usuario);
  res.locals.isTecnico = Boolean(usuario && PERFIS_TECNICOS.includes(usuario.perfil));

  next();
}

// Bloqueia acesso de usuários não autenticados.
function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.redirect('/?erro=sessao');
  }

  return next();
}

// Bloqueia acesso de usuários que não são do time técnico.
function requireTech(req, res, next) {
  const usuario = req.session?.usuario;

  if (!usuario) {
    return res.redirect('/?erro=sessao');
  }

  if (!PERFIS_TECNICOS.includes(usuario.perfil)) {
    return res.redirect('/dashboard');
  }

  return next();
}

module.exports = {
  attachAuthLocals,
  requireAuth,
  requireTech,
};
