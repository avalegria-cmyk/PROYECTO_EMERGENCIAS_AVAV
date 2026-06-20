// Componente principal con enrutamiento y proveedores
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AutenticacionProveedor } from './contextos/AutenticacionContexto';
import { SocketProveedor } from './contextos/SocketContexto';
import { ProveedorNotificaciones } from './contextos/NotificacionContexto';
import ErrorBoundary from './componentes/comunes/ErrorBoundary';
import RutaProtegida from './componentes/comunes/RutaProtegida';
import { useContext } from 'react';
import { NotificacionContexto } from './contextos/NotificacionContexto';
import Notificaciones from './componentes/comunes/Notificaciones';
import LoginPagina from './paginas/LoginPagina';
import RegistroPagina from './paginas/RegistroPagina';
import PanelUsuario from './paginas/usuario/PanelUsuario';
import PanelOperador from './paginas/operador/PanelOperador';
import DetalleEmergencia from './paginas/operador/DetalleEmergencia';
import DashboardAnalitica from './paginas/operador/DashboardAnalitica';
import DashboardPredicciones from './paginas/operador/DashboardPredicciones';

// Componente interno que usa el contexto de notificaciones
function ContenidoApp() {
  const { notificaciones, ocultarNotificacion } = useContext(NotificacionContexto);

  return (
    <>
      <Notificaciones notificaciones={notificaciones} onOcultar={ocultarNotificacion} />
      <BrowserRouter>
        <Routes>
          {/* Ruta publica principal - cualquiera puede ver reportes */}
          <Route path="/" element={<PanelUsuario />} />
          <Route path="/panel" element={<PanelUsuario />} />

          {/* Rutas de autenticacion */}
          <Route path="/login" element={<LoginPagina />} />
          <Route path="/registro" element={<RegistroPagina />} />

          {/* Rutas del operador - requieren autenticacion con rol */}
          <Route
            path="/operador"
            element={
              <RutaProtegida roles={['operador', 'administrador']}>
                <PanelOperador />
              </RutaProtegida>
            }
          />
          <Route
            path="/operador/emergencia/:id"
            element={
              <RutaProtegida roles={['operador', 'administrador']}>
                <DetalleEmergencia />
              </RutaProtegida>
            }
          />
          <Route
            path="/operador/analitica"
            element={
              <RutaProtegida roles={['operador', 'administrador']}>
                <DashboardAnalitica />
              </RutaProtegida>
            }
          />
          <Route
            path="/operador/predicciones"
            element={
              <RutaProtegida roles={['operador', 'administrador']}>
                <DashboardPredicciones />
              </RutaProtegida>
            }
          />

          {/* Redireccion por defecto a la pagina principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <AutenticacionProveedor>
      <ErrorBoundary>
        <SocketProveedor>
          <ProveedorNotificaciones>
            <ContenidoApp />
          </ProveedorNotificaciones>
        </SocketProveedor>
      </ErrorBoundary>
    </AutenticacionProveedor>
  );
}

export default App;
