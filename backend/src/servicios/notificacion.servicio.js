// Servicio de notificaciones en tiempo real - Patron Observer
const logger = require('../observabilidad/logger');

// Referencia al servidor Socket.IO (se inyecta al iniciar)
let io = null;

// Asigna la instancia de Socket.IO al servicio
function configurar(instanciaIO) {
  io = instanciaIO;
  logger.info('SERVICIO_NOTIFICACION', 'Servicio de notificaciones configurado');
}

// Notifica a todos los clientes que se creo un nuevo reporte
function notificarNuevoReporte(reporte) {
  if (!io) {
    return;
  }
  io.emit('reporte:nuevo', reporte);
  logger.info('SERVICIO_NOTIFICACION', `Nuevo reporte notificado: ${reporte.id}`);
}

function notificarUnidadAsignada(reporte) {
  if (!io || !reporte) {
    return;
  }

  if (reporte.unidadAsignada?.correo) {
    const canalUnidad = `sala-unidad-${reporte.unidadAsignada.correo.toLowerCase()}`;
    io.to(canalUnidad).emit('emergencia:asignada', {
      reporte,
      unidadAsignada: reporte.unidadAsignada
    });
    logger.info('SERVICIO_NOTIFICACION', `Notificacion de unidad asignada enviada: ${reporte.id} -> ${reporte.unidadAsignada.correo}`);
  }

  io.emit('reporte:unidadAsignada', reporte);
  logger.info('SERVICIO_NOTIFICACION', `Evento global de unidad asignada emitido: ${reporte.id}`);
}

// Notifica a todos los clientes que un reporte cambio de estado
function notificarCambioEstado(reporte) {
  if (!io) {
    return;
  }
  io.emit('reporte:estadoCambiado', reporte);

  // Notifica también a la sala específica del reporte
  io.to(`emergencia-${reporte.id}`).emit('reporte:actualizado', reporte);

  logger.info('SERVICIO_NOTIFICACION', `Cambio de estado notificado: ${reporte.id} -> ${reporte.estado}`);
}

// Notifica que la gravedad fue actualizada por el clasificador
function notificarGravedadActualizada(reporte) {
  if (!io) {
    return;
  }
  io.emit('reporte:gravedadActualizada', reporte);
  logger.info('SERVICIO_NOTIFICACION', `Gravedad notificada: ${reporte.id} -> ${reporte.gravedad}`);
}

module.exports = {
  configurar,
  notificarNuevoReporte,
  notificarUnidadAsignada,
  notificarCambioEstado,
  notificarGravedadActualizada
};
