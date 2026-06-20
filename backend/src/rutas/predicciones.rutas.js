// Rutas de predicciones - protegidas para operadores y administradores
const { Router } = require('express');
const prediccionesControlador = require('../controladores/predicciones.controlador');
const autenticacionMiddleware = require('../middlewares/autenticacion.middleware');
const autorizar = require('../middlewares/autorizacion.middleware');

const router = Router();

router.get(
  '/resumen',
  autenticacionMiddleware,
  autorizar('operador', 'administrador'),
  prediccionesControlador.resumen
);

module.exports = router;
