// Mapa con ruta del operador a la emergencia usando OSRM y datos reales de Quito
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EMERGENCIA, NODOS_GRAFO, ARISTAS_GRAFO } from '../../datos/emergencia.datos';

// Velocidad promedio para calcular ETA
const VELOCIDAD_KMH = 35;

// Calcula la distancia Haversine entre dos puntos
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Construye la lista de adyacencia del grafo vial
function construirAdyacencia() {
  const adj = {};
  Object.keys(NODOS_GRAFO).forEach(n => adj[n] = []);
  ARISTAS_GRAFO.forEach(([x, y]) => {
    const nx = NODOS_GRAFO[x], ny = NODOS_GRAFO[y];
    const d = haversine(nx.lat, nx.lng, ny.lat, ny.lng) * 1.25;
    adj[x].push({ nodo: y, peso: d });
    adj[y].push({ nodo: x, peso: d });
  });
  return adj;
}

// Encuentra el nodo mas cercano a una coordenada
function nodoMasCercano(lat, lng) {
  let mejor = null, mejorDist = Infinity;
  for (const [id, n] of Object.entries(NODOS_GRAFO)) {
    const d = haversine(lat, lng, n.lat, n.lng);
    if (d < mejorDist) { mejorDist = d; mejor = id; }
  }
  return mejor;
}

// Algoritmo Dijkstra para ruta mas corta
function dijkstra(adj, inicio, fin) {
  const dist = {}, prev = {}, visitados = new Set();
  Object.keys(adj).forEach(n => { dist[n] = Infinity; prev[n] = null; });
  dist[inicio] = 0;

  while (true) {
    let u = null, minDist = Infinity;
    for (const n of Object.keys(adj)) {
      if (!visitados.has(n) && dist[n] < minDist) { minDist = dist[n]; u = n; }
    }
    if (u === null || u === fin) break;
    visitados.add(u);
    for (const { nodo: w, peso: p } of adj[u]) {
      if (!visitados.has(w) && dist[u] + p < dist[w]) { dist[w] = dist[u] + p; prev[w] = u; }
    }
  }

  const ruta = [];
  let c = fin;
  while (c) { ruta.unshift(c); c = prev[c]; }
  if (ruta[0] !== inicio) return { ruta: [], distancia: Infinity };
  return { ruta, distancia: dist[fin] };
}

function interpolarEnRuta(coordenadas, progreso) {
  if (coordenadas.length <= 1) return coordenadas[0] || null;

  const segmentos = [];
  let distanciaTotal = 0;

  for (let i = 1; i < coordenadas.length; i++) {
    const anterior = coordenadas[i - 1];
    const actual = coordenadas[i];
    const distancia = haversine(anterior[0], anterior[1], actual[0], actual[1]);
    segmentos.push({ anterior, actual, distancia });
    distanciaTotal += distancia;
  }

  if (distanciaTotal === 0) return coordenadas[coordenadas.length - 1];

  let distanciaObjetivo = distanciaTotal * progreso;
  for (const segmento of segmentos) {
    if (distanciaObjetivo <= segmento.distancia) {
      const t = segmento.distancia === 0 ? 1 : distanciaObjetivo / segmento.distancia;
      return [
        segmento.anterior[0] + (segmento.actual[0] - segmento.anterior[0]) * t,
        segmento.anterior[1] + (segmento.actual[1] - segmento.anterior[1]) * t
      ];
    }
    distanciaObjetivo -= segmento.distancia;
  }

  return coordenadas[coordenadas.length - 1];
}

function MapaRuta({ ubicacionEmergencia, unidadAsignada, estadoReporte }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorUnidadRef = useRef(null);
  const animacionRef = useRef(null);
  const [unidadCercana, setUnidadCercana] = useState(null);
  const [rutaCoordenadas, setRutaCoordenadas] = useState([]);

  // Calcula la unidad mas cercana con Dijkstra cuando no hay unidad asignada
  useEffect(() => {
    if (!ubicacionEmergencia) return;

    const adj = construirAdyacencia();
    const nodoDestino = nodoMasCercano(ubicacionEmergencia.lat, ubicacionEmergencia.lng);

    const resultados = EMERGENCIA.policia.map(unidad => {
      const nodoOrigen = nodoMasCercano(unidad.lat, unidad.lng);
      const r = dijkstra(adj, nodoOrigen, nodoDestino);
      const extra = haversine(unidad.lat, unidad.lng, NODOS_GRAFO[nodoOrigen].lat, NODOS_GRAFO[nodoOrigen].lng);
      return {
        unidad,
        ruta: r.ruta,
        distancia: r.distancia + extra,
        eta: ((r.distancia + extra) / VELOCIDAD_KMH) * 60
      };
    }).filter(e => e.ruta.length > 0).sort((a, b) => a.distancia - b.distancia);

    if (resultados.length > 0) {
      setUnidadCercana(resultados[0]);
    }
  }, [ubicacionEmergencia]);

  // Maneja la animacion de la unidad sobre la ruta dibujada
  useEffect(() => {
    if (!marcadorUnidadRef.current) return;

    const mapa = mapaRef.current;
    if (!mapa) return;

    const origen = unidadAsignada
      ? { lat: unidadAsignada.lat, lng: unidadAsignada.lng }
      : unidadCercana
        ? { lat: unidadCercana.unidad.lat, lng: unidadCercana.unidad.lng }
        : null;

    if (!origen || !ubicacionEmergencia) return;

    if (estadoReporte === 'resuelto') {
      marcadorUnidadRef.current.setLatLng([ubicacionEmergencia.lat, ubicacionEmergencia.lng]);
      return;
    }

    if (estadoReporte !== 'en_camino' && estadoReporte !== 'en_proceso') return;

    const coordenadasAnimacion = rutaCoordenadas.length >= 2
      ? rutaCoordenadas
      : [[origen.lat, origen.lng], [ubicacionEmergencia.lat, ubicacionEmergencia.lng]];
    const duracionMs = 9000;
    const inicioAnimacion = performance.now();

    function animarUnidad(timestamp) {
      const progreso = Math.min((timestamp - inicioAnimacion) / duracionMs, 1);
      const t = 1 - Math.pow(1 - progreso, 3);
      const posicion = interpolarEnRuta(coordenadasAnimacion, t);

      if (marcadorUnidadRef.current && posicion) {
        marcadorUnidadRef.current.setLatLng(posicion);
      }

      if (progreso < 1) {
        animacionRef.current = requestAnimationFrame(animarUnidad);
      } else {
        const el = marcadorUnidadRef.current?.getElement();
        if (el) {
          el.querySelector('.marcador-patrulla')?.classList.add('patrulla-llegada');
        }
      }
    }

    const el = marcadorUnidadRef.current?.getElement();
    if (el) {
      el.querySelector('.marcador-patrulla')?.classList.add('patrulla-brillo');
    }

    animacionRef.current = requestAnimationFrame(animarUnidad);

    return () => {
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, [estadoReporte, rutaCoordenadas, unidadAsignada, unidadCercana, ubicacionEmergencia]);

  // Dibuja el mapa con ruta OSRM
  useEffect(() => {
    if (!contenedorRef.current || !ubicacionEmergencia) return;
    let cancelado = false;

    if (mapaRef.current) { mapaRef.current.remove(); mapaRef.current = null; }
    marcadorUnidadRef.current = null;
    setRutaCoordenadas([]);

    const mapa = L.map(contenedorRef.current, {
      center: [ubicacionEmergencia.lat, ubicacionEmergencia.lng],
      zoom: 14
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap, CARTO',
      maxZoom: 19
    }).addTo(mapa);

    mapaRef.current = mapa;

    const origen = unidadAsignada
      ? { lat: unidadAsignada.lat, lng: unidadAsignada.lng, nombre: unidadAsignada.nombre, tipo: unidadAsignada.tipo }
      : unidadCercana
        ? { lat: unidadCercana.unidad.lat, lng: unidadCercana.unidad.lng, nombre: unidadCercana.unidad.nombre, tipo: unidadCercana.unidad.tipo }
        : null;

    if (origen) {
      const colorFondo = origen.tipo === 'bomberos' ? '#F97316' : origen.tipo === 'hospital' ? '#22C55E' : '#3B82F6';
      const emoji = origen.tipo === 'bomberos' ? '🔥' : origen.tipo === 'hospital' ? '🏥' : '🚔';
      
      const iconoOrigen = L.divIcon({
        html: `<div class="marcador-patrulla" style="width:34px;height:34px;border-radius:50%;background:${colorFondo};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 12px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.25);transition:transform 0.3s ease;">${emoji}</div>`,
        className: 'marcador-patrulla-contenedor', iconSize: [34, 34], iconAnchor: [17, 17]
      });

      const marcador = L.marker([origen.lat, origen.lng], { icon: iconoOrigen })
        .addTo(mapa)
        .bindPopup(`<strong>${origen.nombre}</strong><br>${unidadAsignada ? 'Unidad asignada' : 'Unidad mas cercana'}`);
      
      marcadorUnidadRef.current = marcador;
    }

    const iconoEm = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(239,68,68,0.5);border:2px solid rgba(255,255,255,0.2);animation:pulso-marcador 2s infinite;">🚨</div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    });
    L.marker([ubicacionEmergencia.lat, ubicacionEmergencia.lng], { icon: iconoEm })
      .addTo(mapa).bindPopup('🚨 Emergencia');

    if (origen) {
      obtenerRuta(mapa, origen, ubicacionEmergencia, () => cancelado);
    }

    const limites = origen
      ? L.latLngBounds([[origen.lat, origen.lng], [ubicacionEmergencia.lat, ubicacionEmergencia.lng]])
      : L.latLngBounds([[ubicacionEmergencia.lat, ubicacionEmergencia.lng], [ubicacionEmergencia.lat, ubicacionEmergencia.lng]]);

    mapa.fitBounds(limites.pad(0.2));

    return () => {
      cancelado = true;
      mapa.remove();
      mapaRef.current = null;
      marcadorUnidadRef.current = null;
      setRutaCoordenadas([]);
      if (animacionRef.current) cancelAnimationFrame(animacionRef.current);
    };
  }, [ubicacionEmergencia, unidadAsignada, unidadCercana]);

  // Consulta OSRM para la ruta y la dibuja
  async function obtenerRuta(mapa, origen, destino, estaCancelado = () => false) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos.routes && datos.routes.length > 0) {
        const coordenadas = datos.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        if (estaCancelado()) return;
        L.polyline(coordenadas, {
          color: '#4F7BFF', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round'
        }).addTo(mapa);
        setRutaCoordenadas(coordenadas);
      }
    } catch {
      const rutaFallback = [[origen.lat, origen.lng], [destino.lat, destino.lng]];
      if (estaCancelado()) return;
      L.polyline(rutaFallback, { color: '#4F7BFF', weight: 3, dashArray: '10, 10' }).addTo(mapa);
      setRutaCoordenadas(rutaFallback);
    }
  }

  if (!ubicacionEmergencia) {
    return (
      <div className="contenedor-mapa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--texto-secundario)' }}>Ubicacion no disponible</span>
      </div>
    );
  }

  return (
    <div className="contenedor-mapa" id="mapa-ruta">
      <div ref={contenedorRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default MapaRuta;
