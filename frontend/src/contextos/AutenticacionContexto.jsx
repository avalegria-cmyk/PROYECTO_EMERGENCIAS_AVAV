// Contexto de autenticacion - almacena token, usuario y rol en estado global
import { createContext, useState, useEffect, useCallback } from 'react';

const AutenticacionContexto = createContext(null);

function AutenticacionProveedor({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Restaura la sesion desde localStorage al montar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setCargando(false);
  }, []);

  // Guarda la sesion al iniciar sesion o registrarse
  const guardarSesion = useCallback((nuevoToken, nuevoUsuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
  }, []);

  // Cierra la sesion y limpia el almacenamiento
  const cerrarSesion = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }, []);

  // Verifica si el usuario tiene un rol específico
  const tieneRol = useCallback((rol) => {
    return usuario?.rol === rol;
  }, [usuario]);

  const valor = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token,
    guardarSesion,
    cerrarSesion,
    tieneRol
  };

  return (
    <AutenticacionContexto.Provider value={valor}>
      {children}
    </AutenticacionContexto.Provider>
  );
}

export { AutenticacionContexto, AutenticacionProveedor };
