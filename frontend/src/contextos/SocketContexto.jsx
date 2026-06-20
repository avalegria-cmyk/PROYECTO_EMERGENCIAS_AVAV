// Contexto de Socket.IO - conexion con o sin autenticacion
import { createContext, useEffect, useState, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { AutenticacionContexto } from './AutenticacionContexto';

const SocketContexto = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL?.trim() || undefined;

function SocketProveedor({ children }) {
  const { token } = useContext(AutenticacionContexto);
  const [conectado, setConectado] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Desconecta socket previo si existe
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConectado(false);
    }

    // Crea la conexion - con token si hay sesion, sin token si es anonimo
    const opciones = {
      transports: ['websocket', 'polling'],
      auth: {}
    };

    if (token) {
      opciones.auth.token = token;
    }

    let socket = null;
    try {
      // Intento de conexion con manejo de excepciones para no romper la UI
      socket = io(SOCKET_URL, opciones);

      socket.on('connect', () => setConectado(true));
      socket.on('disconnect', () => setConectado(false));
      socket.on('connect_error', (error) => {
        console.error('Error de conexion Socket.IO:', error && error.message ? error.message : error);
        setConectado(false);
      });
    } catch (err) {
      console.error('Fallo al inicializar Socket.IO (capturado):', err);
      socket = null;
      setConectado(false);
    }

    socketRef.current = socket;

    return () => {
      if (socket) socket.disconnect();
      socketRef.current = null;
      setConectado(false);
    };
  }, [token]);

  const valor = {
    socket: socketRef.current,
    conectado
  };

  return (
    <SocketContexto.Provider value={valor}>
      {children}
    </SocketContexto.Provider>
  );
}

export { SocketContexto, SocketProveedor };
