// Controlador de predicciones - modulo distribuido para operadores
const prediccionesServicio = require('../servicios/predicciones.servicio');

function resumen(_req, res, next) {
  try {
    res.status(200).json({ exito: true, datos: prediccionesServicio.obtenerResumen() });
  } catch (error) {
    next(error);
  }
}

module.exports = { resumen };
