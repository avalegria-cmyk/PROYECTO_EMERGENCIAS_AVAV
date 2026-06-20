// Panel principal del operador - reportes en tiempo real y mapa
import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BarraNavegacion from '../../componentes/comunes/BarraNavegacion';
import MapaReportes from '../../componentes/mapa/MapaReportes';
import Cargando from '../../componentes/comunes/Cargando';
import { AutenticacionContexto } from '../../contextos/AutenticacionContexto';
import { obtenerReportes } from '../../servicios/reportes.servicio';
import useSocket from '../../hooks/useSocket';

function PanelOperador() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertasAsignadas, setAlertasAsignadas] = useState([]);
  const { socket } = useSocket();
  const { usuario } = useContext(AutenticacionContexto);
  const navigate = useNavigate();

  // Carga los reportes al montar
  const cargarReportes = useCallback(async () => {
    try {
      const respuesta = await obtenerReportes();
      setReportes(respuesta.datos);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  // Escucha eventos de reportes en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on('reporte:nuevo', (reporte) => {
      setReportes(prev => [reporte, ...prev]);
    });

    socket.on('reporte:estadoCambiado', (reporteActualizado) => {
      setReportes(prev =>
        prev.map(r => r.id === reporteActualizado.id ? reporteActualizado : r)
      );
    });

    socket.on('reporte:gravedadActualizada', (reporteActualizado) => {
      setReportes(prev =>
        prev.map(r => r.id === reporteActualizado.id ? reporteActualizado : r)
      );
    });

    socket.on('reporte:unidadAsignada', (reporteActualizado) => {
      setReportes(prev =>
        prev.map(r => r.id === reporteActualizado.id ? reporteActualizado : r)
      );
    });

    socket.on('emergencia:asignada', ({ reporte }) => {
      if (!usuario?.correo) return;
      if (reporte.unidadAsignada?.correo?.toLowerCase() !== usuario.correo.toLowerCase()) return;

      setAlertasAsignadas(prev => [reporte, ...prev].slice(0, 3));
      setReportes(prev => [reporte, ...prev.filter(r => r.id !== reporte.id)]);
    });

    return () => {
      socket.off('reporte:nuevo');
      socket.off('reporte:estadoCambiado');
      socket.off('reporte:gravedadActualizada');
      socket.off('reporte:unidadAsignada');
      socket.off('emergencia:asignada');
    };
  }, [socket, usuario]);

  // Navega al detalle de una emergencia
  function manejarClickReporte(reporte) {
    navigate(`/operador/emergencia/${reporte.id}`);
  }

  // Traduce el tipo a texto legible
  function textoTipo(tipo) {
    const mapa = { robo: 'Robo', incendio: 'Incendio', accidente: 'Accidente', desastre_natural: 'Desastre natural', otro: 'Otro' };
    return mapa[tipo] || tipo;
  }

  // Traduce el estado a texto legible
  function textoEstado(estado) {
    const mapa = {
      pendiente: 'Pendiente',
      aceptado: 'Aceptado',
      en_camino: 'En camino',
      en_proceso: 'Aceptado',
      resuelto: 'Resuelto'
    };
    return mapa[estado] || estado;
  }

  if (cargando) return <><BarraNavegacion /><Cargando /></>;

  return (
    <>
      <BarraNavegacion />
      <main className="contenido-principal" id="panel-operador">
        <div className="encabezado-seccion">
          <h1 className="titulo-seccion">Centro de operaciones</h1>
        </div>

        <div className="layout-operador">
          {/* Mitad izquierda: Lista de reportes */}
          <div className="panel-lista-reportes" id="lista-reportes-operador">
            <div className="lista-reportes-encabezado">
              <h2>Reportes activos ({reportes.length})</h2>
              {alertasAsignadas.length > 0 && (
                <div className="notificacion-asignada-contenedor">
                  {alertasAsignadas.map((reporte) => (
                    <div key={reporte.id} className="notificacion-asignada">
                      <strong>Emergencia asignada:</strong> {reporte.tipo} - {reporte.unidadAsignada?.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {reportes.length === 0 && (
              <div className="texto-centro" style={{ padding: '20px', color: 'var(--color-texto-secundario)' }}>
                Sin reportes activos
              </div>
            )}

            {reportes.map(reporte => {
              const esAsignado = reporte.unidadAsignada?.correo?.toLowerCase() === usuario?.correo?.toLowerCase();
              return (
                <div
                  key={reporte.id}
                  className={`lista-reportes-item${esAsignado ? ' asignado' : ''}`}
                  onClick={() => manejarClickReporte(reporte)}
                  id={`op-reporte-${reporte.id}`}
                >
                <div className="lista-reportes-cabecera">
                  <span className="lista-reportes-tipo">{textoTipo(reporte.tipo)}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className={`badge badge-${reporte.gravedad}`}>
                      {reporte.gravedad}
                    </span>
                    <span className={`badge badge-${reporte.estado.replace('_', '-')}`}>
                      {textoEstado(reporte.estado)}
                    </span>
                  </div>
                </div>
                <div className="lista-reportes-desc">{reporte.descripcion}</div>
                <div className="lista-reportes-fecha">
                  {new Date(reporte.fechaCreacion).toLocaleString('es-EC')}
                </div>
              </div>
              );
            })}
          </div>

          {/* Mitad derecha: Mapa con marcadores */}
          <MapaReportes
            reportes={reportes}
            alClickReporte={manejarClickReporte}
          />
        </div>
      </main>
    </>
  );
}

export default PanelOperador;
