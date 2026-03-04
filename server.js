require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();

// ================= LISTA DE USUÁRIOS (ADICIONE AQUI) =================
const usuariosIniciais = [
    { nome: 'Admin TI', email: 'ti@email.com', senha: '123', perfil: 'TI' },
    { nome: 'Supervisor', email: 'supervisor@email.com', senha: '123', perfil: 'SUPERVISOR' },
    { nome: 'Operador 01', email: 'op01@email.com', senha: '123', perfil: 'OPERADOR' },
];

// ================= CONFIGURAÇÃO DO SERVIDOR =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ================= CONEXÃO POSTGRESQL =================
// Configuração no arquivo .env
const db = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 5432,
});

// ================= INICIALIZAÇÃO E SEED DE USUÁRIOS =================
const initDB = async () => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, nome TEXT, email TEXT UNIQUE, senha TEXT, perfil TEXT)`);
        await db.query(`CREATE TABLE IF NOT EXISTS chamados (id SERIAL PRIMARY KEY, titulo TEXT, descricao TEXT, status TEXT DEFAULT 'Aberto', prioridade TEXT, usuario TEXT, tecnico TEXT, ilha TEXT, anexo TEXT, sla TIMESTAMP, data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        for (const u of usuariosIniciais) {
            const hash = bcrypt.hashSync(u.senha, 10);
            await db.query(`
                INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, senha = EXCLUDED.senha, perfil = EXCLUDED.perfil
            `, [u.nome, u.email, hash, u.perfil]);
        }
        console.log(" Banco de Dados e Usuários sincronizados!");
    } catch (err) { console.error(" Erro DB:", err); }
};
initDB();

// ================= MIDDLEWARES =================
const auth = (req, res, next) => req.session.usuario ? next() : res.redirect('/');
const onlyTech = (req, res, next) => ['TI', 'SUPERVISOR'].includes(req.session.usuario.perfil) ? next() : res.redirect('/dashboard');

function calcularSLA(prioridade) {
    let horas = prioridade === 'Alta' ? 4 : (prioridade === 'Média' ? 8 : 24);
    let d = new Date(); d.setHours(d.getHours() + horas);
    return d;
}

// ================= ROTAS =================

app.get('/', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const result = await db.query("SELECT * FROM usuarios WHERE email=$1", [email]);
    const user = result.rows[0];
    if (user && bcrypt.compareSync(senha, user.senha)) {
        req.session.usuario = user;
        return res.redirect(['TI', 'SUPERVISOR'].includes(user.perfil) ? '/painel-tecnico' : '/dashboard');
    }
    res.send("<script>alert('Login Inválido'); window.location='/';</script>");
});

app.get('/dashboard', auth, async (req, res) => {
    const r = await db.query("SELECT * FROM chamados WHERE usuario=$1 ORDER BY id DESC", [req.session.usuario.nome]);
    res.render('dashboard', { chamados: r.rows, usuario: req.session.usuario });
});

app.get('/painel-tecnico', auth, onlyTech, async (req, res) => {
    const ilha = req.query.ilha;
    const chamados = await db.query(ilha ? "SELECT * FROM chamados WHERE ilha=$1 ORDER BY id DESC" : "SELECT * FROM chamados ORDER BY id DESC", ilha ? [ilha] : []);
    const contadores = await db.query("SELECT ilha, COUNT(*) as total FROM chamados GROUP BY ilha");
    res.render('painel-tecnico', { chamados: chamados.rows, contadores: contadores.rows, usuario: req.session.usuario });
});

app.get('/novo', auth, (req, res) => res.render('novo'));

app.post('/novo', auth, upload.single('anexo'), async (req, res) => {
    const { titulo, descricao, prioridade, ilha } = req.body;
    await db.query("INSERT INTO chamados (titulo, descricao, prioridade, usuario, ilha, anexo, sla) VALUES ($1,$2,$3,$4,$5,$6,$7)", 
    [titulo, descricao, prioridade, req.session.usuario.nome, ilha, req.file?.filename, calcularSLA(prioridade)]);
    res.redirect('/dashboard');
});

app.get('/chamado/:id', auth, async (req, res) => {
    const r = await db.query("SELECT * FROM chamados WHERE id=$1", [req.params.id]);
    res.render('chamado', { chamado: r.rows[0], usuario: req.session.usuario });
});

// ================= ATUALIZAR STATUS =================
app.post('/status/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const novoStatus = req.body.status;

        // Atualiza o banco de dados
        await db.query("UPDATE chamados SET status=$1 WHERE id=$2", [novoStatus, id]);
        
        // Verifica o perfil do usuário para mandar para a tela inicial correta
        const isTecnico = ['TI', 'SUPERVISOR'].includes(req.session.usuario.perfil);
        
        if (isTecnico) {
            res.redirect('/painel-tecnico'); // Volta para o painel do TI
        } else {
            res.redirect('/dashboard'); // Volta para a tela do usuário comum
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar status");
    }
});

// ================= ASSUMIR CHAMADO =================
app.post('/assumir/:id', auth, onlyTech, async (req, res) => {
    try {
        const id = req.params.id;
        const tecnico = req.session.usuario.nome;

        await db.query(
            "UPDATE chamados SET tecnico=$1, status='Em Andamento' WHERE id=$2", 
            [tecnico, id]
        );
        
        // Redireciona para o painel técnico ou para o chamado
        res.redirect('/chamado/' + id);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao assumir chamado");
    }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// ================= LANÇAMENTO =================
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log("Online!");
    console.log(`Acesse localmente: http://localhost:${PORT}`);
});