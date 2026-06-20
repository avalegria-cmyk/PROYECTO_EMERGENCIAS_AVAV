// Tarjeta visual de un reporte con estado, gravedad y descripcion
function TarjetaReporte({ reporte, alClick }) {
  // Formatea la fecha a formato legible
  function formatearFecha(iso) {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Traduce el estado a texto legible
  function textoEstado(estado) {
    const mapa = {
      pendiente: 'Pendiente',
      aceptado: 'Aceptado',
      en_camino: 'En camino',
      en_proceso: 'Aceptado',
      resuelto: 'Resuelto'
    };
    return mapa[estado] || estado;
  }

  // Traduce el tipo a texto legible
  function textoTipo(tipo) {
    const mapa = {
      robo: 'Robo',
      incendio: 'Incendio',
      accidente: 'Accidente',
      desastre_natural: 'Desastre natural',
      otro: 'Otro'
    };
    return mapa[tipo] || tipo;
  }

  // Clase CSS de la tarjeta segun gravedad
  const claseTarjeta = `tarjeta-reporte gravedad-${reporte.gravedad}`;

  // Clase CSS del badge de estado
  const claseEstado = `badge badge-${reporte.estado.replace('_', '-')}`;

  return (
    <article className={claseTarjeta} onClick={() => alClick(reporte)} id={`reporte-${reporte.id}`}>
      <div className="tarjeta-cabecera">
        <span className="tarjeta-tipo">{textoTipo(reporte.tipo)}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className={`badge badge-${reporte.gravedad}`}>
            {reporte.gravedad}
          </span>
          <span className={claseEstado}>
            {textoEstado(reporte.estado)}
          </span>
        </div>
      </div>

      <p className="tarjeta-descripcion">{reporte.descripcion}</p>

      <div className="tarjeta-pie">
        <span className="tarjeta-direccion">
          {reporte.ubicacion?.direccion || 'Sin ubicacion'}
        </span>
        <span>{formatearFecha(reporte.fechaCreacion)}</span>
      </div>
    </article>
  );
}

export default TarjetaReporte;
