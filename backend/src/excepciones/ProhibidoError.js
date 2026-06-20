// Error de permisos - rol insuficiente para la operacion
const AppError = require('./AppError');

class ProhibidoError extends AppError {
  constructor(mensaje = 'Acceso prohibido') {
    super(mensaje, 403);
  }
}

module.exports = ProhibidoError;
