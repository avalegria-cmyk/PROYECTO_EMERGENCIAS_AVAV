// Controlador de analitica - dashboard KPI para operadores
const analiticaServicio = require('../servicios/analitica.servicio');

function resumen(_req, res, next) {
  try {
    const datos = analiticaServicio.obtenerResumen();
    res.status(200).json({ exito: true, datos });
  } catch (error) {
    next(error);
  }
}

module.exports = { resumen };
