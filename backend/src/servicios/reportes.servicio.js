// Servicio de reportes - logica de negocio con workers y notificaciones
const { Worker } = require('worker_threads');
const path = require('path');
const reportesAlmacenamiento = require('../almacenamiento/reportes.almacenamiento');
const asignacionServicio = require('./asignacion.servicio');
const notificacionServicio = require('./notificacion.servicio');
const ValidacionError = require('../excepciones/ValidacionError');
const NoEncontradoError = require('../excepciones/NoEncontradoError');
const logger = require('../observabilidad/logger');

const RUTA_WORKER = path.resolve(__dirname, '..', 'workers', 'procesarReporte.worker.js');

// Crea un nuevo reporte y delega la clasificacion al worker
function crearReporte(datos, usuario) {
  if (!datos.tipo || !datos.descripcion) {
    throw new ValidacionError('Tipo y descripcion son obligatorios');
  }

  if (!reportesAlmacenamiento.TIPOS_VALIDOS.includes(datos.tipo)) {
    throw new ValidacionError(`Tipo invalido. Valores permitidos: ${reportesAlmacenamiento.TIPOS_VALIDOS.join(', ')}`);
  }

  const reporte = reportesAlmacenamiento.crear({
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion || { lat: 0, lng: 0, direccion: '' },
    evidencia: datos.evidencia || null,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre
  });

  // Asigna la unidad de emergencia correspondiente antes de notificar
  const reporteConUnidad = asignacionServicio.asignarUnidadAlReporte(reporte);

  // Delega la clasificacion de gravedad a un worker thread
  clasificarConWorker(reporteConUnidad);

  // Notifica en tiempo real a todos los clientes
  notificacionServicio.notificarNuevoReporte(reporteConUnidad);

  logger.info('SERVICIO_REPORTES', `Reporte creado: ${reporteConUnidad.id} por ${usuario.correo}`);
  return reporteConUnidad;
}

// Ejecuta el worker thread para clasificar la gravedad
function clasificarConWorker(reporte) {
  try {
    const worker = new Worker(RUTA_WORKER);

    worker.postMessage({
      id: reporte.id,
      tipo: reporte.tipo,
      descripcion: reporte.descripcion
    });

    worker.on('message', (resultado) => {
      const reporteActualizado = reportesAlmacenamiento.actualizarGravedad(
        resultado.reporteId,
        resultado.gravedad
      );

      if (reporteActualizado) {
        notificacionServicio.notificarGravedadActualizada(reporteActualizado);
      }

      worker.terminate();
    });

    worker.on('error', (error) => {
      logger.error('SERVICIO_REPORTES', `Error en worker: ${error.message}`);
      worker.terminate();
    });
  } catch (error) {
    logger.error('SERVICIO_REPORTES', `No se pudo iniciar el worker: ${error.message}`);
  }
}

// Retorna todos los reportes con filtros opcionales
function obtenerReportes(filtros = {}) {
  return reportesAlmacenamiento.listar(filtros);
}

// Retorna un reporte por su ID
function obtenerReportePorId(id) {
  const reporte = reportesAlmacenamiento.buscarPorId(id);
  if (!reporte) {
    throw new NoEncontradoError(`Reporte con ID ${id} no encontrado`);
  }
  return reporte;
}

// Cambia el estado de un reporte (solo operadores)
function cambiarEstado(id, nuevoEstado, operadorId) {
  if (!reportesAlmacenamiento.ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new ValidacionError(`Estado invalido. Valores permitidos: ${reportesAlmacenamiento.ESTADOS_VALIDOS.join(', ')}`);
  }

  const reporteActual = obtenerReportePorId(id);
  const transicionesPermitidas = {
    pendiente: ['aceptado'],
    aceptado: ['en_camino'],
    en_camino: ['resuelto'],
    en_proceso: ['en_camino', 'resuelto'],
    resuelto: []
  };

  if (!transicionesPermitidas[reporteActual.estado]?.includes(nuevoEstado)) {
    throw new ValidacionError(`Transicion de estado invalida: ${reporteActual.estado} -> ${nuevoEstado}`);
  }

  const reporte = reportesAlmacenamiento.actualizarEstado(id, nuevoEstado, operadorId);
  if (!reporte) {
    throw new NoEncontradoError(`Reporte con ID ${id} no encontrado`);
  }

  notificacionServicio.notificarCambioEstado(reporte);

  logger.info('SERVICIO_REPORTES', `Estado cambiado: ${id} -> ${nuevoEstado} por operador ${operadorId}`);
  return reporte;
}

module.exports = {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  cambiarEstado
};
