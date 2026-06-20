// Almacenamiento en memoria para usuarios - Patron Repository
const { v4: uuidv4 } = require('uuid');
const { hashearContrasena } = require('../utilidades/hash.utilidad');
const logger = require('../observabilidad/logger');

// Mapa principal de usuarios indexado por ID
const usuarios = new Map();

// Indice secundario por correo para busquedas rapidas
const indicePorCorreo = new Map();

// Crea un nuevo usuario y lo almacena en memoria
async function crear(datos) {
  const id = uuidv4();
  const contrasenaHash = datos.contrasena ? await hashearContrasena(datos.contrasena) : null;

  const usuario = {
    id,
    nombre: datos.nombre,
    correo: datos.correo,
    contrasena: contrasenaHash,
    rol: datos.rol || 'usuario',
    unidadId: datos.unidadId || null,
    proveedor: datos.proveedor || 'local',
    proveedorId: datos.proveedorId || null,
    foto: datos.foto || null,
    creadoEn: new Date().toISOString()
  };

  usuarios.set(id, usuario);
  indicePorCorreo.set(datos.correo.toLowerCase(), id);

  logger.info('ALMACENAMIENTO_USUARIOS', `Usuario creado: ${datos.correo}`);
  return usuario;
}

// Busca un usuario por su correo electronico
function buscarPorCorreo(correo) {
  const id = indicePorCorreo.get(correo.toLowerCase());
  if (!id) {
    return null;
  }
  return usuarios.get(id) || null;
}

// Busca un usuario por su ID
function buscarPorId(id) {
  return usuarios.get(id) || null;
}

// Retorna todos los usuarios sin incluir contrasenas
function listar() {
  const lista = [];
  for (const usuario of usuarios.values()) {
    const { contrasena, ...sinContrasena } = usuario;
    lista.push(sinContrasena);
  }
  return lista;
}

// Verifica si existe un correo registrado
function existeCorreo(correo) {
  return indicePorCorreo.has(correo.toLowerCase());
}

// Precarga usuarios de prueba al iniciar (incluye unidades de emergencia del x3d_classifier)
async function cargarUsuariosDePrueba() {
  const pruebaUsuarios = [
    { nombre: 'Admin Sistema', correo: 'admin@emergencias.com', contrasena: 'Admin123', rol: 'administrador' },
    { nombre: 'Operador Central', correo: 'operador@emergencias.com', contrasena: 'Operador123', rol: 'operador' },
    { nombre: 'Carlos Perez', correo: 'carlos@correo.com', contrasena: 'Usuario123', rol: 'usuario' },
    { nombre: 'Maria Lopez', correo: 'maria@correo.com', contrasena: 'Usuario123', rol: 'usuario' },

    // Unidades policiales (UPCs) - como en x3d_classifier
    { nombre: 'UPC La Luz', correo: 'upc01@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc01' },
    { nombre: 'UPC La Floresta', correo: 'upc02@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc02' },
    { nombre: 'UPC de El Dorado', correo: 'upc03@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc03' },
    { nombre: 'UPC La Pulida', correo: 'upc04@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc04' },
    { nombre: 'UPC Ruminahui Alta', correo: 'upc05@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc05' },
    { nombre: 'Distrito Policia La Delicia', correo: 'upc06@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc06' },
    { nombre: 'UPC Rio Coca', correo: 'upc07@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc07' },
    { nombre: 'UPC Flavio Alfaro', correo: 'upc08@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc08' },
    { nombre: 'UPC Quito Norte', correo: 'upc09@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc09' },
    { nombre: 'UPC Comite del Pueblo 1', correo: 'upc10@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc10' },
    { nombre: 'UPC Carolina', correo: 'upc11@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc11' },
    { nombre: 'UPC Ponceano Alto', correo: 'upc12@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc12' },
    { nombre: 'UPC Cotocollao', correo: 'upc13@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc13' },
    { nombre: 'UPC Las Casas', correo: 'upc14@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc14' },
    { nombre: 'UPC San Carlos', correo: 'upc15@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'upc15' },

    // Estaciones de bomberos
    { nombre: 'Bomberos Estacion N21', correo: 'bomb01@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'bomb01' },
    { nombre: 'Bomberos Juan Leon Mera', correo: 'bomb02@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'bomb02' },
    { nombre: 'Bomberos Carcelen', correo: 'bomb03@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'bomb03' },
    { nombre: 'Bomberos Estacion N24', correo: 'bomb04@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'bomb04' },

    // Hospitales
    { nombre: 'Hospital Capital', correo: 'hosp01@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp01' },
    { nombre: 'Clinica El Batan', correo: 'hosp02@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp02' },
    { nombre: 'Clinica La Luz', correo: 'hosp03@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp03' },
    { nombre: 'Cruz Roja Cochapata', correo: 'hosp04@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp04' },
    { nombre: 'Hospital Vozandes', correo: 'hosp05@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp05' },
    { nombre: 'Hospital Metropolitano', correo: 'hosp06@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp06' },
    { nombre: 'Hospital Adventista', correo: 'hosp07@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp07' },
    { nombre: 'Hospital Clinicas Pichincha', correo: 'hosp08@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp08' },
    { nombre: 'Clinica Pichincha', correo: 'hosp09@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp09' },
    { nombre: 'Clinica Moderna', correo: 'hosp10@emergencias.com', contrasena: '1234', rol: 'operador', unidadId: 'hosp10' },

    // ECU 911
    { nombre: 'ECU 911 Quito', correo: 'ecu911@emergencias.com', contrasena: '1234', rol: 'administrador', unidadId: 'ecu911' }
  ];

  for (const datos of pruebaUsuarios) {
    await crear(datos);
  }

  logger.info('ALMACENAMIENTO_USUARIOS', `${pruebaUsuarios.length} usuarios cargados (incluye unidades de emergencia)`);
}

module.exports = {
  crear,
  buscarPorCorreo,
  buscarPorId,
  listar,
  existeCorreo,
  cargarUsuariosDePrueba
};
