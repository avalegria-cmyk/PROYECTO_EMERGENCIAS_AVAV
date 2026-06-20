// Panel principal - accesible para todos, con o sin sesion
import { useState, useEffect, useCallback } from 'react';
import BarraNavegacion from '../../componentes/comunes/BarraNavegacion';
import ListaReportes from '../../componentes/reportes/ListaReportes';
import FormularioReporte from '../../componentes/reportes/FormularioReporte';
import PanelChat from '../../componentes/chat/PanelChat';
import Modal from '../../componentes/comunes/Modal';
import Cargando from '../../componentes/comunes/Cargando';
import { obtenerReportes, crearReporte } from '../../servicios/reportes.servicio';
import useSocket from '../../hooks/useSocket';

function PanelUsuario() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const { socket } = useSocket();

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

    return () => {
      socket.off('reporte:nuevo');
      socket.off('reporte:estadoCambiado');
      socket.off('reporte:gravedadActualizada');
    };
  }, [socket]);

  // Crea un nuevo reporte
  async function manejarCrearReporte(datos) {
    setCargandoEnvio(true);
    try {
      await crearReporte(datos);
      setModalReporteAbierto(false);
    } catch (error) {
      console.error('Error al crear reporte:', error);
    } finally {
      setCargandoEnvio(false);
    }
  }

  // Abre el chat de un reporte
  function manejarClickReporte(reporte) {
    setReporteSeleccionado(reporte);
  }

  if (cargando) return <><BarraNavegacion /><Cargando /></>;

  return (
    <>
      <BarraNavegacion />
      <main className="contenido-principal" id="panel-usuario">
        <div className="encabezado-seccion">
          <h1 className="titulo-seccion">Reportes</h1>
          <button
            className="btn btn-primario"
            onClick={() => setModalReporteAbierto(true)}
            id="btn-nuevo-reporte"
          >
            + Reportar
          </button>
        </div>

        <div className="layout-usuario-contenido">
          <div className="layout-usuario-reportes">
            <ListaReportes
              reportes={reportes}
              alClickReporte={manejarClickReporte}
            />
          </div>

          {reporteSeleccionado && (
            <div className="panel-chat-lateral">
              <div className="panel-chat-lateral-cabecera">
                <span className="panel-chat-lateral-titulo">
                  Chat: {reporteSeleccionado.tipo}
                </span>
                <button
                  className="btn btn-secundario btn-pequeno"
                  onClick={() => setReporteSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
              <div className="panel-chat-lateral-cuerpo">
                <PanelChat
                  reporteId={reporteSeleccionado.id}
                  titulo={`Chat en vivo - ${reporteSeleccionado.tipo}`}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        titulo="Reportar emergencia"
        abierto={modalReporteAbierto}
        alCerrar={() => setModalReporteAbierto(false)}
      >
        <FormularioReporte
          alEnviar={manejarCrearReporte}
          cargando={cargandoEnvio}
        />
      </Modal>
    </>
  );
}

export default PanelUsuario;
