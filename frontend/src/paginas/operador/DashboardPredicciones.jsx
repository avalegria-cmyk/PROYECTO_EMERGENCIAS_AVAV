// Dashboard de predicciones operativas para operadores
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BarraNavegacion from '../../componentes/comunes/BarraNavegacion';
import Cargando from '../../componentes/comunes/Cargando';
import { obtenerResumenPredicciones } from '../../servicios/predicciones.servicio';

const COLORES = ['#4F7BFF', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#14B8A6'];

function num(valor) {
  return Number(valor || 0).toLocaleString('es-EC');
}

function TarjetaPred({ titulo, valor, detalle }) {
  return (
    <div className="kpi-tarjeta">
      <span className="kpi-titulo">{titulo}</span>
      <strong className="kpi-valor">{valor}</strong>
      <span className="kpi-detalle">{detalle}</span>
    </div>
  );
}

function ExplicacionModelo() {
  return (
    <section className="panel-analitica pred-explicacion">
      <h2>Cómo funciona el modelo</h2>
      <div className="pred-explicacion-grid">
        <div>
          <strong>Zona con mayor riesgo</strong>
          <p>Calcula un score por distrito usando volumen histórico, casos con arma y eventos nocturnos.</p>
        </div>
        <div>
          <strong>Horario probable</strong>
          <p>Estima la probabilidad de cada hora según la distribución histórica de incidentes.</p>
        </div>
        <div>
          <strong>Forecast</strong>
          <p>Proyecta 14 días usando promedio por día de semana y una tendencia reciente suavizada.</p>
        </div>
      </div>
    </section>
  );
}

function BarrasPred({ titulo, datos, labelKey = 'label', valueKey = 'valor' }) {
  const maximo = Math.max(...datos.map(d => d[valueKey]), 1);
  return (
    <section className="panel-analitica pred-panel">
      <h2>{titulo}</h2>
      <div className="barras-analitica">
        {datos.map((item, index) => (
          <div className="barra-fila" key={`${item[labelKey]}-${index}`}>
            <span className="barra-label">{item[labelKey]}</span>
            <div className="barra-pista">
              <div
                className="barra-relleno"
                style={{ width: `${(item[valueKey] / maximo) * 100}%`, background: COLORES[index % COLORES.length] }}
              />
            </div>
            <span className="barra-valor">{valueKey.includes('probabilidad') ? `${Math.round(item[valueKey] * 100)}%` : num(item[valueKey])}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForecastTabla({ datos }) {
  return (
    <section className="panel-analitica pred-panel pred-span-2">
      <h2>Forecast de incidentes por día</h2>
      <div className="forecast-grid">
        {datos.map(item => (
          <div key={item.fecha} className="forecast-dia">
            <span>{item.dia}</span>
            <strong>{item.incidentesPredichos}</strong>
            <small>{item.fecha}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function TablaDiaHora({ datos }) {
  return (
    <section className="panel-analitica pred-panel pred-span-2">
      <h2>Ventanas día-hora con mayor probabilidad</h2>
      <div className="tabla-scroll">
        <table className="tabla-analitica">
          <thead>
            <tr><th>Fecha</th><th>Día</th><th>Hora</th><th>Incidentes esperados</th><th>Prob. hora</th></tr>
          </thead>
          <tbody>
            {datos.map((item, index) => (
              <tr key={`${item.fecha}-${item.hora}-${index}`}>
                <td>{item.fecha}</td>
                <td>{item.dia}</td>
                <td>{item.hora}</td>
                <td>{item.incidentesPredichos}</td>
                <td>{Math.round(item.probabilidadHora * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TablaZonas({ datos }) {
  return (
    <section className="panel-analitica pred-panel pred-span-2">
      <h2>Zonas con mayor riesgo predicho</h2>
      <div className="tabla-scroll">
        <table className="tabla-analitica">
          <thead>
            <tr><th>Distrito</th><th>Cantón</th><th>Provincia</th><th>Score</th><th>Prob. relativa</th><th>Total</th><th>Con arma</th></tr>
          </thead>
          <tbody>
            {datos.map(item => (
              <tr key={`${item.provincia}-${item.canton}-${item.distrito}`}>
                <td>{item.distrito}</td>
                <td>{item.canton}</td>
                <td>{item.provincia}</td>
                <td>{item.score}</td>
                <td>{Math.round(item.probabilidadRelativa * 100)}%</td>
                <td>{num(item.total)}</td>
                <td>{num(item.conArma)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MapaRiesgoPred({ puntos }) {
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
    const capas = puntos.map(p => L.circleMarker([p.lat, p.lng], {
      radius: 4 + p.score * 18,
      color: '#F59E0B',
      fillColor: p.score > 0.55 ? '#EF4444' : '#F59E0B',
      fillOpacity: 0.18 + p.score * 0.48,
      opacity: 0.8,
      weight: 1
    }).addTo(mapa).bindPopup(`Riesgo relativo: ${Math.round(p.score * 100)}%<br>Histórico: ${num(p.conteoHistorico)}`));
    if (puntos.length) {
      mapa.fitBounds(L.latLngBounds(puntos.slice(0, 120).map(p => [p.lat, p.lng])).pad(0.15));
    }
    return () => capas.forEach(c => c.remove());
  }, [puntos]);

  return (
    <section className="panel-analitica pred-panel pred-mapa">
      <h2>Mapa predictivo de riesgo</h2>
      <div ref={ref} className="mapa-analitica" />
    </section>
  );
}

function DashboardPredicciones() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await obtenerResumenPredicciones();
        setDatos(respuesta.datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const topHoras = useMemo(() => (
    datos?.predicciones.horasProbables
      .slice()
      .sort((a, b) => b.probabilidad - a.probabilidad)
      .slice(0, 8) || []
  ), [datos]);

  const topDias = useMemo(() => (
    datos?.predicciones.diasProbables
      .slice()
      .sort((a, b) => b.probabilidad - a.probabilidad) || []
  ), [datos]);

  if (cargando) return <><BarraNavegacion /><Cargando /></>;

  return (
    <>
      <BarraNavegacion />
      <main className="contenido-principal dashboard-analitica dashboard-predicciones" id="dashboard-predicciones">
        <div className="encabezado-seccion">
          <div>
            <h1 className="titulo-seccion">Predicciones operativas</h1>
            <p className="subtitulo-analitica">Forecast estadístico de zonas, horarios y ventanas de mayor riesgo.</p>
          </div>
          <button className="btn btn-secundario btn-pequeno" onClick={() => navigate('/operador')}>Volver</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {datos && (
          <>
            <section className="grid-kpis pred-kpis">
              <TarjetaPred titulo="Zona mayor riesgo" valor={datos.kpis.zonaMayorRiesgo} detalle={datos.kpis.cantonMayorRiesgo} />
              <TarjetaPred titulo="Hora más probable" valor={datos.kpis.horaMayorProbabilidad} detalle="Distribución histórica por hora" />
              <TarjetaPred titulo="Día más probable" valor={datos.kpis.diaMayorProbabilidad} detalle="Distribución histórica semanal" />
              <TarjetaPred titulo="Forecast diario" valor={datos.kpis.forecastPromedioDiario} detalle="Promedio esperado de incidentes" />
              <TarjetaPred titulo="Modelo" valor="Baseline" detalle="Estadístico e interpretable" />
              <TarjetaPred titulo="Tendencia" valor={`${Math.round(datos.kpis.tendenciaFactor * 100)}%`} detalle="Factor aplicado al forecast" />
            </section>

            <ExplicacionModelo />

            <section className="panel-analitica pred-panel pred-recomendaciones">
              <h2>Recomendaciones automáticas</h2>
              <div className="recomendaciones-pred">
                {datos.predicciones.recomendaciones.map(rec => <span key={rec}>{rec}</span>)}
              </div>
            </section>

            <div className="grid-analitica pred-grid">
              <MapaRiesgoPred puntos={datos.predicciones.mapaRiesgo} />
              <BarrasPred titulo="Horas más probables" datos={topHoras} labelKey="label" valueKey="probabilidad" />
              <BarrasPred titulo="Días más probables" datos={topDias} labelKey="dia" valueKey="probabilidad" />
              <ForecastTabla datos={datos.predicciones.forecastDiario} />
              <TablaDiaHora datos={datos.predicciones.forecastDiaHora} />
              <TablaZonas datos={datos.predicciones.zonasRiesgo} />
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default DashboardPredicciones;
