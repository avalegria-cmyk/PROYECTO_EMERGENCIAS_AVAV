// Servicio de autenticacion - registro e inicio de sesion con JWT
const usuariosAlmacenamiento = require('../almacenamiento/usuarios.almacenamiento');
const { generarToken } = require('../utilidades/jwt.utilidad');
const { compararContrasena } = require('../utilidades/hash.utilidad');
const { OAuth2Client } = require('google-auth-library');
const configuracion = require('../config');
const ValidacionError = require('../excepciones/ValidacionError');
const NoAutorizadoError = require('../excepciones/NoAutorizadoError');
const logger = require('../observabilidad/logger');

const googleClient = new OAuth2Client(configuracion.google.clientId);

function construirSesion(usuario) {
  const token = generarToken({
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    nombre: usuario.nombre,
    unidadId: usuario.unidadId || null
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      unidadId: usuario.unidadId || null,
      foto: usuario.foto || null,
      proveedor: usuario.proveedor || 'local'
    }
  };
}

// Registra un nuevo usuario y retorna su token
async function registrar(datos) {
  const { nombre, correo, contrasena } = datos;

  if (!nombre || !correo || !contrasena) {
    throw new ValidacionError('Nombre, correo y contrasena son obligatorios');
  }

  if (contrasena.length < 6) {
    throw new ValidacionError('La contrasena debe tener al menos 6 caracteres');
  }

  if (usuariosAlmacenamiento.existeCorreo(correo)) {
    throw new ValidacionError('El correo ya esta registrado');
  }

  const usuario = await usuariosAlmacenamiento.crear({
    nombre,
    correo,
    contrasena,
    rol: 'usuario'
  });

  logger.info('SERVICIO_AUTH', `Registro exitoso: ${correo}`);
  return construirSesion(usuario);
}

// Verifica credenciales y retorna token si son validas
async function iniciarSesion(correo, contrasena) {
  if (!correo || !contrasena) {
    throw new ValidacionError('Correo y contrasena son obligatorios');
  }

  const usuario = usuariosAlmacenamiento.buscarPorCorreo(correo);
  if (!usuario) {
    throw new NoAutorizadoError('Credenciales incorrectas');
  }

  if (!usuario.contrasena) {
    throw new NoAutorizadoError('Esta cuenta usa inicio de sesion con Google');
  }

  const contrasenaValida = await compararContrasena(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    throw new NoAutorizadoError('Credenciales incorrectas');
  }

  logger.info('SERVICIO_AUTH', `Inicio de sesion: ${correo} - Rol: ${usuario.rol}`);
  return construirSesion(usuario);
}

async function iniciarConGoogle(credential) {
  const googleClientId = configuracion.google.clientId?.trim();
  if (!googleClientId) {
    throw new ValidacionError('GOOGLE_CLIENT_ID no esta configurado en el backend. Debe ser el mismo Client ID usado en VITE_GOOGLE_CLIENT_ID');
  }

  if (!credential) {
    throw new ValidacionError('No se recibio la credencial de Google');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleClientId
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new NoAutorizadoError('Google no devolvio un correo valido');
  }

  const correo = payload.email.toLowerCase();
  let usuario = usuariosAlmacenamiento.buscarPorCorreo(correo);

  if (usuario && usuario.rol !== 'usuario') {
    throw new NoAutorizadoError('Google solo esta habilitado para cuentas de usuario');
  }

  if (!usuario) {
    usuario = await usuariosAlmacenamiento.crear({
      nombre: payload.name || correo,
      correo,
      rol: 'usuario',
      proveedor: 'google',
      proveedorId: payload.sub,
      foto: payload.picture || null
    });
  }

  logger.info('SERVICIO_AUTH', `Inicio con Google: ${correo}`);
  return construirSesion(usuario);
}

module.exports = { registrar, iniciarSesion, iniciarConGoogle };
