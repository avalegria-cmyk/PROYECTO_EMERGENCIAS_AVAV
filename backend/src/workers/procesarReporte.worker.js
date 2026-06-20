// Worker thread para clasificar la gravedad de un reporte
// Se ejecuta en un hilo separado para no bloquear el hilo principal
const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');

// Reglas de clasificacion por tipo de emergencia
const REGLAS_GRAVEDAD = {
  incendio: 'critica',
  desastre_natural: 'critica',
  robo: 'alta',
  accidente: 'media',
  otro: 'baja'
};

const ORDEN_GRAVEDAD = ['baja', 'media', 'alta', 'critica'];
const VALOR_GRAVEDAD = { baja: 1, media: 2, alta: 3, critica: 4 };
const RUTA_CSV_GRAVEDAD = path.resolve(__dirname, '..', 'datos', 'gravedad');

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cargarCsvGravedad(gravedad) {
  const archivo = path.join(RUTA_CSV_GRAVEDAD, `${gravedad}.csv`);
  const contenido = fs.readFileSync(archivo, 'utf8');

  return contenido
    .split(/\r?\n/)
    .slice(1)
    .map(linea => linea.trim())
    .filter(Boolean)
    .map(linea => {
      const [palabra, peso] = linea.split(',');
      return {
        palabra: normalizar(palabra),
        peso: Number(peso || VALOR_GRAVEDAD[gravedad])
      };
    })
    .filter(regla => regla.palabra);
}

const PALABRAS_POR_GRAVEDAD = Object.fromEntries(
  ORDEN_GRAVEDAD.map(gravedad => [gravedad, cargarCsvGravedad(gravedad)])
);

// Clasifica la gravedad segun tipo y descripcion del reporte
function clasificarGravedad(reporte) {
  let gravedad = REGLAS_GRAVEDAD[reporte.tipo] || 'baja';
  let puntaje = VALOR_GRAVEDAD[gravedad] || VALOR_GRAVEDAD.baja;
  const descripcion = normalizar(reporte.descripcion);

  for (const gravedadCandidata of ORDEN_GRAVEDAD) {
    for (const regla of PALABRAS_POR_GRAVEDAD[gravedadCandidata]) {
      if (descripcion.includes(regla.palabra) && regla.peso > puntaje) {
        puntaje = regla.peso;
        gravedad = gravedadCandidata;
      }
    }
  }

  return gravedad;
}

// Escucha mensajes del hilo principal
if (parentPort) parentPort.on('message', (reporte) => {
  const gravedad = clasificarGravedad(reporte);

  // Simula tiempo de procesamiento de una IA real
  setTimeout(() => {
    parentPort.postMessage({
      reporteId: reporte.id,
      gravedad
    });
  }, 200);
});

module.exports = { clasificarGravedad, normalizar, PALABRAS_POR_GRAVEDAD };
