// Rutas de usuarios - perfil del usuario autenticado
const { Router } = require('express');
const usuariosControlador = require('../controladores/usuarios.controlador');
const autenticacionMiddleware = require('../middlewares/autenticacion.middleware');

const router = Router();

// Todas las rutas requieren autenticacion
router.use(autenticacionMiddleware);

// GET /api/usuarios/perfil
router.get('/perfil', usuariosControlador.perfil);

module.exports = router;
