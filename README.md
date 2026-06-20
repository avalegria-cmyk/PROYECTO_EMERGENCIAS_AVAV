# Sistema Distribuido de Emergencias

Aplicación web para reportar, gestionar y analizar emergencias en tiempo real. Integra una SPA en React, una API REST en Express, comunicación bidireccional con Socket.IO, autenticación JWT y Google, mapas con Leaflet, procesamiento concurrente y módulos de analítica y predicción.

## Funcionalidades

- Registro e inicio de sesión local o mediante Google Identity Services.
- Autorización por roles: ciudadano, operador y administrador.
- Creación de reportes con ubicación y archivos multimedia.
- Asignación de unidades y seguimiento del estado de las emergencias.
- Mapa interactivo, cálculo de rutas y animación del desplazamiento.
- Chat y videollamada en tiempo real mediante Socket.IO y WebRTC.
- Clasificación concurrente de gravedad con Worker Threads.
- Paneles de indicadores y predicciones basados en los datos del proyecto.

La documentación técnica ampliada se encuentra en [DOCUMENTACION.md](DOCUMENTACION.md).

## Tecnologías

- Frontend: React 19, Vite 8, React Router, Leaflet y Socket.IO Client.
- Backend: Node.js, Express 4, Socket.IO, JWT, bcryptjs y Google Auth Library.
- Datos: almacenamiento en memoria, archivos CSV/JSON y notebooks de Jupyter.

## Requisitos

- Node.js `20.19` o superior, o `22.12` o superior.
- npm.
- Git.
- Un navegador moderno con acceso a geolocalización y cámara si se probarán esas funciones.
- Opcional: credenciales OAuth 2.0 de Google para habilitar el acceso con Google.

## Instalación

1. Clone el repositorio:

   ```bash
   git clone https://github.com/avalegria-cmyk/PROYECTO_EMERGENCIAS_AVAV.git
   cd PROYECTO_EMERGENCIAS_AVAV
   ```

2. Instale las dependencias del backend y frontend:

   ```bash
   cd backend
   npm ci
   cd ../frontend
   npm ci
   cd ..
   ```

3. Cree los archivos locales de configuración a partir de los ejemplos:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. Edite ambos archivos `.env`. Como mínimo, genere un secreto JWT único para su entorno:

   ```bash
   openssl rand -hex 64
   ```

   Copie el resultado en `JWT_SECRET` dentro de `backend/.env`. No publique ese valor.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto HTTP del backend. Valor habitual: `3001`. |
| `JWT_SECRET` | Sí | Secreto largo y aleatorio utilizado para firmar los tokens. |
| `JWT_EXPIRATION` | No | Vigencia de los JWT, por ejemplo `24h`. |
| `CORS_ORIGIN` | Sí | Orígenes permitidos separados por comas. |
| `GOOGLE_CLIENT_ID` | No | Client ID de Google; debe coincidir con el del frontend. |
| `SEED_DEMO_USERS` | No | Crea cuentas de demostración cuando su valor es `true`. |
| `DEMO_ADMIN_PASSWORD` | Condicional | Contraseña local para las cuentas administrativas de demostración. |
| `DEMO_OPERATOR_PASSWORD` | Condicional | Contraseña del operador central de demostración. |
| `DEMO_USER_PASSWORD` | Condicional | Contraseña de los ciudadanos de demostración. |
| `DEMO_UNIT_PASSWORD` | Condicional | Contraseña de las unidades operativas de demostración. |

Las cuatro variables `DEMO_*_PASSWORD` son obligatorias solamente cuando `SEED_DEMO_USERS=true`. Las cuentas precargadas son exclusivas para pruebas y no deben habilitarse en producción.

### Frontend (`frontend/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | No | Client ID público de Google usado por la interfaz. |
| `VITE_SOCKET_URL` | No | URL del servidor Socket.IO. Vacía usa el mismo origen y el proxy de Vite. |

Las variables prefijadas con `VITE_` quedan expuestas al navegador. Nunca coloque secretos o claves privadas en ellas.

## Ejecución en desarrollo

Abra dos terminales.

Terminal 1, backend:

```bash
cd backend
npm run dev
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Abra `http://localhost:5173`. La API estará disponible en `http://localhost:3001` y puede comprobarse con:

```bash
curl http://localhost:3001/api/salud
```

Los usuarios pueden registrarse desde la interfaz. Si necesita las cuentas de demostración, active `SEED_DEMO_USERS` y defina sus contraseñas solo en el archivo local `backend/.env`.

## Google OAuth

1. Cree un Client ID para aplicación web en Google Cloud Console.
2. Registre el origen exacto del frontend, por ejemplo `http://localhost:5173`.
3. Coloque el mismo Client ID en `GOOGLE_CLIENT_ID` y `VITE_GOOGLE_CLIENT_ID`.
4. Reinicie ambos procesos después de modificar los archivos `.env`.

El Client ID identifica a la aplicación, pero no sustituye a un secreto. No agregue Client Secrets de Google al frontend.

## HTTPS local opcional

Vite activa HTTPS cuando encuentra estos dos archivos:

- `frontend/certs/local.crt`: certificado local.
- `frontend/certs/local.key`: clave privada local.

La clave `.key` está ignorada por Git y nunca debe publicarse. Un certificado autofirmado cifra la conexión, pero el navegador o el teléfono mostrará una advertencia hasta que el certificado sea confiable para el dispositivo. Al activar HTTPS, actualice `CORS_ORIGIN` con el esquema `https://`.

## Compilación del frontend

```bash
cd frontend
npm run build
npm run preview
```

## Seguridad y datos

- Los archivos `.env`, claves privadas, dependencias y artefactos compilados están excluidos mediante `.gitignore`.
- Los archivos `.env.example` contienen solo nombres de variables y valores de referencia no secretos.
- El almacenamiento actual de usuarios y reportes es en memoria; los datos se pierden al reiniciar el backend.
- Las cuentas de demostración están deshabilitadas por defecto y sus contraseñas se suministran por entorno.
- Si un secreto fue publicado anteriormente, debe considerarse comprometido y reemplazarse.

Antes de cada publicación, puede revisar posibles secretos con:

```bash
git grep -n -I -E 'PRIVATE KEY|JWT_SECRET=|CLIENT_SECRET=|PASSWORD='
```

## Estructura principal

```text
.
|-- backend/          # API REST, servicios, Worker Threads y Socket.IO
|-- frontend/         # SPA React, mapas, chat y paneles
|-- data_science/     # Notebooks, datos procesados y predicciones
|-- tools/            # Utilidades de documentación
|-- DOCUMENTACION.md  # Documentación técnica ampliada
`-- README.md
```

## Licencia

Proyecto académico desarrollado para la asignatura Aplicaciones Distribuidas de la Universidad de las Fuerzas Armadas ESPE.
