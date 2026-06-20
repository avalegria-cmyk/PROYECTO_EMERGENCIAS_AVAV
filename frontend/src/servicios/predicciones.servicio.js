// Servicio de predicciones - modulo operador
import { peticionAPI } from '../config/api';

async function obtenerResumenPredicciones() {
  return peticionAPI('/predicciones/resumen');
}

export { obtenerResumenPredicciones };
