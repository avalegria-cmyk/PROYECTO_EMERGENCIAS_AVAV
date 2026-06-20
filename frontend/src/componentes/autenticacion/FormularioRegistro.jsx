// Formulario de registro con validacion de campos
import { useState } from 'react';
import { registrar } from '../../servicios/autenticacion.servicio';
import useAutenticacion from '../../hooks/useAutenticacion';

function FormularioRegistro({ alExito }) {
  const { guardarSesion } = useAutenticacion();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Envia el formulario de registro
  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    if (contrasena.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await registrar(nombre, correo, contrasena);
      guardarSesion(respuesta.datos.token, respuesta.datos.usuario);
      if (alExito) alExito(respuesta.datos.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio} id="formulario-registro">
      {error && <div className="auth-error">{error}</div>}

      <div className="campo">
        <label className="campo-etiqueta" htmlFor="registro-nombre">Nombre completo</label>
        <input
          id="registro-nombre"
          className="campo-input"
          type="text"
          placeholder="Tu nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label className="campo-etiqueta" htmlFor="registro-correo">Correo electronico</label>
        <input
          id="registro-correo"
          className="campo-input"
          type="email"
          placeholder="correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label className="campo-etiqueta" htmlFor="registro-contrasena">Contrasena</label>
        <input
          id="registro-contrasena"
          className="campo-input"
          type="password"
          placeholder="Minimo 6 caracteres"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primario btn-grande w-full"
        disabled={cargando}
        id="btn-registrarse"
      >
        {cargando ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}

export default FormularioRegistro;
