// Punto de entrada del servidor - inicializa Express, Socket.IO y middlewares
const http = require('http');
const express = require('express');
const cors = require('cors');
const configuracion = require('./config');
const logger = require('./observabilidad/logger');
const loggerMiddleware = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const autenticacionRutas = require('./rutas/autenticacion.rutas');
const reportesRutas = require('./rutas/reportes.rutas');
const usuariosRutas = require('./rutas/usuarios.rutas');
const analiticaRutas = require('./rutas/analitica.rutas');
const prediccionesRutas = require('./rutas/predicciones.rutas');
const socketManager = require('./websocket/socket.manager');
const notificacionServicio = require('./servicios/notificacion.servicio');
const { cargarUsuariosDePrueba } = require('./almacenamiento/usuarios.almacenamiento');

const app = express();
const servidor = http.createServer(app);

// Middlewares globales
app.use(cors({ origin: configuracion.cors.origen, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(loggerMiddleware);

// Rutas de la API
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/reportes', reportesRutas);
app.use('/api/usuarios', usuariosRutas);
app.use('/api/analitica', analiticaRutas);
app.use('/api/predicciones', prediccionesRutas);

// Ruta de verificacion de salud del servidor
app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'activo', timestamp: new Date().toISOString() });
});

// Middleware de errores (debe ser el ultimo)
app.use(errorHandler);

// Configura Socket.IO y conecta el servicio de notificaciones
const io = socketManager.configurar(servidor, configuracion.cors.origen);
notificacionServicio.configurar(io);

// Inicia el servidor
async function iniciar() {
  await cargarUsuariosDePrueba();

  servidor.listen(configuracion.puerto, '0.0.0.0', () => {
    logger.info('SERVIDOR', `Servidor activo en http://localhost:${configuracion.puerto}`);
    logger.info('SERVIDOR', `CORS habilitado para: ${configuracion.cors.origen}`);
  });
}

iniciar().catch((error) => {
  logger.error('SERVIDOR', `Error al iniciar: ${error.message}`);
  process.exit(1);
});
