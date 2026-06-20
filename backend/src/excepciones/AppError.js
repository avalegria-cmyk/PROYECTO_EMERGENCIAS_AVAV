// Clase base para errores operacionales de la aplicacion
class AppError extends Error {
  constructor(mensaje, codigoEstado, esOperacional = true) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    this.esOperacional = esOperacional;
    this.nombre = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
