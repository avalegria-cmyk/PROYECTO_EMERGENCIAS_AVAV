// Pagina de inicio de sesion
import { useNavigate, Link } from 'react-router-dom';
import FormularioLogin from '../componentes/autenticacion/FormularioLogin';
import BotonGoogle from '../componentes/autenticacion/BotonGoogle';

function LoginPagina() {
  const navigate = useNavigate();

  // Redirige segun el rol del usuario al iniciar sesion
  function manejarExito(usuario) {
    if (usuario.rol === 'operador' || usuario.rol === 'administrador') {
      navigate('/operador');
    } else {
      navigate('/');
    }
  }

  return (
    <div className="pagina-auth">
      <div className="auth-tarjeta">
        <div className="auth-logo">E</div>
        <h1 className="auth-titulo">Bienvenido</h1>
        <p className="auth-subtitulo">Sistema de Reporte de Emergencias</p>

        <FormularioLogin alExito={manejarExito} />
        <BotonGoogle alExito={manejarExito} />

        <p className="auth-enlace">
          No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'var(--fondo-elevado)',
          borderRadius: 'var(--radio-md)',
          fontSize: '0.8rem',
          color: 'var(--texto-terciario)'
        }}>
          Las cuentas de demostración están deshabilitadas por defecto. Si el administrador
          las habilita, debe proporcionar las credenciales mediante un canal seguro.
        </div>
      </div>
    </div>
  );
}

export default LoginPagina;
