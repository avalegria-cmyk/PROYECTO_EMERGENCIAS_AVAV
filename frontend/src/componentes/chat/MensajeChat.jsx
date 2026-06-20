// Burbuja de mensaje - soporta texto, imagenes y videos con lightbox
import { useState } from 'react';

function MensajeChat({ mensaje, nombrePropio }) {
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

  // Verifica si el mensaje es del usuario actual
  const esPropio = nombrePropio && mensaje.usuario?.nombre === nombrePropio;

  // Formatea la hora del mensaje
  function formatearHora(iso) {
    return new Date(iso).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Renderiza el contenido segun el tipo de mensaje
  function renderizarContenido() {
    switch (mensaje.tipo) {
      case 'imagen':
        return (
          <div className="chat-mensaje-media">
            <img
              src={mensaje.contenido}
              alt={mensaje.nombreArchivo || 'Imagen'}
              className="chat-mensaje-imagen"
              onClick={() => setLightboxAbierto(true)}
            />
            {mensaje.nombreArchivo && (
              <span className="chat-mensaje-archivo-nombre">{mensaje.nombreArchivo}</span>
            )}

            {lightboxAbierto && (
              <div
                className="lightbox-overlay"
                onClick={() => setLightboxAbierto(false)}
              >
                <img
                  src={mensaje.contenido}
                  alt={mensaje.nombreArchivo || 'Imagen ampliada'}
                />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="chat-mensaje-media">
            <video
              src={mensaje.contenido}
              controls
              className="chat-mensaje-video"
              preload="metadata"
            />
            {mensaje.nombreArchivo && (
              <span className="chat-mensaje-archivo-nombre">{mensaje.nombreArchivo}</span>
            )}
          </div>
        );

      case 'texto':
      default:
        return <div className="chat-mensaje-texto">{mensaje.texto}</div>;
    }
  }

  return (
    <div className={`chat-mensaje ${esPropio ? 'propio' : ''}`}>
      <div className="chat-mensaje-meta">
        <span className="chat-mensaje-nombre">{mensaje.usuario?.nombre || 'Sistema'}</span>
        <span>{formatearHora(mensaje.fecha)}</span>
      </div>
      {renderizarContenido()}
    </div>
  );
}

export default MensajeChat;
