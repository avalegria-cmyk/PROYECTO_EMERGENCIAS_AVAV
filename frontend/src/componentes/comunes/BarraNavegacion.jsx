// Barra de navegacion superior - funciona con y sin sesion
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAutenticacion from '../../hooks/useAutenticacion';

function BarraNavegacion() {
  const { usuario, cerrarSesion, estaAutenticado, tieneRol } = useAutenticacion();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Obtiene las iniciales del nombre del usuario
  function obtenerIniciales(nombre) {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Cierra sesion y redirige al inicio
  function manejarCerrarSesion() {
    cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
  }

  // Navega y cierra el menu movil
  function navegarA(ruta) {
    navigate(ruta);
    setMenuAbierto(false);
  }

  // Define los enlaces segun el rol del usuario
  function obtenerEnlaces() {
    const enlaces = [
      { ruta: '/', texto: 'Reportes' }
    ];

    if (estaAutenticado && (tieneRol('operador') || tieneRol('administrador'))) {
      enlaces.push({ ruta: '/operador', texto: 'Centro de operaciones' });
      enlaces.push({ ruta: '/operador/analitica', texto: 'Dashboard KPI' });
      enlaces.push({ ruta: '/operador/predicciones', texto: 'Predicciones' });
    }

    return enlaces;
  }

  const enlaces = obtenerEnlaces();

  return (
    <>
      <nav className="navbar" id="navbar-principal">
        <div className="navbar-logo" onClick={() => navegarA('/')} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo-icono">E</div>
          <span>Emergencias</span>
        </div>

        {/* Hamburger button - visible only on mobile */}
        <button
          className="navbar-hamburguesa"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menu"
          id="btn-menu-movil"
        >
          <span className={`hamburguesa-linea ${menuAbierto ? 'abierto' : ''}`} />
          <span className={`hamburguesa-linea ${menuAbierto ? 'abierto' : ''}`} />
          <span className={`hamburguesa-linea ${menuAbierto ? 'abierto' : ''}`} />
        </button>

        <div className="navbar-enlaces">
          {enlaces.map(enlace => (
            <button
              key={enlace.ruta}
              className={`navbar-enlace ${location.pathname === enlace.ruta ? 'activo' : ''}`}
              onClick={() => navegarA(enlace.ruta)}
            >
              {enlace.texto}
            </button>
          ))}
        </div>

        {estaAutenticado && usuario ? (
          <div className="navbar-usuario">
            <div>
              <div className="navbar-nombre">{usuario.nombre}</div>
              <div className="navbar-rol">{usuario.rol}</div>
            </div>
            <div className="navbar-avatar">
              {obtenerIniciales(usuario.nombre)}
            </div>
            <button className="navbar-btn-salir" onClick={manejarCerrarSesion}>
              Salir
            </button>
          </div>
        ) : (
          <div className="navbar-usuario">
            <button
              className="btn btn-primario btn-pequeno"
              onClick={() => navegarA('/login')}
              id="btn-ir-login"
            >
              Iniciar sesion
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu drawer */}
      {menuAbierto && (
        <div className="menu-movil-overlay" onClick={() => setMenuAbierto(false)}>
          <div className="menu-movil" onClick={e => e.stopPropagation()}>
            <div className="menu-movil-enlaces">
              {enlaces.map(enlace => (
                <button
                  key={enlace.ruta}
                  className={`menu-movil-enlace ${location.pathname === enlace.ruta ? 'activo' : ''}`}
                  onClick={() => navegarA(enlace.ruta)}
                >
                  {enlace.texto}
                </button>
              ))}
            </div>

            {estaAutenticado && usuario ? (
              <div className="menu-movil-usuario">
                <div className="menu-movil-info">
                  <div className="navbar-avatar">
                    {obtenerIniciales(usuario.nombre)}
                  </div>
                  <div>
                    <div className="navbar-nombre">{usuario.nombre}</div>
                    <div className="navbar-rol">{usuario.rol}</div>
                  </div>
                </div>
                <button className="btn btn-peligro w-full" onClick={manejarCerrarSesion}>
                  Cerrar sesion
                </button>
              </div>
            ) : (
              <div className="menu-movil-usuario">
                <button
                  className="btn btn-primario w-full"
                  onClick={() => navegarA('/login')}
                >
                  Iniciar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BarraNavegacion;
