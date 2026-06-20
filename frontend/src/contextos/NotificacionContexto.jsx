import { createContext, useContext, useState, useCallback } from 'react';

const NotificacionContexto = createContext();

export function ProveedorNotificaciones({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const mostrarNotificacion = useCallback((mensaje, tipo = 'info', duracion = 3000) => {
    const id = Date.now();
    const notif = { id, mensaje, tipo };
    setNotificaciones(prev => [...prev, notif]);

    if (duracion > 0) {
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
      }, duracion);
    }

    return id;
  }, []);

  const ocultarNotificacion = useCallback((id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificacionContexto.Provider value={{ notificaciones, mostrarNotificacion, ocultarNotificacion }}>
      {children}
    </NotificacionContexto.Provider>
  );
}

export function useNotificacion() {
  const contexto = useContext(NotificacionContexto);
  if (!contexto) {
    throw new Error('useNotificacion debe usarse dentro de ProveedorNotificaciones');
  }
  return contexto;
}

export { NotificacionContexto };
