// Almacenamiento en memoria para reportes de emergencia - Patron Repository
const { v4: uuidv4 } = require('uuid');
const logger = require('../observabilidad/logger');

// Mapa principal de reportes indexado por ID
const reportes = new Map();

// Estados validos para los reportes
const ESTADOS_VALIDOS = ['pendiente', 'aceptado', 'en_camino', 'resuelto'];

// Tipos de emergencia validos
const TIPOS_VALIDOS = ['robo', 'incendio', 'accidente', 'desastre_natural', 'otro'];

// Niveles de gravedad
const GRAVEDADES = ['baja', 'media', 'alta', 'critica'];

// Crea un nuevo reporte de emergencia
function crear(datos) {
  const id = uuidv4();

  const reporte = {
    id,
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion || { lat: 0, lng: 0, direccion: '' },
    evidencia: datos.evidencia || null,
    estado: 'pendiente',
    gravedad: datos.gravedad || 'media',
    usuarioId: datos.usuarioId,
    usuarioNombre: datos.usuarioNombre || 'Anonimo',
    operadorId: null,
    unidadAsignada: null,
    unidadesNotificadas: [],
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  reportes.set(id, reporte);
  logger.info('ALMACENAMIENTO_REPORTES', `Reporte creado: ${id} - Tipo: ${datos.tipo}`);
  return reporte;
}

// Busca un reporte por su ID
function buscarPorId(id) {
  return reportes.get(id) || null;
}

// Retorna todos los reportes ordenados por fecha descendente
function listar(filtros = {}) {
  let lista = Array.from(reportes.values());

  if (filtros.estado) {
    lista = lista.filter(r => r.estado === filtros.estado);
  }
  if (filtros.tipo) {
    lista = lista.filter(r => r.tipo === filtros.tipo);
  }
  if (filtros.usuarioId) {
    lista = lista.filter(r => r.usuarioId === filtros.usuarioId);
  }

  lista.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  return lista;
}

// Actualiza el estado de un reporte
function actualizarEstado(id, nuevoEstado, operadorId) {
  const reporte = reportes.get(id);
  if (!reporte) {
    return null;
  }

  reporte.estado = nuevoEstado;
  reporte.operadorId = operadorId;
  reporte.fechaActualizacion = new Date().toISOString();
  reportes.set(id, reporte);

  logger.info('ALMACENAMIENTO_REPORTES', `Estado actualizado: ${id} -> ${nuevoEstado}`);
  return reporte;
}

// Actualiza la gravedad asignada por el clasificador
function actualizarGravedad(id, gravedad) {
  const reporte = reportes.get(id);
  if (!reporte) {
    return null;
  }

  reporte.gravedad = gravedad;
  reporte.fechaActualizacion = new Date().toISOString();
  reportes.set(id, reporte);

  logger.info('ALMACENAMIENTO_REPORTES', `Gravedad actualizada: ${id} -> ${gravedad}`);
  return reporte;
}

// Asigna una unidad de emergencia principal al reporte
function asignarUnidad(id, unidad, todasLasUnidades) {
  const reporte = reportes.get(id);
  if (!reporte) {
    return null;
  }

  reporte.unidadAsignada = {
    id: unidad.id,
    nombre: unidad.nombre,
    tipo: unidad.tipo,
    lat: unidad.lat,
    lng: unidad.lng,
    correo: unidad.correo,
    distancia: unidad.distancia
  };
  reporte.unidadesNotificadas = (todasLasUnidades || [unidad]).map(u => ({
    id: u.id,
    nombre: u.nombre,
    tipo: u.tipo,
    correo: u.correo
  }));
  reporte.fechaActualizacion = new Date().toISOString();
  reportes.set(id, reporte);

  logger.info('ALMACENAMIENTO_REPORTES', `Unidad asignada: ${id} -> ${unidad.nombre}`);
  return reporte;
}

module.exports = {
  crear,
  buscarPorId,
  listar,
  actualizarEstado,
  actualizarGravedad,
  asignarUnidad,
  ESTADOS_VALIDOS,
  TIPOS_VALIDOS,
  GRAVEDADES
};
