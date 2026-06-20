// Middleware de autorizacion - patron Factory para verificar roles
const ProhibidoError = require('../excepciones/ProhibidoError');

// Retorna un middleware que permite solo los roles indicados
function autorizar(...rolesPermitidos) {
  return (req, _res, next) => {
    if (!req.usuario) {
      return next(new ProhibidoError('Usuario no autenticado'));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ProhibidoError('No tiene permisos para esta operacion'));
    }

    next();
  };
}

module.exports = autorizar;
