import { useEffect, useRef, useState } from 'react';
import { iniciarConGoogle } from '../../servicios/autenticacion.servicio';
import useAutenticacion from '../../hooks/useAutenticacion';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function cargarScriptGoogle() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existente = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existente) {
      existente.addEventListener('load', resolve, { once: true });
      existente.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function BotonGoogle({ alExito }) {
  const contenedorRef = useRef(null);
  const { guardarSesion } = useAutenticacion();
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const origenActual = window.location.origin;

  useEffect(() => {
    let cancelado = false;

    async function inicializar() {
      if (!clientId || !contenedorRef.current) return;

      try {
        await cargarScriptGoogle();
        if (cancelado || !contenedorRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          use_fedcm_for_prompt: false,
          callback: async (respuestaGoogle) => {
            try {
              setError('');
              if (!respuestaGoogle.credential) {
                setError('Google no devolvio una credencial valida');
                return;
              }
              const respuesta = await iniciarConGoogle(respuestaGoogle.credential);
              guardarSesion(respuesta.datos.token, respuesta.datos.usuario);
              if (alExito) alExito(respuesta.datos.usuario);
            } catch (err) {
              setError(err.message);
            }
          }
        });

        contenedorRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(contenedorRef.current, {
          theme: 'outline',
          size: 'large',
          width: contenedorRef.current.offsetWidth || 320,
          text: 'continue_with'
        });
      } catch (err) {
        setError(err.message || 'No se pudo cargar el boton de Google');
      }
    }

    inicializar();
    return () => { cancelado = true; };
  }, [alExito, clientId, guardarSesion]);

  if (!clientId) {
    return (
      <div className="auth-google-aviso">
        Configura VITE_GOOGLE_CLIENT_ID para activar Google.
      </div>
    );
  }

  return (
    <div className="auth-google">
      <div className="auth-separador"><span>o</span></div>
      <div ref={contenedorRef} className="auth-google-boton" />
      <div className="auth-google-ayuda">
        Origen OAuth actual: <strong>{origenActual}</strong>
      </div>
      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}

export default BotonGoogle;
