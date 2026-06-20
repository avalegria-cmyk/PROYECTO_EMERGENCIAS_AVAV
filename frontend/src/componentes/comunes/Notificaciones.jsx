import { useContext } from 'react';
import { NotificacionContexto } from '../../contextos/NotificacionContexto';
import '../../styles/notificacion.css';

// Componente que gestiona las notificaciones
function Notificaciones({ notificaciones, onOcultar }) {
  return (
    <div className="contenedor-notificaciones">
      {notificaciones.map(notif => (
        <div
          key={notif.id}
          className={`notificacion notificacion-${notif.tipo} notificacion-entrada`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'notificacion-salida') {
              onOcultar(notif.id);
            }
          }}
        >
          <div className="notificacion-contenido">
            {notif.tipo === 'entrada' && <span className="notificacion-icono">👤➕</span>}
            {notif.tipo === 'salida' && <span className="notificacion-icono">👤➖</span>}
            {notif.tipo === 'info' && <span className="notificacion-icono">ℹ️</span>}
            {notif.tipo === 'exito' && <span className="notificacion-icono">✅</span>}
            {notif.tipo === 'error' && <span className="notificacion-icono">❌</span>}
            <span className="notificacion-mensaje">{notif.texto || notif.mensaje}</span>
          </div>
          <button
            className="notificacion-cerrar"
            onClick={() => onOcultar(notif.id)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notificaciones;
