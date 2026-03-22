// Biblioteca nativa usada para montar caminhos absolutos.
const path = require('path');

// Framework HTTP principal da aplicação.
const express = require('express');

// Middlewares e rotas da aplicação.
const sessionMiddleware = require('./middlewares/session');
const { attachAuthLocals } = require('./middlewares/auth');
const authRoutes = require('./routes/auth-routes');
const ticketRoutes = require('./routes/ticket-routes');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

// Cria a instância principal do Express.
const app = express();

// Define EJS como motor de templates e informa onde ficam as views.
app.set('view engine', 'ejs');
app.set('views', path.resolve(process.cwd(), 'views'));

// Habilita leitura de dados enviados por formulários HTML.
app.use(express.urlencoded({ extended: true }));

// Expõe arquivos estáticos como CSS, imagens e anexos.
app.use(express.static(path.resolve(process.cwd(), 'public')));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Inicializa a sessão antes das rotas.
// Sem isso, req.session fica undefined e o login quebra.
app.use(sessionMiddleware);

// Torna dados de autenticação acessíveis nas views via res.locals.
app.use(attachAuthLocals);

// Registra as rotas do sistema.
app.use(authRoutes);
app.use(ticketRoutes);

// Middlewares finais: rota não encontrada e tratamento global de erro.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
