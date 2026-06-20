// Servicio de analitica - KPIs del dataset historico y reportes vivos
const fs = require('fs');
const path = require('path');
const reportesAlmacenamiento = require('../almacenamiento/reportes.almacenamiento');

const RUTA_RESUMEN_DATA_SCIENCE = path.resolve(
  __dirname,
  '..',
  'datos',
  'data_science',
  'analisis_detenidos_resumen.json'
);

function contarPor(lista, selector, limite = 12) {
  const conteos = new Map();

  lista.forEach(item => {
    const clave = selector(item) || 'SIN_DATO';
    conteos.set(clave, (conteos.get(clave) || 0) + 1);
  });

  return Array.from(conteos.entries())
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}

function cargarResumenHistorico() {
  const contenido = fs.readFileSync(RUTA_RESUMEN_DATA_SCIENCE, 'utf8');
  return JSON.parse(contenido);
}

function calcularAnaliticaReportes() {
  const reportes = reportesAlmacenamiento.listar();
  const ahora = Date.now();
  const reportesActivos = reportes.filter(r => r.estado !== 'resuelto');
  const criticos = reportes.filter(r => r.gravedad === 'critica');
  const resueltos = reportes.filter(r => r.estado === 'resuelto');

  const tiemposResolucion = resueltos
    .map(r => (new Date(r.fechaActualizacion).getTime() - new Date(r.fechaCreacion).getTime()) / 60000)
    .filter(minutos => Number.isFinite(minutos) && minutos >= 0);

  const mapaCalorReportes = reportes
    .filter(r => r.ubicacion?.lat && r.ubicacion?.lng)
    .map(r => ({
      lat: Number(r.ubicacion.lat),
      lng: Number(r.ubicacion.lng),
      conteo: r.gravedad === 'critica' ? 5 : r.gravedad === 'alta' ? 4 : r.gravedad === 'media' ? 2 : 1,
      tipo: r.tipo,
      gravedad: r.gravedad,
      estado: r.estado,
      descripcion: r.descripcion
    }));

  return {
    kpis: {
      totalReportes: reportes.length,
      reportesActivos: reportesActivos.length,
      reportesCriticos: criticos.length,
      porcentajeCriticos: reportes.length ? Number(((criticos.length / reportes.length) * 100).toFixed(2)) : 0,
      tiempoPromedioResolucionMin: tiemposResolucion.length
        ? Number((tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length).toFixed(1))
        : 0,
      ultimoReporteHaceMin: reportes.length
        ? Number(((ahora - new Date(reportes[0].fechaCreacion).getTime()) / 60000).toFixed(1))
        : null
    },
    distribuciones: {
      tipo: contarPor(reportes, r => r.tipo, 8),
      gravedad: contarPor(reportes, r => r.gravedad, 6),
      estado: contarPor(reportes, r => r.estado, 6),
      unidad: contarPor(reportes, r => r.unidadAsignada?.nombre, 10),
      hora: contarPor(reportes, r => `${String(new Date(r.fechaCreacion).getHours()).padStart(2, '0')}:00`, 24)
        .sort((a, b) => a.label.localeCompare(b.label))
    },
    mapaCalor: mapaCalorReportes,
    recientes: reportes.slice(0, 10).map(r => ({
      id: r.id,
      tipo: r.tipo,
      gravedad: r.gravedad,
      estado: r.estado,
      descripcion: r.descripcion,
      fechaCreacion: r.fechaCreacion,
      unidad: r.unidadAsignada?.nombre || 'Sin unidad'
    }))
  };
}

function obtenerResumen() {
  return {
    historico: cargarResumenHistorico(),
    reportes: calcularAnaliticaReportes()
  };
}

module.exports = { obtenerResumen };
