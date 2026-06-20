// Handler de reportes en tiempo real via WebSocket
const logger = require('../observabilidad/logger');
const { buscarPorCorreo } = require('../almacenamiento/unidades.datos');

// Registra eventos de reportes para operadores conectados
function registrarEventosReportes(socket, io) {
  // Los operadores se unen a la sala global de reportes
  if (socket.usuario.rol === 'operador' || socket.usuario.rol === 'administrador') {
    socket.join('sala-operadores');
    logger.info('SOCKET_REPORTES', `Operador conectado: ${socket.usuario.nombre}`);
  }

  // Todas las conexiones se unen a la sala global de alertas
  socket.join('sala-alertas');

  // Si la conexion pertenece a una unidad de emergencia, la unimos a su sala privada
  if (socket.usuario.correo) {
    const unidad = buscarPorCorreo(socket.usuario.correo.toLowerCase());
    if (unidad) {
      const salaUnidad = `sala-unidad-${socket.usuario.correo.toLowerCase()}`;
      socket.join(salaUnidad);
      logger.info('SOCKET_REPORTES', `Unidad conectada a sala privada: ${socket.usuario.correo}`);
    }
  }
}

module.exports = { registrarEventosReportes };
