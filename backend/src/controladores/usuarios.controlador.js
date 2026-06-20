// Controlador de usuarios - consulta de perfiles
const usuariosServicio = require('../servicios/usuarios.servicio');

// Retorna el perfil del usuario autenticado
function perfil(req, res, next) {
  try {
    const perfil = usuariosServicio.obtenerPerfil(req.usuario.id);
    res.status(200).json({ exito: true, datos: perfil });
  } catch (error) {
    next(error);
  }
}

module.exports = { perfil };
