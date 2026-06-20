// Error de validacion - datos de entrada incorrectos o incompletos
const AppError = require('./AppError');

class ValidacionError extends AppError {
  constructor(mensaje = 'Datos de entrada invalidos') {
    super(mensaje, 400);
  }
}

module.exports = ValidacionError;
