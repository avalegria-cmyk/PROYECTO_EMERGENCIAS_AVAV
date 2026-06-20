// Panel de chat completo - con nombre obligatorio, multimedia y typing
import { useState, useEffect, useRef, useCallback } from 'react';
import useSocket from '../../hooks/useSocket';
import useAutenticacion from '../../hooks/useAutenticacion';
import { useNotificacion } from '../../contextos/NotificacionContexto';
import MensajeChat from './MensajeChat';
import EntradaChat from './EntradaChat';
import VideollamadaChat from './VideollamadaChat';

function PanelChat({ reporteId, titulo }) {
  const { socket, conectado } = useSocket();
  const { usuario, estaAutenticado } = useAutenticacion();
  const { mostrarNotificacion } = useNotificacion();
  const [mensajes, setMensajes] = useState([]);
  const [nombreChat, setNombreChat] = useState('');
  const [nombreConfirmado, setNombreConfirmado] = useState(false);
  const [inputNombre, setInputNombre] = useState('');
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState([]);
  const [errorChat, setErrorChat] = useState('');
  const contenedorRef = useRef(null);
  const timerEscribiendoRef = useRef({});

  // Si tiene sesion, usa su nombre automáticamente
  useEffect(() => {
    if (estaAutenticado && usuario?.nombre) {
      setNombreChat(usuario.nombre);
      setNombreConfirmado(true);

      // Asigna el nombre al socket si ya esta conectado
      if (socket) {
        socket.emit('chat:asignarNombre', { nombre: usuario.nombre });
      }
    }
  }, [estaAutenticado, usuario, socket]);

  // Se une a la sala de chat del reporte
  useEffect(() => {
    if (!socket || !reporteId) return;

    socket.emit('chat:unirse', { reporteId });

    // Recibe el historial de la sala
    const manejarHistorial = (historial) => {
      setMensajes(historial);
    };

    // Recibe nuevos mensajes
    const manejarMensaje = (mensaje) => {
      setMensajes(prev => [...prev, mensaje]);
    };

    // Recibe mensajes del sistema y los entremezcla con los mensajes normales
    const manejarSistema = (datos) => {
      // Muestra como notificación emergente
      const tipo = datos.tipo === 'entrada' ? 'entrada' : datos.tipo === 'salida' ? 'salida' : 'info';
      mostrarNotificacion(datos.texto, tipo, 4000);
      
      // Agrega mensaje de sistema entre los mensajes normales para preservar orden temporal
      const mensajeSistema = {
        id: 'sys-' + Date.now(),
        tipo: 'sistema',
        texto: datos.texto,
        fecha: datos.fecha || new Date().toISOString(),
        usuario: { nombre: '⚙️ Sistema' }
      };
      setMensajes(prev => [...prev, mensajeSistema]);
    };

    // Alguien está escribiendo
    const manejarEscribiendo = (datos) => {
      setUsuariosEscribiendo(prev => {
        const existe = prev.find(u => u.id === datos.usuario.id);
        if (!existe) {
          return [...prev, datos.usuario];
        }
        return prev;
      });

      // Limpia después de 3 segundos si no recibe más eventos
      if (timerEscribiendoRef.current[datos.usuario.id]) {
        clearTimeout(timerEscribiendoRef.current[datos.usuario.id]);
      }
      timerEscribiendoRef.current[datos.usuario.id] = setTimeout(() => {
        setUsuariosEscribiendo(prev => prev.filter(u => u.id !== datos.usuario.id));
        delete timerEscribiendoRef.current[datos.usuario.id];
      }, 3000);
    };

    // Alguien dejo de escribir
    const manejarDejoEscribir = (datos) => {
      setUsuariosEscribiendo(prev => prev.filter(u => u.id !== datos.usuario.id));
      if (timerEscribiendoRef.current[datos.usuario.id]) {
        clearTimeout(timerEscribiendoRef.current[datos.usuario.id]);
        delete timerEscribiendoRef.current[datos.usuario.id];
      }
    };

    // Error del chat
    const manejarError = (datos) => {
      setErrorChat(datos.mensaje);
      setTimeout(() => setErrorChat(''), 4000);
    };

    socket.on('chat:historial', manejarHistorial);
    socket.on('chat:mensaje', manejarMensaje);
    socket.on('chat:sistema', manejarSistema);
    socket.on('chat:escribiendo', manejarEscribiendo);
    socket.on('chat:dejoDeEscribir', manejarDejoEscribir);
    socket.on('chat:error', manejarError);

    return () => {
      socket.emit('chat:salir');
      socket.off('chat:historial', manejarHistorial);
      socket.off('chat:mensaje', manejarMensaje);
      socket.off('chat:sistema', manejarSistema);
      socket.off('chat:escribiendo', manejarEscribiendo);
      socket.off('chat:dejoDeEscribir', manejarDejoEscribir);
      socket.off('chat:error', manejarError);

      // Limpia timers de escribiendo
      Object.values(timerEscribiendoRef.current).forEach(clearTimeout);
      timerEscribiendoRef.current = {};
    };
  }, [socket, reporteId]);

  // Desplaza al fondo al recibir nuevos mensajes
  useEffect(() => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollTop = contenedorRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Confirma el nombre del usuario anonimo
  function confirmarNombre(e) {
    e.preventDefault();
    const nombre = inputNombre.trim();
    if (!nombre) return;

    setNombreChat(nombre);
    setNombreConfirmado(true);

    if (socket) {
      socket.emit('chat:asignarNombre', { nombre });
    }
  }

  // Envia un mensaje de texto
  const enviarMensaje = useCallback((texto) => {
    if (!socket || !nombreConfirmado) return;
    socket.emit('chat:mensaje', { texto });
  }, [socket, nombreConfirmado]);

  // Envia una imagen
  const enviarImagen = useCallback((contenido, nombreArchivo) => {
    if (!socket || !nombreConfirmado) return;
    socket.emit('chat:imagen', { contenido, nombreArchivo });
  }, [socket, nombreConfirmado]);

  // Envia un video
  const enviarVideo = useCallback((contenido, nombreArchivo) => {
    if (!socket || !nombreConfirmado) return;
    socket.emit('chat:video', { contenido, nombreArchivo });
  }, [socket, nombreConfirmado]);

  // Notifica que está escribiendo
  const notificarEscribiendo = useCallback(() => {
    if (!socket || !nombreConfirmado) return;
    socket.emit('chat:escribiendo');
  }, [socket, nombreConfirmado]);

  // Notifica que dejo de escribir
  const notificarDejoEscribir = useCallback(() => {
    if (!socket || !nombreConfirmado) return;
    socket.emit('chat:dejoDeEscribir');
  }, [socket, nombreConfirmado]);

  // Texto del indicador de escritura
  function textoEscribiendo() {
    if (usuariosEscribiendo.length === 0) return null;
    if (usuariosEscribiendo.length === 1) {
      return `${usuariosEscribiendo[0].nombre} está escribiendo...`;
    }
    if (usuariosEscribiendo.length === 2) {
      return `${usuariosEscribiendo[0].nombre} y ${usuariosEscribiendo[1].nombre} están escribiendo...`;
    }
    return `${usuariosEscribiendo.length} personas están escribiendo...`;
  }

  const indicador = textoEscribiendo();

  return (
    <div className="panel-chat" id="panel-chat">
      <div className="chat-cabecera">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{titulo || 'Chat en vivo'}</span>
          {!conectado && (
            <span className="chat-estado-desconectado">(Desconectado)</span>
          )}
        </div>
        {nombreConfirmado && (
          <span className="chat-nombre-activo">Como: {nombreChat}</span>
        )}
      </div>

      {errorChat && (
        <div className="chat-error">{errorChat}</div>
      )}

      <VideollamadaChat
        socket={socket}
        nombreChat={nombreChat}
        nombreConfirmado={nombreConfirmado}
      />

      <div className="chat-mensajes" ref={contenedorRef} id="chat-mensajes">
        {mensajes.length === 0 && (
          <div className="texto-centro" style={{ color: 'var(--color-texto-terciario)', padding: '20px' }}>
            Sin mensajes aún. Sé el primero en escribir.
          </div>
        )}

        {mensajes.map((msg, idx) => (
          msg.tipo === 'sistema' ? (
            <div key={msg.id || `sys-${idx}`} className="chat-sistema">
              {msg.texto}
            </div>
          ) : (
            <MensajeChat key={msg.id || idx} mensaje={msg} nombrePropio={nombreChat} />
          )
        ))}
      </div>

      {indicador && (
        <div className="chat-escribiendo-indicador">
          <span className="chat-escribiendo-puntos">
            <span></span><span></span><span></span>
          </span>
          {indicador}
        </div>
      )}

      {/* Si no tiene nombre, muestra formulario para ingresar nombre */}
      {!nombreConfirmado ? (
        <div className="chat-pedir-nombre">
          <p className="chat-pedir-nombre-texto">
            Para participar en el chat, ingresa tu nombre:
          </p>
          <form onSubmit={confirmarNombre} className="chat-nombre-form">
            <input
              className="chat-input"
              type="text"
              placeholder="Tu nombre..."
              value={inputNombre}
              onChange={(e) => setInputNombre(e.target.value)}
              maxLength={30}
              id="input-nombre-chat"
            />
            <button type="submit" className="chat-btn-enviar" disabled={!inputNombre.trim()} id="btn-confirmar-nombre">
              Entrar
            </button>
          </form>
        </div>
      ) : (
        <EntradaChat
          alEnviarTexto={enviarMensaje}
          alEnviarImagen={enviarImagen}
          alEnviarVideo={enviarVideo}
          alEscribir={notificarEscribiendo}
          alDejarEscribir={notificarDejoEscribir}
        />
      )}
    </div>
  );
}

export default PanelChat;
