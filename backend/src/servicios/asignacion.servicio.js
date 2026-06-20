// Servicio para asignar unidades de emergencia a un reporte y notificar al usuario correspondiente
const reportesAlmacenamiento = require('../almacenamiento/reportes.almacenamiento');
const unidadesDatos = require('../almacenamiento/unidades.datos');
const notificacionServicio = require('./notificacion.servicio');
const logger = require('../observabilidad/logger');

function asignarUnidadAlReporte(reporte) {
  if (!reporte || !reporte.id || !reporte.ubicacion) {
    return reporte;
  }

  const unidad = unidadesDatos.buscarUnidadPrincipal(
    reporte.ubicacion.lat,
    reporte.ubicacion.lng,
    reporte.tipo
  );

  if (!unidad) {
    logger.warn('SERVICIO_ASIGNACION', `No se encontro unidad para el reporte ${reporte.id}`);
    return reporte;
  }

  const unidadesCercanas = unidadesDatos.buscarUnidadesCercanas(
    reporte.ubicacion.lat,
    reporte.ubicacion.lng,
    reporte.tipo
  );

  const reporteActualizado = reportesAlmacenamiento.asignarUnidad(
    reporte.id,
    unidad,
    unidadesCercanas
  );

  if (!reporteActualizado) {
    logger.warn('SERVICIO_ASIGNACION', `No se pudo asignar unidad para el reporte ${reporte.id}`);
    return reporte;
  }

  notificacionServicio.notificarUnidadAsignada(reporteActualizado);
  logger.info('SERVICIO_ASIGNACION', `Unidad asignada al reporte ${reporte.id}: ${unidad.nombre}`);

  return reporteActualizado;
}

module.exports = {
  asignarUnidadAlReporte
};
