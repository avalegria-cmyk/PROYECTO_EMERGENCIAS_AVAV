// Middleware para registrar cada peticion HTTP con metodo, URL y tiempo
const logger = require('../observabilidad/logger');

function loggerMiddleware(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const nivel = res.statusCode >= 400 ? 'warn' : 'info';
    logger[nivel]('HTTP', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duracion}ms`);
  });

  next();
}

module.exports = loggerMiddleware;
