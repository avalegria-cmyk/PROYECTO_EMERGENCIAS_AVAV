// Middleware de autenticacion - verifica token JWT en el header Authorization
const { verificarToken } = require('../utilidades/jwt.utilidad');
const NoAutorizadoError = require('../excepciones/NoAutorizadoError');
const logger = require('../observabilidad/logger');

function autenticacionMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new NoAutorizadoError('Token de autenticacion requerido');
    }

    const token = header.split(' ')[1];
    const payload = verificarToken(token);

    // Adjunta los datos del usuario a la peticion
    req.usuario = {
      id: payload.id,
      correo: payload.correo,
      rol: payload.rol,
      nombre: payload.nombre
    };

    next();
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return next(error);
    }
    logger.warn('AUTENTICACION', 'Token invalido o expirado');
    next(new NoAutorizadoError('Token invalido o expirado'));
  }
}

module.exports = autenticacionMiddleware;
