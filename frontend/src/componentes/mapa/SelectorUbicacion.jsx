// Selector de ubicacion interactivo con mapa - el usuario hace clic para marcar el punto
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EMERGENCIA } from '../../datos/emergencia.datos';

function SelectorUbicacion({ abierto, alSeleccionar, alCerrar }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const [coordenadas, setCoordenadas] = useState(null);

  // Inicializa el mapa cuando se abre el selector
  useEffect(() => {
    if (!abierto || !contenedorRef.current) return;

    // Limpia mapa anterior
    if (mapaRef.current) { mapaRef.current.remove(); mapaRef.current = null; }

    // Espera un frame para que el DOM se monte
    const timer = setTimeout(() => {
      if (!contenedorRef.current) return;

      const mapa = L.map(contenedorRef.current, {
        center: [-0.1807, -78.4678],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'OpenStreetMap, CARTO',
        maxZoom: 19
      }).addTo(mapa);

      // Agrega los puntos de referencia de servicios de emergencia
      const crearIcono = (color, emoji) => L.divIcon({
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,0.4);opacity:0.6;">${emoji}</div>`,
        className: '', iconSize: [22, 22], iconAnchor: [11, 11]
      });

      EMERGENCIA.policia.forEach(s => {
        L.marker([s.lat, s.lng], { icon: crearIcono('#3b82f6', '🚔') })
          .addTo(mapa).bindPopup(`<strong>${s.nombre}</strong><br><small>${s.direccion}</small>`);
      });
      EMERGENCIA.bomberos.forEach(s => {
        L.marker([s.lat, s.lng], { icon: crearIcono('#eab308', '🚒') })
          .addTo(mapa).bindPopup(`<strong>${s.nombre}</strong>`);
      });
      EMERGENCIA.hospitales.forEach(s => {
        L.marker([s.lat, s.lng], { icon: crearIcono('#ef4444', '🏥') })
          .addTo(mapa).bindPopup(`<strong>${s.nombre}</strong>`);
      });

      // Al hacer clic en el mapa, coloca el marcador de alerta
      mapa.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setCoordenadas({ lat, lng });

        if (marcadorRef.current) {
          marcadorRef.current.setLatLng([lat, lng]);
        } else {
          const iconoAlerta = L.divIcon({
            html: `<div style="width:36px;height:36px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 16px rgba(239,68,68,0.6);border:3px solid rgba(255,255,255,0.3);animation:pulso-alerta 1.5s infinite;">🚨</div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18]
          });
          marcadorRef.current = L.marker([lat, lng], { icon: iconoAlerta, draggable: true }).addTo(mapa);

          // Permite arrastrar el marcador
          marcadorRef.current.on('dragend', () => {
            const pos = marcadorRef.current.getLatLng();
            setCoordenadas({ lat: pos.lat, lng: pos.lng });
          });
        }
      });

      mapaRef.current = mapa;

      // Invalida el tamaño después de que el modal se renderice
      setTimeout(() => mapa.invalidateSize(), 100);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapaRef.current) { mapaRef.current.remove(); mapaRef.current = null; }
      marcadorRef.current = null;
      setCoordenadas(null);
    };
  }, [abierto]);

  if (!abierto) return null;

  // Confirma la ubicacion seleccionada
  function confirmar() {
    if (!coordenadas) return;
    alSeleccionar({
      lat: coordenadas.lat,
      lng: coordenadas.lng,
      direccion: `Lat: ${coordenadas.lat.toFixed(5)}, Lng: ${coordenadas.lng.toFixed(5)}`
    });
  }

  return (
    <div className="selector-mapa-overlay" id="selector-ubicacion">
      <div className="selector-mapa-contenedor">
        <div className="selector-mapa-header">
          <h3>Selecciona la ubicacion de la emergencia</h3>
          <button className="modal-cerrar" onClick={alCerrar}>X</button>
        </div>
        <div className="selector-mapa-info">
          Haz clic en el mapa para colocar el punto de la emergencia. Puedes arrastrarlo para ajustar.
        </div>
        <div className="selector-mapa-area" ref={contenedorRef} />
        <div className="selector-mapa-footer">
          <div className="selector-mapa-coords">
            {coordenadas
              ? `Lat: ${coordenadas.lat.toFixed(5)}, Lng: ${coordenadas.lng.toFixed(5)}`
              : 'Ningun punto seleccionado'
            }
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secundario btn-pequeno" onClick={alCerrar}>Cancelar</button>
            <button
              className="btn btn-primario btn-pequeno"
              onClick={confirmar}
              disabled={!coordenadas}
              id="btn-confirmar-ubicacion"
            >
              Confirmar ubicacion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectorUbicacion;
