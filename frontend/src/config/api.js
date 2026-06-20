// Configuracion base para las llamadas a la API
const BASE_URL = '/api';

// Realiza una peticion HTTP con headers de autenticacion
async function peticionAPI(ruta, opciones = {}) {
  const token = localStorage.getItem('token');

  const config = {
    method: 'GET',
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers
    }
  };

  const respuesta = await fetch(`${BASE_URL}${ruta}`, config);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Error en la peticion');
  }

  return datos;
}

export { BASE_URL, peticionAPI };
