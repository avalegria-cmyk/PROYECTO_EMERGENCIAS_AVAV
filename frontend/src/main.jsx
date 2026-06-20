// Punto de entrada de la aplicacion React
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Monta la app con manejo de errores para no dejar overlay si falla
const rootElement = document.getElementById('root');
try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  // Log en consola y muestra fallback minimal en DOM para ayudar al debug
  // No usamos React aquí porque el error puede venir de dentro de React mismo
  // Mantener la UI legible y permitir al usuario ver el error
  // eslint-disable-next-line no-console
  console.error('Error al montar la aplicación React:', err);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding:24px;color:#fff;background:#2b1222;font-family:Inter,system-ui;">
        <h2>Error al iniciar la interfaz</h2>
        <pre style="white-space:pre-wrap;color:#ffd2d2">${String(err && err.message ? err.message : err)}</pre>
        <p>Revise la consola del navegador para más detalles.</p>
      </div>
    `;
  }
} finally {
  const bootstrapEl = document.getElementById('bootstrap-status');
  if (bootstrapEl) {
    bootstrapEl.style.transition = 'opacity 250ms ease';
    bootstrapEl.style.opacity = '0';
    setTimeout(() => bootstrapEl.remove(), 300);
  }
}
