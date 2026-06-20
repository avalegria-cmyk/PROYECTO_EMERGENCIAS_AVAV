// Servicio de usuarios - consulta de perfiles
const usuariosAlmacenamiento = require('../almacenamiento/usuarios.almacenamiento');
const NoEncontradoError = require('../excepciones/NoEncontradoError');

// Retorna el perfil de un usuario sin la contrasena
function obtenerPerfil(id) {
  const usuario = usuariosAlmacenamiento.buscarPorId(id);
  if (!usuario) {
    throw new NoEncontradoError('Usuario no encontrado');
  }

  const { contrasena, ...perfil } = usuario;
  return perfil;
}

// Retorna la lista de todos los usuarios
function listarUsuarios() {
  return usuariosAlmacenamiento.listar();
}

module.exports = { obtenerPerfil, listarUsuarios };
