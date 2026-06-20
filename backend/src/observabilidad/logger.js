// Sistema de logs estructurado - Patron Singleton
class Logger {
  constructor() {
    if (Logger.instancia) {
      return Logger.instancia;
    }
    this.niveles = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    this.nivelActual = this.niveles.DEBUG;
    Logger.instancia = this;
  }

  // Formatea la entrada del log con timestamp y modulo
  _formatear(nivel, modulo, mensaje, datos) {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${nivel}] [${modulo}] ${mensaje}`;
    if (datos) {
      return `${base} | ${JSON.stringify(datos)}`;
    }
    return base;
  }

  // Escribe en consola si el nivel es suficiente
  _escribir(nivel, modulo, mensaje, datos) {
    if (this.niveles[nivel] < this.nivelActual) {
      return;
    }
    const linea = this._formatear(nivel, modulo, mensaje, datos);
    if (nivel === 'ERROR') {
      console.error(linea);
    } else if (nivel === 'WARN') {
      console.warn(linea);
    } else {
      console.log(linea);
    }
  }

  // Registra mensaje informativo
  info(modulo, mensaje, datos) {
    this._escribir('INFO', modulo, mensaje, datos);
  }

  // Registra advertencia
  warn(modulo, mensaje, datos) {
    this._escribir('WARN', modulo, mensaje, datos);
  }

  // Registra error
  error(modulo, mensaje, datos) {
    this._escribir('ERROR', modulo, mensaje, datos);
  }

  // Registra mensaje de depuracion
  debug(modulo, mensaje, datos) {
    this._escribir('DEBUG', modulo, mensaje, datos);
  }
}

const logger = new Logger();
module.exports = logger;
