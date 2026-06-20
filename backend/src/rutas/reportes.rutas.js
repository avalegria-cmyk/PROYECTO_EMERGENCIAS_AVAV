// Rutas de reportes - lectura publica, escritura con autenticacion opcional
const { Router } = require('express');
const reportesControlador = require('../controladores/reportes.controlador');
const autenticacionMiddleware = require('../middlewares/autenticacion.middleware');
const autorizar = require('../middlewares/autorizacion.middleware');

const router = Router();

// Rutas publicas - cualquier persona puede ver los reportes
// GET /api/reportes - lista reportes
router.get('/', reportesControlador.listar);

// GET /api/reportes/:id - detalle de un reporte
router.get('/:id', reportesControlador.obtenerPorId);

// POST /api/reportes - crear reporte (autenticacion opcional)
router.post('/', autenticacionOpcional, reportesControlador.crear);

// PATCH /api/reportes/:id/estado - cambiar estado (solo operadores y administradores)
router.patch('/:id/estado', autenticacionMiddleware, autorizar('operador', 'administrador'), reportesControlador.cambiarEstado);

// Middleware que intenta autenticar pero no bloquea si no hay token o el token es inválido
function autenticacionOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    // Sin token: permite continuar como anonimo
    req.usuario = null;
    return next();
  }

  // Con token: intenta autenticar, pero si falla sigue como anonimo
  autenticacionMiddleware(req, res, (error) => {
    if (error) {
      req.usuario = null;
      return next();
    }
    next();
  });
}

module.exports = router;
