// bcrypt é usado para comparar a senha digitada com a senha criptografada do banco.
const bcrypt = require('bcrypt');

// Instância de acesso ao PostgreSQL.
const db = require('../config/database');

// Exibe a tela de login.
function renderLogin(req, res) {
  // Se o usuário já estiver logado, redireciona automaticamente.
  if (req.session?.usuario) {
    const destino = ['TI', 'SUPERVISOR'].includes(req.session.usuario.perfil)
      ? '/painel-tecnico'
      : '/dashboard';

    return res.redirect(destino);
  }

  // Mapeamento simples de mensagens de erro para exibir no front.
  const mensagens = {
    credenciais: 'E-mail ou senha inválidos.',
    sessao: 'Sua sessão expirou. Faça login novamente.',
  };

  return res.render('login', {
    erro: mensagens[req.query.erro] || null,
  });
}

// Processa o envio do formulário de login.
async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  // Validação básica de campos obrigatórios.
  if (!email || !senha) {
    return res.redirect('/?erro=credenciais');
  }

  // Busca o usuário pelo e-mail.
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1 LIMIT 1', [email]);
  const usuario = result.rows[0];

  // Se não encontrou usuário, falha o login.
  if (!usuario) {
    return res.redirect('/?erro=credenciais');
  }

  // Compara a senha digitada com a senha criptografada salva no banco.
  const senhaConfere = await bcrypt.compare(senha, usuario.senha);

  if (!senhaConfere) {
    return res.redirect('/?erro=credenciais');
  }

  // Salva um resumo do usuário na sessão.
  // A partir daqui, o sistema passa a reconhecê-lo como autenticado.
  req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };

  // Define o destino com base no perfil.
  const destino = ['TI', 'SUPERVISOR'].includes(usuario.perfil)
    ? '/painel-tecnico'
    : '/dashboard';

  return res.redirect(destino);
}

// Encerra a sessão do usuário.
function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    // Remove o cookie da sessão no navegador.
    res.clearCookie('sid_sistema_chamados');
    return res.redirect('/');
  });
}

module.exports = {
  renderLogin,
  login,
  logout,
};
