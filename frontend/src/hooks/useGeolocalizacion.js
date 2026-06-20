// Hook para obtener la geolocalizacion del dispositivo
import { useState, useCallback } from 'react';

function useGeolocalizacion() {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Solicita la ubicacion actual del dispositivo
  const obtenerUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizacion no soportada en este navegador');
      return;
    }

    setCargando(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const coords = {
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
          direccion: `Lat: ${posicion.coords.latitude.toFixed(4)}, Lng: ${posicion.coords.longitude.toFixed(4)}`
        };
        setUbicacion(coords);
        setCargando(false);
      },
      (err) => {
        setError('No se pudo obtener la ubicacion: ' + err.message);
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ubicacion, cargando, error, obtenerUbicacion, setUbicacion };
}

export default useGeolocalizacion;
