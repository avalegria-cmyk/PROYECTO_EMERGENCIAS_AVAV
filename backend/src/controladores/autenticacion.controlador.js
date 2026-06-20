// Controlador de autenticacion - delega la logica al servicio
const autenticacionServicio = require('../servicios/autenticacion.servicio');

// Registra un nuevo usuario
async function registro(req, res, next) {
  try {
    const resultado = await autenticacionServicio.registrar(req.body);
    res.status(201).json({ exito: true, datos: resultado });
  } catch (error) {
    next(error);
  }
}

// Inicia sesion con correo y contrasena
async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await autenticacionServicio.iniciarSesion(correo, contrasena);
    res.status(200).json({ exito: true, datos: resultado });
  } catch (error) {
    next(error);
  }
}

async function google(req, res, next) {
  try {
    const { credential } = req.body;
    const resultado = await autenticacionServicio.iniciarConGoogle(credential);
    res.status(200).json({ exito: true, datos: resultado });
  } catch (error) {
    next(error);
  }
}

module.exports = { registro, login, google };
