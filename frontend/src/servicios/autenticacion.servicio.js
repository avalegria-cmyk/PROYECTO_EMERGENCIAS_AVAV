// Servicio de autenticacion - llamadas a la API de auth
import { peticionAPI } from '../config/api';

// Registra un nuevo usuario
async function registrar(nombre, correo, contrasena) {
  return peticionAPI('/autenticacion/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, correo, contrasena })
  });
}

// Inicia sesion con correo y contrasena
async function iniciarSesion(correo, contrasena) {
  return peticionAPI('/autenticacion/login', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena })
  });
}

async function iniciarConGoogle(credential) {
  return peticionAPI('/autenticacion/google', {
    method: 'POST',
    body: JSON.stringify({ credential })
  });
}

// Obtiene el perfil del usuario autenticado
async function obtenerPerfil() {
  return peticionAPI('/usuarios/perfil');
}

export { registrar, iniciarSesion, iniciarConGoogle, obtenerPerfil };
