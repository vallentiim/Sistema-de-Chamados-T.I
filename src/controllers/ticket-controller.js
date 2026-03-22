// Bibliotecas nativas e dependências do módulo de chamados.
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Banco de dados e utilitários de negócio.
const db = require('../config/database');
const { calcularSLA } = require('../utils/sla');
const { ILHAS, PRIORIDADES, STATUS_CHAMADO, PERFIS_TECNICOS } = require('../utils/constants');

// Garante que a pasta de uploads exista antes de qualquer envio de arquivo.
const uploadsDir = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configuração de armazenamento dos anexos.
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, callback) => {
    // Separa a extensão do arquivo original.
    const extension = path.extname(file.originalname);

    // Sanitiza o nome do arquivo para evitar caracteres problemáticos.
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 60);

    // Prefixa com timestamp para reduzir chance de conflito entre nomes iguais.
    callback(null, `${Date.now()}-${baseName}${extension}`);
  },
});

// Middleware de upload com limite de 10 MB por arquivo.
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Exibe apenas os chamados do usuário autenticado.
function renderDashboard(req, res) {
  return db
    .query('SELECT * FROM chamados WHERE usuario = $1 ORDER BY id DESC', [req.session.usuario.nome])
    .then((result) => {
      res.render('dashboard', { chamados: result.rows });
    });
}

// Exibe o painel técnico com filtro opcional por ilha.
async function renderPainelTecnico(req, res) {
  const filtroIlha = req.query.ilha && ILHAS.includes(req.query.ilha)
    ? req.query.ilha
    : '';

  // Monta a consulta dinamicamente conforme o filtro informado.
  const chamadosQuery = filtroIlha
    ? {
        text: 'SELECT * FROM chamados WHERE ilha = $1 ORDER BY id DESC',
        values: [filtroIlha],
      }
    : {
        text: 'SELECT * FROM chamados ORDER BY id DESC',
        values: [],
      };

  // Busca a lista de chamados e os contadores por ilha em paralelo.
  const [chamados, contadores] = await Promise.all([
    db.query(chamadosQuery.text, chamadosQuery.values),
    db.query('SELECT ilha, COUNT(*)::INT AS total FROM chamados GROUP BY ilha ORDER BY ilha ASC'),
  ]);

  return res.render('painel-tecnico', {
    chamados: chamados.rows,
    contadores: contadores.rows,
    filtroIlha,
  });
}

// Exibe o formulário de abertura de chamado.
function renderNovoChamado(req, res) {
  return res.render('novo', {
    ilhas: ILHAS,
    prioridades: PRIORIDADES,
  });
}

// Cria um novo chamado no banco de dados.
async function createChamado(req, res) {
  const titulo = String(req.body.titulo || '').trim();
  const descricao = String(req.body.descricao || '').trim();
  const prioridade = PRIORIDADES.includes(req.body.prioridade) ? req.body.prioridade : 'Baixa';
  const ilha = ILHAS.includes(req.body.ilha) ? req.body.ilha : null;

  // Validação mínima para impedir inserções incompletas.
  if (!titulo || !ilha) {
    return res.status(400).render('novo', {
      ilhas: ILHAS,
      prioridades: PRIORIDADES,
      erro: 'Preencha o título e selecione uma ilha válida.',
      formData: { titulo, descricao, prioridade, ilha: req.body.ilha },
    });
  }

  await db.query(
    `
      INSERT INTO chamados (titulo, descricao, prioridade, usuario, ilha, anexo, sla)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      titulo,
      descricao || null,
      prioridade,
      req.session.usuario.nome,
      ilha,
      req.file?.filename || null,
      calcularSLA(prioridade),
    ],
  );

  return res.redirect('/dashboard');
}

// Exibe um chamado específico.
async function renderChamado(req, res) {
  const id = Number(req.params.id);

  // Evita consultas inválidas para IDs não numéricos.
  if (!Number.isInteger(id)) {
    return res.status(404).render('404');
  }

  const usuario = req.session.usuario;
  const isTecnico = PERFIS_TECNICOS.includes(usuario.perfil);

  // Técnicos podem ver qualquer chamado.
  // Operadores só podem ver chamados abertos por eles mesmos.
  const query = isTecnico
    ? {
        text: 'SELECT * FROM chamados WHERE id = $1 LIMIT 1',
        values: [id],
      }
    : {
        text: 'SELECT * FROM chamados WHERE id = $1 AND usuario = $2 LIMIT 1',
        values: [id, usuario.nome],
      };

  const result = await db.query(query.text, query.values);
  const chamado = result.rows[0];

  if (!chamado) {
    return res.status(404).render('404');
  }

  return res.render('chamado', {
    chamado,
    isTecnico,
    statusDisponiveis: STATUS_CHAMADO,
  });
}

// Atualiza o status de um chamado.
async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const status = STATUS_CHAMADO.includes(req.body.status) ? req.body.status : null;

  if (!Number.isInteger(id) || !status) {
    return res.status(400).send('Status inválido.');
  }

  await db.query('UPDATE chamados SET status = $1 WHERE id = $2', [status, id]);

  // Direciona o usuário de acordo com o tipo de perfil.
  const isTecnico = PERFIS_TECNICOS.includes(req.session.usuario.perfil);
  return res.redirect(isTecnico ? '/painel-tecnico' : '/dashboard');
}

// Permite que um técnico assuma a responsabilidade por um chamado.
async function assumirChamado(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('Chamado inválido.');
  }

  await db.query(
    "UPDATE chamados SET tecnico = $1, status = 'Em Andamento' WHERE id = $2",
    [req.session.usuario.nome, id],
  );

  return res.redirect(`/chamado/${id}`);
}

module.exports = {
  upload,
  renderDashboard,
  renderPainelTecnico,
  renderNovoChamado,
  createChamado,
  renderChamado,
  updateStatus,
  assumirChamado,
};
