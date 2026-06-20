// Servicio de reportes - llamadas a la API de reportes
import { peticionAPI } from '../config/api';

// Obtiene la lista de reportes con filtros opcionales
async function obtenerReportes(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const ruta = params ? `/reportes?${params}` : '/reportes';
  return peticionAPI(ruta);
}

// Obtiene el detalle de un reporte por ID
async function obtenerReporte(id) {
  return peticionAPI(`/reportes/${id}`);
}

// Crea un nuevo reporte de emergencia
async function crearReporte(datos) {
  return peticionAPI('/reportes', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

// Cambia el estado de un reporte
async function cambiarEstado(id, estado) {
  return peticionAPI(`/reportes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado })
  });
}

export { obtenerReportes, obtenerReporte, crearReporte, cambiarEstado };
