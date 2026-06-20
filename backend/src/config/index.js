// Configuracion centralizada del servidor
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  throw new Error('JWT_SECRET es obligatoria. Configure backend/.env antes de iniciar el servidor.');
}

const corsOrigen = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origen => origen.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const configuracion = {
  puerto: parseInt(process.env.PORT, 10) || 3001,
  jwt: {
    secreto: jwtSecret,
    expiracion: process.env.JWT_EXPIRATION || '24h'
  },
  cors: {
    origen: corsOrigen.length === 1 ? corsOrigen[0] : corsOrigen
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  },
  usuariosPrueba: {
    habilitados: process.env.SEED_DEMO_USERS === 'true',
    contrasenas: {
      administrador: process.env.DEMO_ADMIN_PASSWORD || '',
      operador: process.env.DEMO_OPERATOR_PASSWORD || '',
      usuario: process.env.DEMO_USER_PASSWORD || '',
      unidad: process.env.DEMO_UNIT_PASSWORD || ''
    }
  }
};

module.exports = configuracion;
