// Vista detallada de un reporte con informacion completa
function DetalleReporte({ reporte, alCambiarEstado, esOperador }) {
  if (!reporte) return null;

  // Traduce valores a texto legible
  const textos = {
    tipo: { robo: 'Robo', incendio: 'Incendio', accidente: 'Accidente', desastre_natural: 'Desastre natural', otro: 'Otro' },
    estado: {
      pendiente: 'Pendiente',
      aceptado: 'Aceptado',
      en_camino: 'En camino',
      en_proceso: 'Aceptado',
      resuelto: 'Resuelto'
    },
    gravedad: { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Critica' }
  };

  return (
    <div className="panel-detalle" id="detalle-reporte">
      <h3 className="detalle-titulo">
        {textos.tipo[reporte.tipo] || reporte.tipo}
      </h3>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Gravedad</div>
        <span className={`badge badge-${reporte.gravedad}`}>
          {textos.gravedad[reporte.gravedad] || reporte.gravedad}
        </span>
      </div>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Estado</div>
        <span className={`badge badge-${reporte.estado.replace('_', '-')}`}>
          {textos.estado[reporte.estado] || reporte.estado}
        </span>
      </div>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Descripcion</div>
        <div className="detalle-valor">{reporte.descripcion}</div>
      </div>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Ubicacion</div>
        <div className="detalle-valor">{reporte.ubicacion?.direccion || 'No disponible'}</div>
      </div>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Reportado por</div>
        <div className="detalle-valor">{reporte.usuarioNombre}</div>
      </div>

      <div className="detalle-campo">
        <div className="detalle-etiqueta">Fecha</div>
        <div className="detalle-valor">
          {new Date(reporte.fechaCreacion).toLocaleString('es-EC')}
        </div>
      </div>

      {reporte.evidencia && (
        <div className="detalle-campo">
          <div className="detalle-etiqueta">Evidencia</div>
          <img
            src={reporte.evidencia}
            alt="Evidencia del reporte"
            className="detalle-imagen"
          />
        </div>
      )}

      {esOperador && reporte.estado !== 'resuelto' && (
        <div className="detalle-acciones">
          {reporte.estado === 'pendiente' && (
            <button
              className="btn btn-primario btn-pequeno"
              onClick={() => alCambiarEstado(reporte.id, 'aceptado')}
              id="btn-aceptar"
            >
              Aceptar peticion
            </button>
          )}
          {(reporte.estado === 'aceptado' || reporte.estado === 'en_proceso') && (
            <button
              className="btn btn-primario btn-pequeno"
              onClick={() => alCambiarEstado(reporte.id, 'en_camino')}
              id="btn-en-camino"
            >
              En camino
            </button>
          )}
          {reporte.estado === 'en_camino' && (
            <button
              className="btn btn-primario btn-pequeno"
              onClick={() => alCambiarEstado(reporte.id, 'resuelto')}
              id="btn-resuelto"
            >
              Ya llego
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DetalleReporte;
