// Servicio de predicciones - baseline estadistico para operadores
const fs = require('fs');
const path = require('path');

const RUTA_PREDICCIONES = path.resolve(
  __dirname,
  '..',
  'datos',
  'predicciones',
  'predicciones_resumen.json'
);

function obtenerResumen() {
  const contenido = fs.readFileSync(RUTA_PREDICCIONES, 'utf8');
  return JSON.parse(contenido);
}

module.exports = { obtenerResumen };
