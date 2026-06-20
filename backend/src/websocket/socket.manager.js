// Configuracion principal de Socket.IO con autenticacion y handlers
const { Server } = require('socket.io');
const autenticacionSocket = require('./autenticacion.socket');
const chatHandler = require('./chat.handler');
const reportesHandler = require('./reportes.handler');
const logger = require('../observabilidad/logger');

// Referencia al servidor Socket.IO
let ioInstance = null;

// Configura Socket.IO sobre el servidor HTTP
function configurar(servidorHttp, origenCors) {
  const io = new Server(servidorHttp, {
    cors: {
      origin: origenCors,
      methods: ['GET', 'POST']
    }
  });

  // Middleware de autenticacion JWT para cada conexion
  io.use(autenticacionSocket);

  io.on('connection', (socket) => {
    logger.info('SOCKET_MANAGER', `Conectado: ${socket.usuario.nombre} (${socket.usuario.rol})`);

    // Registra los handlers de cada modulo
    chatHandler.registrarEventosChat(socket, io);
    reportesHandler.registrarEventosReportes(socket, io);

    socket.on('disconnect', () => {
      chatHandler.alDesconectar(socket, io);
      logger.info('SOCKET_MANAGER', `Desconectado: ${socket.usuario.nombre}`);
    });
  });

  ioInstance = io;
  logger.info('SOCKET_MANAGER', 'Socket.IO configurado correctamente');
  return io;
}

// Retorna la instancia de Socket.IO para uso en otros servicios
function obtenerIO() {
  return ioInstance;
}

module.exports = { configurar, obtenerIO };
