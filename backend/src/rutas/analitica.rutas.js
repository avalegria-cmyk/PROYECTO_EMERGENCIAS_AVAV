// Rutas de analitica - protegidas para operadores y administradores
const { Router } = require('express');
const analiticaControlador = require('../controladores/analitica.controlador');
const autenticacionMiddleware = require('../middlewares/autenticacion.middleware');
const autorizar = require('../middlewares/autorizacion.middleware');

const router = Router();

router.get(
  '/resumen',
  autenticacionMiddleware,
  autorizar('operador', 'administrador'),
  analiticaControlador.resumen
);

module.exports = router;
