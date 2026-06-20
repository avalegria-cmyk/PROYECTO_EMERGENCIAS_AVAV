// Hook para acceder al contexto de autenticacion
import { useContext } from 'react';
import { AutenticacionContexto } from '../contextos/AutenticacionContexto';

function useAutenticacion() {
  const contexto = useContext(AutenticacionContexto);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de AutenticacionProveedor');
  }
  return contexto;
}

export default useAutenticacion;
