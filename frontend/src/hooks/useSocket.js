// Hook para acceder al contexto de Socket.IO
import { useContext } from 'react';
import { SocketContexto } from '../contextos/SocketContexto';

function useSocket() {
  const contexto = useContext(SocketContexto);
  if (!contexto) {
    throw new Error('useSocket debe usarse dentro de SocketProveedor');
  }
  return contexto;
}

export default useSocket;
