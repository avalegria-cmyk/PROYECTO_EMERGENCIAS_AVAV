// Error cuando el recurso solicitado no existe
const AppError = require('./AppError');

class NoEncontradoError extends AppError {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje, 404);
  }
}

module.exports = NoEncontradoError;
