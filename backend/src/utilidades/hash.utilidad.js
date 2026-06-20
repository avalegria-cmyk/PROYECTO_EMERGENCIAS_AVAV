// Utilidad para hashear y comparar contrasenas con bcrypt
const bcrypt = require('bcryptjs');

const RONDAS_SAL = 10;

// Hashea una contrasena en texto plano
async function hashearContrasena(contrasena) {
  const sal = await bcrypt.genSalt(RONDAS_SAL);
  return bcrypt.hash(contrasena, sal);
}

// Compara una contrasena en texto plano con su hash
async function compararContrasena(contrasena, hash) {
  return bcrypt.compare(contrasena, hash);
}

module.exports = { hashearContrasena, compararContrasena };
