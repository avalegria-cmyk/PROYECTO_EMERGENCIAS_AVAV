// Videollamada grupal WebRTC con señalizacion por Socket.IO
import { useCallback, useEffect, useRef, useState } from 'react';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const MEDIA_CONSTRAINTS = {
  audio: true,
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

function obtenerMensajeErrorMedia(error) {
  if (!window.isSecureContext) {
    return 'La camara solo funciona en HTTPS. Abre la app con el enlace https del tunel.';
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Este navegador no permite usar camara o microfono en esta pagina.';
  }

  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return 'Permiso denegado. Activa camara y microfono para este sitio en el navegador.';
  }

  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'No se encontro una camara o microfono disponible en este dispositivo.';
  }

  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'La camara o el microfono estan siendo usados por otra aplicacion.';
  }

  return 'No se pudo acceder a camara o microfono';
}

function VideoRemoto({ stream, nombre, audioActivo = true, videoActivo = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="video-tarjeta">
      <video ref={ref} autoPlay playsInline className={!videoActivo ? 'video-apagado' : ''} />
      {!videoActivo && <div className="video-placeholder">Camara apagada</div>}
      <div className="video-etiqueta">
        <span>{nombre}</span>
        <span>{audioActivo ? 'Mic activo' : 'Silenciado'}</span>
      </div>
    </div>
  );
}

function VideollamadaChat({ socket, nombreChat, nombreConfirmado }) {
  const [enLlamada, setEnLlamada] = useState(false);
  const [audioActivo, setAudioActivo] = useState(true);
  const [videoActivo, setVideoActivo] = useState(true);
  const [remotos, setRemotos] = useState([]);
  const [error, setError] = useState('');
  const videoLocalRef = useRef(null);
  const streamLocalRef = useRef(null);
  const peersRef = useRef(new Map());
  const remotosRef = useRef(new Map());

  function reproducirVideoLocal() {
    if (!videoLocalRef.current || !streamLocalRef.current) return;
    videoLocalRef.current.srcObject = streamLocalRef.current;
    videoLocalRef.current.play?.().catch(() => {});
  }

  function actualizarRemotos() {
    setRemotos(Array.from(remotosRef.current.values()));
  }

  const cerrarPeer = useCallback((id) => {
    const peer = peersRef.current.get(id);
    if (peer) peer.close();
    peersRef.current.delete(id);
    remotosRef.current.delete(id);
    actualizarRemotos();
  }, []);

  const crearPeer = useCallback((peerId, nombre, iniciarOferta = false) => {
    if (!socket || peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(peerId, pc);

    streamLocalRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, streamLocalRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video:ice', { para: peerId, candidato: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      const previo = remotosRef.current.get(peerId) || {};
      remotosRef.current.set(peerId, {
        id: peerId,
        nombre: nombre || previo.nombre || 'Participante',
        stream,
        audioActivo: previo.audioActivo ?? true,
        videoActivo: previo.videoActivo ?? true
      });
      actualizarRemotos();
    };

    if (iniciarOferta) {
      pc.createOffer()
        .then(oferta => pc.setLocalDescription(oferta).then(() => oferta))
        .then(oferta => socket.emit('video:oferta', { para: peerId, oferta }))
        .catch(() => setError('No se pudo iniciar conexion de video'));
    }

    return pc;
  }, [socket]);

  const salirLlamada = useCallback(() => {
    if (socket) socket.emit('video:salir');
    peersRef.current.forEach(peer => peer.close());
    peersRef.current.clear();
    remotosRef.current.clear();
    actualizarRemotos();
    streamLocalRef.current?.getTracks().forEach(track => track.stop());
    streamLocalRef.current = null;
    if (videoLocalRef.current) videoLocalRef.current.srcObject = null;
    setEnLlamada(false);
  }, [socket]);

  async function iniciarLlamada() {
    if (!socket || !nombreConfirmado) return;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      streamLocalRef.current = stream;
      setAudioActivo(true);
      setVideoActivo(true);
      setEnLlamada(true);
      socket.emit('video:unirse', { audioActivo: true, videoActivo: true });
    } catch (error) {
      setError(obtenerMensajeErrorMedia(error));
    }
  }

  function alternarAudio() {
    const nuevo = !audioActivo;
    streamLocalRef.current?.getAudioTracks().forEach(track => { track.enabled = nuevo; });
    setAudioActivo(nuevo);
    socket?.emit('video:estadoMedia', { audioActivo: nuevo, videoActivo });
  }

  function alternarVideo() {
    const nuevo = !videoActivo;
    streamLocalRef.current?.getVideoTracks().forEach(track => { track.enabled = nuevo; });
    setVideoActivo(nuevo);
    socket?.emit('video:estadoMedia', { audioActivo, videoActivo: nuevo });
  }

  useEffect(() => {
    if (!socket) return;

    const onParticipantes = ({ participantes }) => {
      participantes.forEach(p => {
        remotosRef.current.set(p.id, {
          id: p.id,
          nombre: p.nombre,
          stream: null,
          audioActivo: p.audioActivo,
          videoActivo: p.videoActivo
        });
        crearPeer(p.id, p.nombre, true);
      });
      actualizarRemotos();
    };

    const onUsuarioUnido = ({ participante }) => {
      remotosRef.current.set(participante.id, {
        id: participante.id,
        nombre: participante.nombre,
        stream: null,
        audioActivo: participante.audioActivo,
        videoActivo: participante.videoActivo
      });
      actualizarRemotos();
    };

    const onOferta = async ({ de, nombre, oferta }) => {
      const pc = crearPeer(de, nombre, false);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(oferta));
      const respuesta = await pc.createAnswer();
      await pc.setLocalDescription(respuesta);
      socket.emit('video:respuesta', { para: de, respuesta });
    };

    const onRespuesta = async ({ de, respuesta }) => {
      const pc = peersRef.current.get(de);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(respuesta));
    };

    const onIce = async ({ de, candidato }) => {
      const pc = peersRef.current.get(de);
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidato));
    };

    const onUsuarioSalio = ({ id }) => cerrarPeer(id);

    const onEstadoMedia = ({ id, audioActivo, videoActivo }) => {
      const remoto = remotosRef.current.get(id);
      if (!remoto) return;
      remotosRef.current.set(id, { ...remoto, audioActivo, videoActivo });
      actualizarRemotos();
    };

    socket.on('video:participantes', onParticipantes);
    socket.on('video:usuarioUnido', onUsuarioUnido);
    socket.on('video:oferta', onOferta);
    socket.on('video:respuesta', onRespuesta);
    socket.on('video:ice', onIce);
    socket.on('video:usuarioSalio', onUsuarioSalio);
    socket.on('video:estadoMedia', onEstadoMedia);

    return () => {
      socket.off('video:participantes', onParticipantes);
      socket.off('video:usuarioUnido', onUsuarioUnido);
      socket.off('video:oferta', onOferta);
      socket.off('video:respuesta', onRespuesta);
      socket.off('video:ice', onIce);
      socket.off('video:usuarioSalio', onUsuarioSalio);
      socket.off('video:estadoMedia', onEstadoMedia);
    };
  }, [socket, crearPeer, cerrarPeer]);

  useEffect(() => {
    if (enLlamada) reproducirVideoLocal();
  }, [enLlamada, videoActivo]);

  useEffect(() => () => salirLlamada(), [salirLlamada]);

  return (
    <div className="videollamada-chat">
      <div className="video-barra">
        <strong>Videollamada</strong>
        {!enLlamada ? (
          <button className="btn btn-primario btn-pequeno" onClick={iniciarLlamada} disabled={!nombreConfirmado}>
            Entrar
          </button>
        ) : (
          <div className="video-controles">
            <button className="btn btn-secundario btn-pequeno" onClick={alternarAudio}>
              {audioActivo ? 'Silenciar mic' : 'Activar mic'}
            </button>
            <button className="btn btn-secundario btn-pequeno" onClick={alternarVideo}>
              {videoActivo ? 'Apagar camara' : 'Activar camara'}
            </button>
            <button className="btn btn-peligro btn-pequeno" onClick={salirLlamada}>
              Salir
            </button>
          </div>
        )}
      </div>

      {error && <div className="chat-error">{error}</div>}

      {enLlamada && (
        <div className="video-grid">
          <div className="video-tarjeta local">
            <video ref={videoLocalRef} autoPlay playsInline muted className={!videoActivo ? 'video-apagado' : ''} />
            {!videoActivo && <div className="video-placeholder">Camara apagada</div>}
            <div className="video-etiqueta">
              <span>{nombreChat || 'Yo'}</span>
              <span>{audioActivo ? 'Mic activo' : 'Silenciado'}</span>
            </div>
          </div>
          {remotos.map(remoto => (
            remoto.stream ? (
              <VideoRemoto key={remoto.id} {...remoto} />
            ) : (
              <div key={remoto.id} className="video-tarjeta esperando">
                <div className="video-placeholder">Conectando...</div>
                <div className="video-etiqueta"><span>{remoto.nombre}</span><span>Esperando</span></div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default VideollamadaChat;
