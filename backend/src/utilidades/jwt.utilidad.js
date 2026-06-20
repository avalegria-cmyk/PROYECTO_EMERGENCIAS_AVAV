// Utilidad para generar y verificar tokens JWT
const jwt = require('jsonwebtoken');
const configuracion = require('../config');

// Genera un token con los datos del usuario
function generarToken(payload) {
  return jwt.sign(payload, configuracion.jwt.secreto, {
    expiresIn: configuracion.jwt.expiracion
  });
}

// Verifica y decodifica un token JWT
function verificarToken(token) {
  return jwt.verify(token, configuracion.jwt.secreto);
}

module.exports = { generarToken, verificarToken };
