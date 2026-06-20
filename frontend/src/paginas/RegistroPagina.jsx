// Pagina de registro de nuevo usuario
import { useNavigate, Link } from 'react-router-dom';
import FormularioRegistro from '../componentes/autenticacion/FormularioRegistro';
import BotonGoogle from '../componentes/autenticacion/BotonGoogle';

function RegistroPagina() {
  const navigate = useNavigate();

  // Redirige al panel del usuario después de registrarse
  function manejarExito() {
    navigate('/panel');
  }

  return (
    <div className="pagina-auth">
      <div className="auth-tarjeta">
        <div className="auth-logo">E</div>
        <h1 className="auth-titulo">Crear cuenta</h1>
        <p className="auth-subtitulo">Registrate para reportar emergencias</p>

        <FormularioRegistro alExito={manejarExito} />
        <BotonGoogle alExito={manejarExito} />

        <p className="auth-enlace">
          Ya tienes cuenta? <Link to="/login">Iniciar sesion</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistroPagina;
