// Rutas de autenticacion - registro e inicio de sesion
const { Router } = require('express');
const autenticacionControlador = require('../controladores/autenticacion.controlador');

const router = Router();

// POST /api/autenticacion/registro
router.post('/registro', autenticacionControlador.registro);

// POST /api/autenticacion/login
router.post('/login', autenticacionControlador.login);

// POST /api/autenticacion/google
router.post('/google', autenticacionControlador.google);

module.exports = router;
