// Dashboard KPI y Data Science para operadores
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BarraNavegacion from '../../componentes/comunes/BarraNavegacion';
import Cargando from '../../componentes/comunes/Cargando';
import { obtenerResumenAnalitica } from '../../servicios/analitica.servicio';

const COLORES = ['#4F7BFF', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#14B8A6', '#F97316', '#38BDF8'];

function formatearNumero(valor) {
  if (valor === null || valor === undefined) return 'N/D';
  return Number(valor).toLocaleString('es-EC');
}

function normalizarSerie(serie = []) {
  const maximo = Math.max(...serie.map(item => item.valor), 1);
  return serie.map((item, index) => ({ ...item, porcentaje: (item.valor / maximo) * 100, color: COLORES[index % COLORES.length] }));
}

function TarjetaKpi({ titulo, valor, detalle, tono = 'azul' }) {
  return (
    <div className={`kpi-tarjeta kpi-${tono}`}>
      <span className="kpi-titulo">{titulo}</span>
      <strong className="kpi-valor">{valor}</strong>
      {detalle && <span className="kpi-detalle">{detalle}</span>}
    </div>
  );
}

function GraficoBarras({ titulo, datos = [], compacto = false }) {
  const serie = normalizarSerie(datos);
  return (
    <section className="panel-analitica">
      <h2>{titulo}</h2>
      <div className={`barras-analitica ${compacto ? 'compacto' : ''}`}>
        {serie.map(item => (
          <div className="barra-fila" key={item.label}>
            <span className="barra-label" title={item.label}>{item.label}</span>
            <div className="barra-pista">
              <div className="barra-relleno" style={{ width: `${item.porcentaje}%`, background: item.color }} />
            </div>
            <span className="barra-valor">{formatearNumero(item.valor)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GraficoLinea({ titulo, datos = [] }) {
  const ancho = 720;
  const alto = 220;
  const margen = 28;
  const maximo = Math.max(...datos.map(d => d.valor), 1);
  const puntos = datos.map((d, index) => {
    const x = margen + (index / Math.max(datos.length - 1, 1)) * (ancho - margen * 2);
    const y = alto - margen - (d.valor / maximo) * (alto - margen * 2);
    return { ...d, x, y };
  });
  const path = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <section className="panel-analitica panel-ancho">
      <h2>{titulo}</h2>
      <svg className="linea-svg" viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={titulo}>
        <line x1={margen} y1={alto - margen} x2={ancho - margen} y2={alto - margen} className="eje" />
        <line x1={margen} y1={margen} x2={margen} y2={alto - margen} className="eje" />
        <path d={path} className="linea-path" />
        {puntos.map((p, index) => (
          <g key={`${p.label}-${index}`}>
            <circle cx={p.x} cy={p.y} r="4" className="linea-punto" />
            {index % 3 === 0 && <text x={p.x} y={alto - 8} textAnchor="middle" className="linea-label">{p.label.replace(':00', '')}</text>}
          </g>
        ))}
      </svg>
    </section>
  );
}

function GraficoDonut({ titulo, datos = [] }) {
  const total = datos.reduce((sum, item) => sum + item.valor, 0) || 1;
  let acumulado = 0;
  const segmentos = datos.map((item, index) => {
    const inicio = acumulado / total;
    acumulado += item.valor;
    const fin = acumulado / total;
    return { ...item, inicio, fin, color: COLORES[index % COLORES.length] };
  });

  function puntoEnCirculo(valor) {
    const angulo = valor * Math.PI * 2 - Math.PI / 2;
    return [50 + Math.cos(angulo) * 36, 50 + Math.sin(angulo) * 36];
  }

  function segmentoPath(segmento) {
    const [x1, y1] = puntoEnCirculo(segmento.inicio);
    const [x2, y2] = puntoEnCirculo(segmento.fin);
    const grande = segmento.fin - segmento.inicio > 0.5 ? 1 : 0;
    return `M 50 50 L ${x1} ${y1} A 36 36 0 ${grande} 1 ${x2} ${y2} Z`;
  }

  return (
    <section className="panel-analitica">
      <h2>{titulo}</h2>
      <div className="donut-layout">
        <svg viewBox="0 0 100 100" className="donut-svg" role="img" aria-label={titulo}>
          {segmentos.map(segmento => <path key={segmento.label} d={segmentoPath(segmento)} fill={segmento.color} />)}
          <circle cx="50" cy="50" r="22" className="donut-centro" />
          <text x="50" y="54" textAnchor="middle" className="donut-total">{formatearNumero(total)}</text>
        </svg>
        <div className="donut-leyenda">
          {segmentos.slice(0, 6).map(segmento => (
            <div key={segmento.label} className="leyenda-item">
              <span style={{ background: segmento.color }} />
              <strong>{segmento.label}</strong>
              <small>{formatearNumero(segmento.valor)}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NubePalabras({ datos = [] }) {
  const maximo = Math.max(...datos.map(d => d.valor), 1);
  return (
    <section className="panel-analitica panel-ancho">
      <h2>Palabras frecuentes en infracciones</h2>
      <div className="nube-palabras">
        {datos.slice(0, 28).map((item, index) => (
          <span
            key={item.label}
            style={{
              fontSize: `${0.75 + (item.valor / maximo) * 1.15}rem`,
              color: COLORES[index % COLORES.length]
            }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function MapaCalorAnalitica({ puntosHistoricos = [], puntosReportes = [] }) {
  const ref = useRef(null);
  const mapaRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapaRef.current) return;
    const mapa = L.map(ref.current, { center: [-1.6, -78.6], zoom: 7 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap, CARTO',
      maxZoom: 19
    }).addTo(mapa);
    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const capas = [];
    const maxHistorico = Math.max(...puntosHistoricos.map(p => p.conteo), 1);

    puntosHistoricos.forEach(punto => {
      const intensidad = punto.conteo / maxHistorico;
      const capa = L.circleMarker([punto.lat, punto.lng], {
        radius: 3 + intensidad * 18,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.08 + intensidad * 0.42,
        opacity: 0.2,
        weight: 1
      }).addTo(mapa).bindPopup(`Histórico: ${formatearNumero(punto.conteo)} registros`);
      capas.push(capa);
    });

    puntosReportes.forEach(punto => {
      const capa = L.circleMarker([punto.lat, punto.lng], {
        radius: 10 + punto.conteo * 2,
        color: '#5EC8FF',
        fillColor: '#5EC8FF',
        fillOpacity: 0.65,
        opacity: 0.9,
        weight: 2
      }).addTo(mapa).bindPopup(`<strong>${punto.tipo}</strong><br>${punto.gravedad}<br>${punto.descripcion || ''}`);
      capas.push(capa);
    });

    const todos = [...puntosHistoricos, ...puntosReportes].filter(p => p.lat && p.lng);
    if (todos.length) {
      mapa.fitBounds(L.latLngBounds(todos.slice(0, 120).map(p => [p.lat, p.lng])).pad(0.12));
    }

    return () => capas.forEach(capa => capa.remove());
  }, [puntosHistoricos, puntosReportes]);

  return (
    <section className="panel-analitica panel-mapa">
      <h2>Mapa de calor histórico y reportes actuales</h2>
      <div ref={ref} className="mapa-analitica" />
    </section>
  );
}

function TablaRiesgo({ datos = [] }) {
  return (
    <section className="panel-analitica panel-ancho">
      <h2>Ranking de riesgo por distrito</h2>
      <div className="tabla-scroll">
        <table className="tabla-analitica">
          <thead>
            <tr>
              <th>Distrito</th>
              <th>Score</th>
              <th>Total</th>
              <th>Con arma</th>
              <th>Nocturnos</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(item => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{formatearNumero(item.valor)}</td>
                <td>{formatearNumero(item.total)}</td>
                <td>{formatearNumero(item.conArma)}</td>
                <td>{formatearNumero(item.nocturnos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TablaRecientes({ datos = [] }) {
  return (
    <section className="panel-analitica panel-ancho">
      <h2>Reportes recientes del sistema</h2>
      <div className="tabla-scroll">
        <table className="tabla-analitica">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Gravedad</th>
              <th>Estado</th>
              <th>Unidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 && (
              <tr><td colSpan="5">Aún no hay reportes registrados en esta ejecución.</td></tr>
            )}
            {datos.map(item => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td><span className={`badge badge-${item.gravedad}`}>{item.gravedad}</span></td>
                <td>{item.estado}</td>
                <td>{item.unidad}</td>
                <td>{item.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardAnalitica() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await obtenerResumenAnalitica();
        setDatos(respuesta.datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const historico = datos?.historico;
  const reportes = datos?.reportes;
  const resumen = useMemo(() => {
    if (!historico || !reportes) return null;
    return {
      totalHistorico: formatearNumero(historico.kpis.totalRegistros),
      geo: `${historico.kpis.porcentajeGeorreferenciado}%`,
      edad: historico.kpis.promedioEdad,
      arma: `${historico.kpis.porcentajeConArma}%`,
      totalReportes: formatearNumero(reportes.kpis.totalReportes),
      activos: formatearNumero(reportes.kpis.reportesActivos),
      criticos: formatearNumero(reportes.kpis.reportesCriticos)
    };
  }, [historico, reportes]);

  if (cargando) return <><BarraNavegacion /><Cargando /></>;

  return (
    <>
      <BarraNavegacion />
      <main className="contenido-principal dashboard-analitica" id="dashboard-analitica">
        <div className="encabezado-seccion">
          <div>
            <h1 className="titulo-seccion">Dashboard KPI</h1>
            <p className="subtitulo-analitica">Data Science aplicado a emergencias, incidencias históricas y reportes operativos.</p>
          </div>
          <button className="btn btn-secundario btn-pequeno" onClick={() => navigate('/operador')}>
            Volver
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {resumen && (
          <>
            <section className="grid-kpis">
              <TarjetaKpi titulo="Registros históricos" valor={resumen.totalHistorico} detalle={historico.kpis.infraccionMayorIncidencia} />
              <TarjetaKpi titulo="Georreferenciación" valor={resumen.geo} detalle={`${formatearNumero(historico.kpis.totalGeorreferenciados)} puntos válidos`} tono="verde" />
              <TarjetaKpi titulo="Edad promedio" valor={resumen.edad} detalle={`Mediana ${historico.kpis.medianaEdad}`} tono="ambar" />
              <TarjetaKpi titulo="Casos con arma" valor={resumen.arma} detalle="Dataset de detenidos/aprehendidos" tono="rojo" />
              <TarjetaKpi titulo="Reportes app" valor={resumen.totalReportes} detalle={`${resumen.activos} activos`} tono="azul" />
              <TarjetaKpi titulo="Críticos app" valor={resumen.criticos} detalle={`${reportes.kpis.porcentajeCriticos}% del total`} tono="rojo" />
            </section>

            <div className="grid-analitica">
              <MapaCalorAnalitica puntosHistoricos={historico.mapaCalor} puntosReportes={reportes.mapaCalor} />
              <GraficoBarras titulo="Top infracciones históricas" datos={historico.distribuciones.infraccion} />
              <GraficoDonut titulo="Tipos de evento histórico" datos={historico.distribuciones.tipo} />
              <GraficoLinea titulo="Incidencia por hora" datos={historico.distribuciones.hora} />
              <GraficoBarras titulo="Top provincias" datos={historico.distribuciones.provincia} compacto />
              <GraficoBarras titulo="Gravedad de reportes app" datos={reportes.distribuciones.gravedad} compacto />
              <NubePalabras datos={historico.distribuciones.palabrasInfraccion} />
              <TablaRiesgo datos={historico.distribuciones.riesgoDistrito} />
              <TablaRecientes datos={reportes.recientes} />
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default DashboardAnalitica;
