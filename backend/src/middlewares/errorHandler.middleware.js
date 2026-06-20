// Middleware global de errores - captura AppError y errores inesperados
const logger = require('../observabilidad/logger');
const AppError = require('../excepciones/AppError');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn('ERROR_HANDLER', err.message, {
      codigoEstado: err.codigoEstado,
      ruta: req.originalUrl
    });

    return res.status(err.codigoEstado).json({
      exito: false,
      mensaje: err.message
    });
  }

  // Error inesperado del sistema
  logger.error('ERROR_HANDLER', 'Error interno del servidor', {
    mensaje: err.message,
    stack: err.stack,
    ruta: req.originalUrl
  });

  return res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor'
  });
}

module.exports = errorHandler;
