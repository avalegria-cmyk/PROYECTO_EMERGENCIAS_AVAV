// Proteccion de rutas por rol - redirige si no tiene permisos
import { Navigate } from 'react-router-dom';
import useAutenticacion from '../../hooks/useAutenticacion';
import Cargando from './Cargando';

function RutaProtegida({ roles, children }) {
  const { estaAutenticado, usuario, cargando } = useAutenticacion();

  if (cargando) {
    return <Cargando />;
  }

  // Redirige al login si no esta autenticado
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Redirige si el rol no esta permitido
  if (roles && !roles.includes(usuario?.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
