// Entrada del chat con soporte de texto, imagenes y videos
import { useState, useRef, useCallback } from 'react';

function EntradaChat({ alEnviarTexto, alEnviarImagen, alEnviarVideo, alEscribir, alDejarEscribir }) {
  const [texto, setTexto] = useState('');
  const archivoRef = useRef(null);
  const timerEscribirRef = useRef(null);

  // Envia un mensaje de texto
  function manejarEnvio(e) {
    e.preventDefault();
    const mensajeLimpio = texto.trim();
    if (!mensajeLimpio) return;

    alEnviarTexto(mensajeLimpio);
    setTexto('');
    if (alDejarEscribir) alDejarEscribir();
  }

  // Maneja el cambio de texto y notifica el estado de escritura
  const manejarCambioTexto = useCallback((e) => {
    setTexto(e.target.value);

    if (alEscribir) alEscribir();

    // Deja de notificar después de 2 segundos sin escribir
    if (timerEscribirRef.current) clearTimeout(timerEscribirRef.current);
    timerEscribirRef.current = setTimeout(() => {
      if (alDejarEscribir) alDejarEscribir();
    }, 2000);
  }, [alEscribir, alDejarEscribir]);

  // Procesa el archivo seleccionado (imagen o video)
  function manejarArchivo(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Verifica el tamaño (máx 5 MB)
    if (archivo.size > 5 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 5 MB');
      return;
    }

    const lector = new FileReader();
    lector.onloadend = () => {
      const contenido = lector.result;

      if (archivo.type.startsWith('image/')) {
        alEnviarImagen(contenido, archivo.name);
      } else if (archivo.type.startsWith('video/')) {
        alEnviarVideo(contenido, archivo.name);
      } else {
        alert('Solo se permiten imagenes y videos');
      }
    };
    lector.readAsDataURL(archivo);

    // Limpia el input para permitir reenviar el mismo archivo
    e.target.value = '';
  }

  return (
    <div className="chat-entrada-completa">
      <form onSubmit={manejarEnvio} className="chat-entrada" id="formulario-chat">
        <input
          className="chat-input"
          type="text"
          placeholder="Escribe un mensaje..."
          value={texto}
          onChange={manejarCambioTexto}
          maxLength={1000}
          id="input-chat"
        />
        <button
          type="button"
          className="chat-btn-adjuntar"
          onClick={() => archivoRef.current?.click()}
          title="Enviar imagen o video"
          id="btn-adjuntar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <button type="submit" className="chat-btn-enviar" disabled={!texto.trim()} id="btn-enviar-chat">
          Enviar
        </button>
      </form>
      <input
        ref={archivoRef}
        type="file"
        accept="image/*,video/*"
        onChange={manejarArchivo}
        style={{ display: 'none' }}
        id="input-archivo-chat"
      />
    </div>
  );
}

export default EntradaChat;
