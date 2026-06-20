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
          <strong style={{ color: 'var(--texto-secundario)' }}>Cuentas de prueba:</strong><br />
          Usuario: carlos@correo.com / Usuario123<br />
          Operador: operador@emergencias.com / Operador123<br />
          Admin: admin@emergencias.com / Admin123<br />
          <br />
          <strong style={{ color: 'var(--texto-secundario)' }}>Unidades de emergencia (pass: 1234):</strong><br />
          UPCs: upc01@emergencias.com ... upc15@emergencias.com<br />
          Bomberos: bomb01@emergencias.com ... bomb04@emergencias.com<br />
          Hospitales: hosp01@emergencias.com ... hosp10@emergencias.com<br />
          ECU 911: ecu911@emergencias.com
        </div>
      </div>
    </div>
  );
}

export default LoginPagina;
