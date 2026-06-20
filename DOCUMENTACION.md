# 🚨 Sistema de Emergencias - Documentación Técnica

## 📋 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | ^19 | Librería UI para componentes interactivos |
| **React Router** | ^7 | Enrutamiento SPA (panel usuario, operador, login) |
| **Leaflet** | ^1.9 | Mapas interactivos con OpenStreetMap |
| **Socket.IO Client** | ^4 | Comunicación en tiempo real (chat + reportes) |
| **Vite** | ^7 | Bundler y servidor de desarrollo |
| **CSS Variables** | — | Sistema de diseño neumorphism oscuro |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | ^26 | Entorno de ejecución |
| **Express** | ^4 | Framework HTTP y middleware |
| **Socket.IO** | ^4 | WebSockets para tiempo real |
| **JWT (jsonwebtoken)** | ^9 | Autenticación basada en tokens |
| **bcryptjs** | ^2 | Hashing de contraseñas |
| **UUID** | ^11 | IDs únicos para reportes |
| **Logger personalizado** | — | Sistema de logs con colores y timestamps |

### Datos
| Componente | Descripción |
|------------|-------------|
| **Memoria RAM** | Almacenamiento en `Map()` para usuarios y reportes |
| **Grafo vial de Quito** | 37 nodos + 65 aristas con datos reales de la ciudad |
| **OSRM API** | Enrutamiento libre para rutas en el mapa |

---

## 📁 Estructura del Proyecto

```
Proyecto_Emergencias/
├── backend/
│   └── src/
│       ├── almacenamiento/       # Repositorio en memoria (usuarios, reportes)
│       ├── controladores/        # Handlers HTTP (autenticación, reportes, usuarios)
│       ├── excepciones/          # Clases de error personalizadas
│       ├── middlewares/          # Auth middleware (JWT)
│       ├── observabilidad/       # Logger con colores
│       ├── rutas/                # Definiciones de rutas Express
│       ├── servicios/            # Lógica de negocio
│       ├── utilidades/           # JWT utils, hash utils
│       ├── websocket/            # Socket.IO handlers (chat)
│       └── index.js              # Punto de entrada del servidor
├── frontend/
│   └── src/
│       ├── componentes/
│       │   ├── autenticacion/    # Login, Registro
│       │   ├── chat/             # PanelChat, MensajeChat, EntradaChat
│       │   ├── comunes/          # Navbar, Loader, Modal, Notificaciones
│       │   ├── mapa/             # MapaReportes, MapaRuta, SelectorUbicacion
│       │   └── reportes/         # DetalleReporte, FormularioReporte, TarjetaReporte
│       ├── config/               # api.js (fetch wrapper)
│       ├── contextos/            # AuthContext, NotificacionContext, SocketContext
│       ├── datos/                # emergencia.datos.js (datos de Quito)
│       ├── hooks/                # useSocket, useAutenticacion, useGeolocalizacion
│       ├── paginas/
│       │   ├── operador/         # PanelOperador, DetalleEmergencia
│       │   └── usuario/          # PanelUsuario
│       └── servicios/            # reportes.servicio.js, autenticacion.servicio.js
```

---

## 👥 Roles y Funcionalidades

### 👤 Usuario ciudadano
- Registro e inicio de sesión
- Crear reportes de emergencia (con foto/video + ubicación)
- Ver historial de sus reportes con estados
- Chat en tiempo real con el operador en cada reporte

### 🛡️ Operador
- Panel central con lista de reportes activos + mapa
- Ver detalle de emergencia con:
  - Información completa del reporte
  - Mapa con ruta desde la unidad más cercana
  - Cambio de estado (pendiente → en proceso → resuelto)
  - Chat en vivo con el ciudadano
- Animación de patrulla moviéndose hacia la emergencia (al activar "en proceso")

### 🔧 Administrador
- Acceso al panel de operador
- Gestión de usuarios del sistema

---

## 🔌 API REST

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/autenticacion/registro` | Registrar nuevo usuario |
| POST | `/api/autenticacion/login` | Iniciar sesión (retorna JWT) |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes` | Listar reportes (filtro: `?estado=`) |
| GET | `/api/reportes/:id` | Obtener detalle de reporte |
| POST | `/api/reportes` | Crear nuevo reporte |
| PATCH | `/api/reportes/:id/estado` | Cambiar estado (pendiente/en_proceso/resuelto) |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios/perfil` | Obtener perfil del usuario autenticado |

---

## 🔌 WebSockets (Socket.IO)

### Eventos de Reportes (tiempo real)
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `reporte:nuevo` | Servidor → Cliente | Nuevo reporte creado |
| `reporte:estadoCambiado` | Servidor → Cliente | Estado de reporte actualizado |
| `reporte:gravedadActualizada` | Servidor → Cliente | Gravedad modificada |
| `reporte:unidadAsignada` | Servidor → Cliente | Unidad asignada al reporte |
| `emergencia:asignada` | Servidor → Cliente | Notificación de asignación directa al operador |

### Eventos de Chat (por sala `emergencia-{reporteId}`)
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `chat:unirse` | Cliente → Servidor | Unirse a sala de chat |
| `chat:salir` | Cliente → Servidor | Salir de sala de chat |
| `chat:asignarNombre` | Cliente → Servidor | Asignar nombre al usuario |
| `chat:mensaje` | Bidireccional | Enviar/recibir mensaje de texto |
| `chat:imagen` | Cliente → Servidor | Enviar imagen (base64) |
| `chat:video` | Cliente → Servidor | Enviar video (base64) |
| `chat:sistema` | Servidor → Cliente | Notificación de entrada/salida |
| `chat:escribiendo` | Bidireccional | Indicador de escritura |
| `chat:dejoDeEscribir` | Bidireccional | Dejó de escribir |
| `chat:error` | Servidor → Cliente | Error del chat |
| `chat:historial` | Servidor → Cliente | Historial de mensajes (al unirse) |

---

## 📐 Arquitectura del Chat

```
[Usuario] ──socket──► [Servidor Socket.IO] ──socket──► [Operador]
                        │
                   Sala: emergencia-{id}
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        Historial(Map)       Logs (consola)
        (100 msgs por sala)
```

Los **mensajes de sistema** (entrada/salida de usuarios) se almacenan como mensajes normales con `tipo: 'sistema'` para mantener el orden cronológico dentro del flujo del chat.

---

## 🗺️ Sistema de Mapas y Rutas

### Datos reales de Quito
- **15 UPCs** distribuidas por la ciudad
- **4 Estaciones de bomberos**
- **10 Hospitales y clínicas**
- **1 Centro ECU 911**
- **37 nodos viales** (intersecciones principales)
- **65 aristas** (conexiones entre nodos)

### Algoritmo de ruta
1. **Haversine**: Calcula distancia entre coordenadas
2. **Dijkstra**: Encuentra la ruta más corta en el grafo vial
3. **OSRM API**: Traza la ruta real por calles (fallback a línea recta punteada)

### Animación de patrulla
- Cuando el operador cambia estado a **"en proceso"**, la patrulla se mueve suavemente desde su origen hasta la emergencia usando `requestAnimationFrame` + `setLatLng` de Leaflet
- Easing cúbico (`1 - (1-t)³`) para un movimiento más natural
- Brillo azul durante el trayecto, glow verde al llegar a destino

---

## 🧩 Componentes Clave

### PanelChat (`frontend/src/componentes/chat/PanelChat.jsx`)
- Maneja el estado de conexión, nombre de usuario y mensajes
- Los mensajes de sistema se **entremezclan** con mensajes normales (no van aparte)
- Scroll automático al fondo con cada mensaje nuevo
- Soporta texto, imágenes y videos

### MapaRuta (`frontend/src/componentes/mapa/MapaRuta.jsx`)
- Calcula la unidad policial más cercana usando Dijkstra
- Dibuja ruta con OSRM
- Animación fluida de la patrulla usando Leaflet nativo (`setLatLng`)

### DetalleReporte (`frontend/src/componentes/reportes/DetalleReporte.jsx`)
- Muestra toda la información del reporte
- Botones de cambio de estado según el estado actual
- Badge con colores: 🟡 Pendiente, 🔵 En proceso, 🟢 Resuelto

---

## 🔐 Cuentas de prueba

Las cuentas de demostración están deshabilitadas por defecto. Para utilizarlas en un entorno local, configure `SEED_DEMO_USERS=true` y defina las cuatro variables `DEMO_*_PASSWORD` descritas en `backend/.env.example`. Las contraseñas no se almacenan en el repositorio y deben compartirse únicamente mediante un canal seguro.

---

## 🚀 Cómo Ejecutar

### Backend
```bash
cd Proyecto_Emergencias/backend
npm install
npm run dev   # Inicia en http://localhost:3001
```

### Frontend
```bash
cd Proyecto_Emergencias/frontend
npm install
npm run dev   # Inicia en http://localhost:5173
```

---

## 🛠️ Últimos Arreglos Realizados

1. **Chat**: Los mensajes de sistema ahora se entremezclan con los mensajes normales para mantener el orden cronológico correcto
2. **Animación de patrulla**: Refactorizada para usar `requestAnimationFrame` + `setLatLng` de Leaflet (en lugar de CSS `translate`), logrando movimiento fluido y confiable
3. **Corrección ortográfica**: Se corrigieron múltiples errores de tildes y ortografía en español en todo el frontend y backend
