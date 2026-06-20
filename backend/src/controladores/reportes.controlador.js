// Controlador de reportes - delega la logica al servicio
const reportesServicio = require('../servicios/reportes.servicio');

// Crea un nuevo reporte de emergencia (autenticado o anonimo)
async function crear(req, res, next) {
  try {
    // Si hay usuario autenticado lo usa, si no crea uno anonimo con nombre del body
    const usuario = req.usuario || {
      id: 'anonimo-' + Date.now(),
      nombre: req.body.nombreReportante || 'Ciudadano anonimo',
      correo: null,
      rol: 'anonimo'
    };

    const reporte = reportesServicio.crearReporte(req.body, usuario);
    res.status(201).json({ exito: true, datos: reporte });
  } catch (error) {
    next(error);
  }
}

// Lista todos los reportes con filtros opcionales
function listar(req, res, next) {
  try {
    const filtros = {};
    if (req.query.estado) {
      filtros.estado = req.query.estado;
    }
    if (req.query.tipo) {
      filtros.tipo = req.query.tipo;
    }

    const reportes = reportesServicio.obtenerReportes(filtros);
    res.status(200).json({ exito: true, datos: reportes });
  } catch (error) {
    next(error);
  }
}

// Obtiene el detalle de un reporte por su ID
function obtenerPorId(req, res, next) {
  try {
    const reporte = reportesServicio.obtenerReportePorId(req.params.id);
    res.status(200).json({ exito: true, datos: reporte });
  } catch (error) {
    next(error);
  }
}

// Cambia el estado de un reporte
function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const reporte = reportesServicio.cambiarEstado(req.params.id, estado, req.usuario.id);
    res.status(200).json({ exito: true, datos: reporte });
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, listar, obtenerPorId, cambiarEstado };
