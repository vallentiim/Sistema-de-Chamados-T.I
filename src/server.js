// App Express já configurado.
const app = require('./app');

// Configurações como host e porta.
const { app: appConfig } = require('./config/env');

// Rotina que prepara o banco de dados antes de subir o servidor.
const initializeDatabase = require('./services/db-init');

async function bootstrap() {
  try {
    // Cria tabelas e usuários iniciais, se necessário.
    await initializeDatabase();

    // Sobe o servidor HTTP.
    app.listen(appConfig.port, appConfig.host, () => {
      console.log(`Servidor online em http://localhost:${appConfig.port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap();
