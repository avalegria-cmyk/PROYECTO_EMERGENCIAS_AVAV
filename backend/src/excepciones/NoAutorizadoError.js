// Error de autenticacion - credenciales invalidas o token expirado
const AppError = require('./AppError');

class NoAutorizadoError extends AppError {
  constructor(mensaje = 'No autorizado') {
    super(mensaje, 401);
  }
}

module.exports = NoAutorizadoError;
