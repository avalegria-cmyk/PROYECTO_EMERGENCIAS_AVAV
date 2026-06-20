// Mapa con marcadores de reportes y servicios de emergencia de Quito
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EMERGENCIA } from '../../datos/emergencia.datos';

// Colores de marcador segun gravedad
const COLORES_GRAVEDAD = {
  baja: '#22c55e',
  media: '#f59e0b',
  alta: '#ef4444',
  critica: '#dc2626'
};

// Crea un icono SVG de circulo por gravedad
function crearIconoGravedad(gravedad) {
  const color = COLORES_GRAVEDAD[gravedad] || '#6366f1';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2.5"/>
      <circle cx="14" cy="14" r="5" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

// Crea un icono de servicio de emergencia
function crearIconoServicio(color, emoji) {
  return L.divIcon({
    html: `<div style="
      width:30px;height:30px;border-radius:50%;
      background:${color};display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.5);
      border:2px solid rgba(255,255,255,0.2);
    ">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

function MapaReportes({ reportes, alClickReporte }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadoresReportesRef = useRef([]);

  // Inicializa el mapa con el tile oscuro y los puntos de servicios de emergencia
  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const mapa = L.map(contenedorRef.current, {
      center: [-0.1807, -78.4678],
      zoom: 13,
      zoomControl: true
    });

    // Tile oscuro estilo CARTO para el tema neumorphism
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap, CARTO',
      maxZoom: 19
    }).addTo(mapa);

    // Agrega marcadores de servicios de emergencia de Quito
    EMERGENCIA.policia.forEach(s => {
      L.marker([s.lat, s.lng], { icon: crearIconoServicio('#3b82f6', '🚔') })
        .addTo(mapa)
        .bindPopup(`<strong style="color:#3b82f6">🚔 ${s.nombre}</strong><br><span style="color:#94A3B8;font-size:11px">${s.direccion}</span>`);
    });

    EMERGENCIA.bomberos.forEach(s => {
      L.marker([s.lat, s.lng], { icon: crearIconoServicio('#eab308', '🚒') })
        .addTo(mapa)
        .bindPopup(`<strong style="color:#eab308">🚒 ${s.nombre}</strong><br><span style="color:#94A3B8;font-size:11px">${s.direccion}</span>`);
    });

    EMERGENCIA.hospitales.forEach(s => {
      L.marker([s.lat, s.lng], { icon: crearIconoServicio('#ef4444', '🏥') })
        .addTo(mapa)
        .bindPopup(`<strong style="color:#ef4444">🏥 ${s.nombre}</strong><br><span style="color:#94A3B8;font-size:11px">${s.direccion}${s.telefono ? ` | ${s.telefono}` : ''}</span>`);
    });

    EMERGENCIA.ecu911.forEach(s => {
      L.marker([s.lat, s.lng], { icon: crearIconoServicio('#22c55e', '🆘') })
        .addTo(mapa)
        .bindPopup(`<strong style="color:#22c55e">🆘 ${s.nombre}</strong><br><span style="color:#94A3B8;font-size:11px">${s.direccion}</span>`);
    });

    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  // Actualiza marcadores de reportes cuando cambian
  useEffect(() => {
    if (!mapaRef.current) return;

    // Limpia marcadores de reportes anteriores
    marcadoresReportesRef.current.forEach(m => m.remove());
    marcadoresReportesRef.current = [];

    if (!reportes || reportes.length === 0) return;

    reportes.forEach(reporte => {
      if (!reporte.ubicacion || !reporte.ubicacion.lat) return;

      const marcador = L.marker(
        [reporte.ubicacion.lat, reporte.ubicacion.lng],
        { icon: crearIconoGravedad(reporte.gravedad) }
      )
        .addTo(mapaRef.current)
        .bindPopup(`
          <strong>${reporte.tipo}</strong><br/>
          <span>${reporte.descripcion?.slice(0, 80) || ''}</span><br/>
          <small>Gravedad: ${reporte.gravedad}</small>
        `);

      if (alClickReporte) {
        marcador.on('click', () => alClickReporte(reporte));
      }

      marcadoresReportesRef.current.push(marcador);
    });
  }, [reportes, alClickReporte]);

  return (
    <div className="contenedor-mapa" id="mapa-reportes">
      <div ref={contenedorRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default MapaReportes;
