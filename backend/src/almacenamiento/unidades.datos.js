// Datos geolocalizados de unidades de emergencia y logica de busqueda por cercania
// Espejo de los datos del frontend (emergencia.datos.js) para uso en backend

// Todas las unidades de emergencia con ubicacion y correo de cuenta
const UNIDADES = [
  // Policia (UPCs)
  { id: 'upc01', tipo: 'policia', nombre: 'UPC La Luz', lat: -0.14630, lng: -78.47933, correo: 'upc01@emergencias.com', direccion: 'Jacinto Jijon y Caamano S/N' },
  { id: 'upc02', tipo: 'policia', nombre: 'UPC La Floresta', lat: -0.21326, lng: -78.48368, correo: 'upc02@emergencias.com', direccion: 'C. E16, La Floresta' },
  { id: 'upc03', tipo: 'policia', nombre: 'UPC de El Dorado', lat: -0.21798, lng: -78.49308, correo: 'upc03@emergencias.com', direccion: 'Solano' },
  { id: 'upc04', tipo: 'policia', nombre: 'UPC La Pulida', lat: -0.13950, lng: -78.50359, correo: 'upc04@emergencias.com', direccion: 'Sector La Pulida' },
  { id: 'upc05', tipo: 'policia', nombre: 'UPC Ruminahui Alta', lat: -0.12627, lng: -78.48566, correo: 'upc05@emergencias.com', direccion: 'Nagola' },
  { id: 'upc06', tipo: 'policia', nombre: 'Distrito Policia La Delicia', lat: -0.12686, lng: -78.48340, correo: 'upc06@emergencias.com', direccion: 'Av. del Maestro' },
  { id: 'upc07', tipo: 'policia', nombre: 'UPC Rio Coca', lat: -0.16321, lng: -78.47388, correo: 'upc07@emergencias.com', direccion: 'Av. Rio Coca E5 255' },
  { id: 'upc08', tipo: 'policia', nombre: 'UPC Flavio Alfaro', lat: -0.12350, lng: -78.49730, correo: 'upc08@emergencias.com', direccion: 'Flavio Alfaro' },
  { id: 'upc09', tipo: 'policia', nombre: 'UPC Quito Norte', lat: -0.12579, lng: -78.49835, correo: 'upc09@emergencias.com', direccion: 'Cieza de Leon' },
  { id: 'upc10', tipo: 'policia', nombre: 'UPC Comite del Pueblo 1', lat: -0.11961, lng: -78.46451, correo: 'upc10@emergencias.com', direccion: 'Cesar Endara' },
  { id: 'upc11', tipo: 'policia', nombre: 'UPC Carolina', lat: -0.18311, lng: -78.48631, correo: 'upc11@emergencias.com', direccion: 'Av. Rio Amazonas' },
  { id: 'upc12', tipo: 'policia', nombre: 'UPC Ponceano Alto', lat: -0.10070, lng: -78.48091, correo: 'upc12@emergencias.com', direccion: 'Ponceano' },
  { id: 'upc13', tipo: 'policia', nombre: 'UPC Cotocollao', lat: -0.11432, lng: -78.49843, correo: 'upc13@emergencias.com', direccion: 'Santa Teresa 8-23' },
  { id: 'upc14', tipo: 'policia', nombre: 'UPC Las Casas', lat: -0.18599, lng: -78.51002, correo: 'upc14@emergencias.com', direccion: 'Sector Las Casas' },
  { id: 'upc15', tipo: 'policia', nombre: 'UPC San Carlos', lat: -0.12948, lng: -78.50299, correo: 'upc15@emergencias.com', direccion: 'Sector San Carlos' },

  // Bomberos
  { id: 'bomb01', tipo: 'bomberos', nombre: 'Bomberos Estacion N21', lat: -0.13583, lng: -78.48784, correo: 'bomb01@emergencias.com', direccion: 'Rafael Aulestia' },
  { id: 'bomb02', tipo: 'bomberos', nombre: 'Bomberos Juan Leon Mera', lat: -0.20413, lng: -78.49307, correo: 'bomb02@emergencias.com', direccion: 'Juan Leon Mera 612' },
  { id: 'bomb03', tipo: 'bomberos', nombre: 'Bomberos Carcelen', lat: -0.08905, lng: -78.47111, correo: 'bomb03@emergencias.com', direccion: 'Francisco Ruiz' },
  { id: 'bomb04', tipo: 'bomberos', nombre: 'Bomberos Estacion N24', lat: -0.28564, lng: -78.47674, correo: 'bomb04@emergencias.com', direccion: 'Conocoto' },

  // Hospitales
  { id: 'hosp01', tipo: 'hospital', nombre: 'Hospital Capital', lat: -0.16131, lng: -78.47610, correo: 'hosp01@emergencias.com', direccion: 'Av. 6 de Diciembre' },
  { id: 'hosp02', tipo: 'hospital', nombre: 'Clinica El Batan', lat: -0.16544, lng: -78.47564, correo: 'hosp02@emergencias.com', direccion: 'Av. 6 de Diciembre 4311' },
  { id: 'hosp03', tipo: 'hospital', nombre: 'Clinica La Luz', lat: -0.14790, lng: -78.47557, correo: 'hosp03@emergencias.com', direccion: 'Av. 6 de Diciembre N48-201' },
  { id: 'hosp04', tipo: 'hospital', nombre: 'Cruz Roja Cochapata', lat: -0.17046, lng: -78.47515, correo: 'hosp04@emergencias.com', direccion: 'Cochapata E11-10' },
  { id: 'hosp05', tipo: 'hospital', nombre: 'Hospital Vozandes', lat: -0.17281, lng: -78.48945, correo: 'hosp05@emergencias.com', direccion: 'Veracruz N-37' },
  { id: 'hosp06', tipo: 'hospital', nombre: 'Hospital Metropolitano', lat: -0.18438, lng: -78.50370, correo: 'hosp06@emergencias.com', direccion: 'Av. Mariana de Jesus' },
  { id: 'hosp07', tipo: 'hospital', nombre: 'Hospital Adventista', lat: -0.19150, lng: -78.49296, correo: 'hosp07@emergencias.com', direccion: 'Av. 10 de Agosto' },
  { id: 'hosp08', tipo: 'hospital', nombre: 'Hospital Clinicas Pichincha', lat: -0.20193, lng: -78.49549, correo: 'hosp08@emergencias.com', direccion: 'Gral. Ulpiano Paez' },
  { id: 'hosp09', tipo: 'hospital', nombre: 'Clinica Pichincha', lat: -0.20194, lng: -78.49548, correo: 'hosp09@emergencias.com', direccion: 'Ulpiano Paez 250' },
  { id: 'hosp10', tipo: 'hospital', nombre: 'Clinica Moderna', lat: -0.19650, lng: -78.49491, correo: 'hosp10@emergencias.com', direccion: 'Av. Francisco E1-15' },

  // ECU 911
  { id: 'ecu911', tipo: 'ecu911', nombre: 'ECU 911 Quito', lat: -0.21996, lng: -78.49881, correo: 'ecu911@emergencias.com', direccion: 'Centro de Quito' }
];

// Mapeo: tipo de emergencia -> tipos de unidades que deben responder
const MAPEO_TIPO_UNIDAD = {
  robo: ['policia'],
  incendio: ['bomberos'],
  accidente: ['hospital', 'policia'],
  desastre_natural: ['policia', 'bomberos', 'hospital'],
  otro: ['policia']
};

// Calcula la distancia Haversine (km) entre dos puntos
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Busca las unidades mas cercanas segun el tipo de emergencia
// Retorna un array con la unidad mas cercana de cada tipo requerido
function buscarUnidadesCercanas(lat, lng, tipoEmergencia) {
  const tiposRequeridos = MAPEO_TIPO_UNIDAD[tipoEmergencia] || ['policia'];
  const resultado = [];

  for (const tipoUnidad of tiposRequeridos) {
    const unidadesDelTipo = UNIDADES.filter(u => u.tipo === tipoUnidad);
    let mejor = null;
    let mejorDist = Infinity;

    for (const unidad of unidadesDelTipo) {
      const dist = haversine(lat, lng, unidad.lat, unidad.lng);
      if (dist < mejorDist) {
        mejorDist = dist;
        mejor = { ...unidad, distancia: dist };
      }
    }

    if (mejor) {
      resultado.push(mejor);
    }
  }

  return resultado;
}

// Busca la unidad principal (primera del array) mas cercana
function buscarUnidadPrincipal(lat, lng, tipoEmergencia) {
  const unidades = buscarUnidadesCercanas(lat, lng, tipoEmergencia);
  return unidades.length > 0 ? unidades[0] : null;
}

// Busca una unidad por su ID
function buscarPorId(id) {
  return UNIDADES.find(u => u.id === id) || null;
}

// Busca una unidad por su correo
function buscarPorCorreo(correo) {
  return UNIDADES.find(u => u.correo === correo.toLowerCase()) || null;
}

module.exports = {
  UNIDADES,
  MAPEO_TIPO_UNIDAD,
  haversine,
  buscarUnidadesCercanas,
  buscarUnidadPrincipal,
  buscarPorId,
  buscarPorCorreo
};
