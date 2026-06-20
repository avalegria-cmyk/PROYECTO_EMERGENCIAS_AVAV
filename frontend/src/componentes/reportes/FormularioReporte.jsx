// Formulario para crear un nuevo reporte de emergencia - con selector de mapa
import { useState } from 'react';
import SelectorUbicacion from '../mapa/SelectorUbicacion';

function FormularioReporte({ alEnviar, cargando }) {
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  // Convierte el archivo a base64 para enviarlo
  function manejarArchivo(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setNombreArchivo(archivo.name);
    const lector = new FileReader();
    lector.onloadend = () => setEvidencia(lector.result);
    lector.readAsDataURL(archivo);
  }

  // Recibe la ubicacion del selector de mapa
  function manejarUbicacion(coords) {
    setUbicacion(coords);
    setSelectorAbierto(false);
  }

  // Envia el formulario con los datos del reporte
  function manejarEnvio(e) {
    e.preventDefault();
    if (!tipo || !descripcion) return;

    alEnviar({
      tipo,
      descripcion,
      ubicacion: ubicacion || { lat: 0, lng: 0, direccion: 'No proporcionada' },
      evidencia
    });
  }

  return (
    <>
      <form className="formulario" onSubmit={manejarEnvio} id="formulario-reporte">
        <div className="campo">
          <label className="campo-etiqueta" htmlFor="reporte-tipo">Tipo de emergencia</label>
          <select
            id="reporte-tipo"
            className="campo-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="">Seleccionar tipo...</option>
            <option value="robo">Robo</option>
            <option value="incendio">Incendio</option>
            <option value="accidente">Accidente</option>
            <option value="desastre_natural">Desastre natural</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="campo">
          <label className="campo-etiqueta" htmlFor="reporte-descripcion">Descripcion del evento</label>
          <textarea
            id="reporte-descripcion"
            className="campo-textarea"
            placeholder="Describe lo que esta ocurriendo..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            maxLength={500}
          />
        </div>

        <div className="campo">
          <label className="campo-etiqueta">Ubicacion</label>
          <button
            type="button"
            className={`campo-ubicacion-btn ${ubicacion ? 'obtenida' : ''}`}
            onClick={() => setSelectorAbierto(true)}
            id="btn-ubicacion"
          >
            {ubicacion
              ? `Ubicacion marcada: ${ubicacion.direccion}`
              : 'Seleccionar ubicacion en el mapa'
            }
          </button>
        </div>

        <div className="campo">
          <label className="campo-etiqueta">Evidencia (imagen o video)</label>
          <div className="campo-archivo">
            <input
              type="file"
              className="campo-archivo-input"
              id="reporte-evidencia"
              accept="image/*,video/*"
              onChange={manejarArchivo}
            />
            <label
              htmlFor="reporte-evidencia"
              className={`campo-archivo-label ${nombreArchivo ? 'con-archivo' : ''}`}
            >
              {nombreArchivo || 'Seleccionar imagen o video'}
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primario btn-grande w-full"
          disabled={cargando || !tipo || !descripcion}
          id="btn-enviar-reporte"
        >
          {cargando ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </form>

      <SelectorUbicacion
        abierto={selectorAbierto}
        alSeleccionar={manejarUbicacion}
        alCerrar={() => setSelectorAbierto(false)}
      />
    </>
  );
}

export default FormularioReporte;
