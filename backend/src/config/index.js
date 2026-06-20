// Configuracion centralizada del servidor
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const corsOrigen = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origen => origen.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const configuracion = {
  puerto: parseInt(process.env.PORT, 10) || 3001,
  jwt: {
    secreto: process.env.JWT_SECRET || 'secreto_por_defecto',
    expiracion: process.env.JWT_EXPIRATION || '24h'
  },
  cors: {
    origen: corsOrigen.length === 1 ? corsOrigen[0] : corsOrigen
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  }
};

module.exports = configuracion;
