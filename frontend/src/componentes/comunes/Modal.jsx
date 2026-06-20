// Modal reutilizable con overlay y animacion
function Modal({ titulo, abierto, alCerrar, children }) {
  if (!abierto) return null;

  // Cierra el modal al hacer clic en el overlay
  function manejarClickOverlay(e) {
    if (e.target === e.currentTarget) {
      alCerrar();
    }
  }

  return (
    <div className="modal-overlay" onClick={manejarClickOverlay} id="modal-overlay">
      <div className="modal">
        <div className="modal-cabecera">
          <h2 className="modal-titulo">{titulo}</h2>
          <button className="modal-cerrar" onClick={alCerrar} id="btn-cerrar-modal">
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
