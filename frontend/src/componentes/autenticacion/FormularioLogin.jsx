// Formulario de inicio de sesion con validacion
import { useState } from 'react';
import { iniciarSesion } from '../../servicios/autenticacion.servicio';
import useAutenticacion from '../../hooks/useAutenticacion';

function FormularioLogin({ alExito }) {
  const { guardarSesion } = useAutenticacion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Envia el formulario de login
  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await iniciarSesion(correo, contrasena);
      guardarSesion(respuesta.datos.token, respuesta.datos.usuario);
      if (alExito) alExito(respuesta.datos.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio} id="formulario-login">
      {error && <div className="auth-error">{error}</div>}

      <div className="campo">
        <label className="campo-etiqueta" htmlFor="login-correo">Correo electronico</label>
        <input
          id="login-correo"
          className="campo-input"
          type="email"
          placeholder="correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label className="campo-etiqueta" htmlFor="login-contrasena">Contrasena</label>
        <input
          id="login-contrasena"
          className="campo-input"
          type="password"
          placeholder="Tu contrasena"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primario btn-grande w-full"
        disabled={cargando}
        id="btn-login"
      >
        {cargando ? 'Ingresando...' : 'Iniciar sesion'}
      </button>
    </form>
  );
}

export default FormularioLogin;
