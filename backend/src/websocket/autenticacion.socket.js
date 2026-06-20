// Middleware de autenticacion para conexiones Socket.IO - permite anonimos
const { verificarToken } = require('../utilidades/jwt.utilidad');
const logger = require('../observabilidad/logger');

// Verifica el token JWT si existe, permite anonimos sin token
function autenticacionSocket(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (token) {
      const payload = verificarToken(token);
      socket.usuario = {
        id: payload.id,
        correo: payload.correo,
        rol: payload.rol,
        nombre: payload.nombre,
        unidadId: payload.unidadId || null,
        autenticado: true
      };
      logger.info('SOCKET_AUTH', `Socket autenticado: ${payload.correo}`);
    } else {
      // Permite conexion anonima sin token
      socket.usuario = {
        id: `anonimo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        correo: null,
        rol: 'anonimo',
        nombre: null,
        unidadId: null,
        autenticado: false
      };
      logger.info('SOCKET_AUTH', 'Socket anonimo conectado');
    }

    next();
  } catch (error) {
    // Si el token es invalido, permite como anonimo
    socket.usuario = {
      id: `anonimo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      correo: null,
      rol: 'anonimo',
      nombre: null,
      autenticado: false
    };
    logger.warn('SOCKET_AUTH', `Token invalido, conectado como anonimo: ${error.message}`);
    next();
  }
}

module.exports = autenticacionSocket;
