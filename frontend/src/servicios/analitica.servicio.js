// Servicio de analitica - dashboard KPI del operador
import { peticionAPI } from '../config/api';

async function obtenerResumenAnalitica() {
  return peticionAPI('/analitica/resumen');
}

export { obtenerResumenAnalitica };
