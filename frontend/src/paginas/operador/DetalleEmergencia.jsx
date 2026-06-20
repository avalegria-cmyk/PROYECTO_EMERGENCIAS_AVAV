// Vista detallada de emergencia para operador - detalle + mapa con ruta + chat
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BarraNavegacion from '../../componentes/comunes/BarraNavegacion';
import DetalleReporte from '../../componentes/reportes/DetalleReporte';
import MapaRuta from '../../componentes/mapa/MapaRuta';
import PanelChat from '../../componentes/chat/PanelChat';
import Cargando from '../../componentes/comunes/Cargando';
import { obtenerReporte, cambiarEstado } from '../../servicios/reportes.servicio';
import useSocket from '../../hooks/useSocket';

function DetalleEmergencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { socket } = useSocket();

  // Carga el detalle del reporte
  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await obtenerReporte(id);
        setReporte(respuesta.datos);
      } catch (error) {
        console.error('Error al cargar reporte:', error);
        navigate('/operador');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id, navigate]);

  // Escucha actualizaciones del reporte en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on('reporte:estadoCambiado', (reporteActualizado) => {
      if (reporteActualizado.id === id) {
        setReporte(reporteActualizado);
      }
    });

    socket.on('reporte:gravedadActualizada', (reporteActualizado) => {
      if (reporteActualizado.id === id) {
        setReporte(reporteActualizado);
      }
    });

    socket.on('reporte:unidadAsignada', (reporteActualizado) => {
      if (reporteActualizado.id === id) {
        setReporte(reporteActualizado);
      }
    });

    return () => {
      socket.off('reporte:estadoCambiado');
      socket.off('reporte:gravedadActualizada');
      socket.off('reporte:unidadAsignada');
    };
  }, [socket, id]);

  // Cambia el estado del reporte
  async function manejarCambioEstado(reporteId, nuevoEstado) {
    try {
      const respuesta = await cambiarEstado(reporteId, nuevoEstado);
      setReporte(respuesta.datos);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  if (cargando) return <><BarraNavegacion /><Cargando /></>;

  if (!reporte) return null;

  return (
    <>
      <BarraNavegacion />
      <main className="contenido-principal" id="detalle-emergencia">
        <div className="encabezado-seccion">
          <button
            className="btn btn-secundario btn-pequeno"
            onClick={() => navigate('/operador')}
            id="btn-volver"
          >
            Volver
          </button>
          <h1 className="titulo-seccion">Detalle de emergencia</h1>
          <div />
        </div>

        <div className="layout-detalle-emergencia">
          {/* Tercio izquierdo: Detalle del reporte */}
          <DetalleReporte
            reporte={reporte}
            alCambiarEstado={manejarCambioEstado}
            esOperador={true}
          />

          {/* Tercio central: Mapa con ruta */}
          <MapaRuta
            ubicacionEmergencia={reporte.ubicacion}
            unidadAsignada={reporte.unidadAsignada}
            estadoReporte={reporte.estado}
          />

          {/* Tercio derecho: Chat en tiempo real */}
          <PanelChat
            reporteId={reporte.id}
            titulo={`Chat - ${reporte.tipo}`}
          />
        </div>
      </main>
    </>
  );
}

export default DetalleEmergencia;
