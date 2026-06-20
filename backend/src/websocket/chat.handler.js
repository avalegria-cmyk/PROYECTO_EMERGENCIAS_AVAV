// Handler de chat por sala de emergencia - con soporte de multimedia y typing
const logger = require('../observabilidad/logger');

// Historial de mensajes por sala (máximo 100 mensajes por sala)
const historialPorSala = new Map();
const MAXIMO_HISTORIAL = 100;
const participantesVideoPorSala = new Map();

// Tamaño máximo de archivos multimedia (5 MB en base64)
const TAMANIO_MAXIMO_MEDIA = 5 * 1024 * 1024;

// Registra los eventos de chat en un socket conectado
function registrarEventosChat(socket, io) {

  // Permite al usuario anonimo asignar su nombre antes de enviar mensajes
  socket.on('chat:asignarNombre', (datos) => {
    const nombre = String(datos.nombre || '').trim();
    if (!nombre || nombre.length > 30) {
      socket.emit('chat:error', { mensaje: 'El nombre debe tener entre 1 y 30 caracteres' });
      return;
    }
    socket.usuario.nombre = nombre;
    socket.emit('chat:nombreAsignado', { nombre });
    logger.info('CHAT', `Nombre asignado: ${nombre} (${socket.usuario.id})`);
  });

  // El usuario se une a la sala de chat de una emergencia
  socket.on('chat:unirse', (datos) => {
    const sala = `emergencia-${datos.reporteId}`;

    // Sale de salas previas de chat
    for (const salaPrev of socket.rooms) {
      if (salaPrev.startsWith('emergencia-') && salaPrev !== sala) {
        socket.leave(salaPrev);
      }
    }

    socket.join(sala);
    socket.salaActual = sala;

    // Envia el historial de la sala
    const historial = historialPorSala.get(sala) || [];
    socket.emit('chat:historial', historial);

    // Notifica a los demas si tiene nombre
    if (socket.usuario.nombre) {
      socket.to(sala).emit('chat:sistema', {
        texto: `${socket.usuario.nombre} se unio al chat`,
        fecha: new Date().toISOString()
      });
    }

    logger.info('CHAT', `${socket.usuario.nombre || 'Anonimo'} se unio a ${sala}`);
  });

  // Recibe un mensaje de texto
  socket.on('chat:mensaje', (datos) => {
    if (!socket.salaActual) return;
    if (!socket.usuario.nombre) {
      socket.emit('chat:error', { mensaje: 'Debes ingresar un nombre antes de enviar mensajes' });
      return;
    }

    const texto = String(datos.texto || '').trim();
    if (!texto) return;

    const mensaje = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 5),
      tipo: 'texto',
      usuario: { id: socket.usuario.id, nombre: socket.usuario.nombre },
      texto: texto.slice(0, 1000),
      fecha: new Date().toISOString()
    };

    guardarEnHistorial(socket.salaActual, mensaje);
    io.to(socket.salaActual).emit('chat:mensaje', mensaje);
    logger.debug('CHAT', `Texto en ${socket.salaActual}: ${socket.usuario.nombre}`);
  });

  // Recibe una imagen
  socket.on('chat:imagen', (datos) => {
    if (!socket.salaActual) return;
    if (!socket.usuario.nombre) {
      socket.emit('chat:error', { mensaje: 'Debes ingresar un nombre antes de enviar imagenes' });
      return;
    }

    if (!datos.contenido || datos.contenido.length > TAMANIO_MAXIMO_MEDIA) {
      socket.emit('chat:error', { mensaje: 'La imagen excede el tamaño máximo de 5 MB' });
      return;
    }

    const mensaje = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 5),
      tipo: 'imagen',
      usuario: { id: socket.usuario.id, nombre: socket.usuario.nombre },
      contenido: datos.contenido,
      nombreArchivo: datos.nombreArchivo || 'imagen',
      fecha: new Date().toISOString()
    };

    guardarEnHistorial(socket.salaActual, mensaje);
    io.to(socket.salaActual).emit('chat:mensaje', mensaje);
    logger.debug('CHAT', `Imagen en ${socket.salaActual}: ${socket.usuario.nombre}`);
  });

  // Recibe un video
  socket.on('chat:video', (datos) => {
    if (!socket.salaActual) return;
    if (!socket.usuario.nombre) {
      socket.emit('chat:error', { mensaje: 'Debes ingresar un nombre antes de enviar videos' });
      return;
    }

    if (!datos.contenido || datos.contenido.length > TAMANIO_MAXIMO_MEDIA) {
      socket.emit('chat:error', { mensaje: 'El video excede el tamaño máximo de 5 MB' });
      return;
    }

    const mensaje = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 5),
      tipo: 'video',
      usuario: { id: socket.usuario.id, nombre: socket.usuario.nombre },
      contenido: datos.contenido,
      nombreArchivo: datos.nombreArchivo || 'video',
      fecha: new Date().toISOString()
    };

    guardarEnHistorial(socket.salaActual, mensaje);
    io.to(socket.salaActual).emit('chat:mensaje', mensaje);
    logger.debug('CHAT', `Video en ${socket.salaActual}: ${socket.usuario.nombre}`);
  });

  // Indicador de escritura
  socket.on('chat:escribiendo', () => {
    if (!socket.salaActual || !socket.usuario.nombre) return;

    socket.to(socket.salaActual).emit('chat:escribiendo', {
      usuario: { id: socket.usuario.id, nombre: socket.usuario.nombre }
    });
  });

  // Dejo de escribir
  socket.on('chat:dejoDeEscribir', () => {
    if (!socket.salaActual || !socket.usuario.nombre) return;

    socket.to(socket.salaActual).emit('chat:dejoDeEscribir', {
      usuario: { id: socket.usuario.id, nombre: socket.usuario.nombre }
    });
  });

  socket.on('video:unirse', (datos = {}) => {
    if (!socket.salaActual || !socket.usuario.nombre) return;

    const salaVideo = `${socket.salaActual}:video`;
    socket.join(salaVideo);
    socket.salaVideoActual = salaVideo;

    if (!participantesVideoPorSala.has(salaVideo)) {
      participantesVideoPorSala.set(salaVideo, new Map());
    }

    const participantes = participantesVideoPorSala.get(salaVideo);
    const usuarioVideo = {
      id: socket.id,
      usuarioId: socket.usuario.id,
      nombre: socket.usuario.nombre,
      audioActivo: datos.audioActivo !== false,
      videoActivo: datos.videoActivo !== false
    };

    const existentes = Array.from(participantes.values());
    participantes.set(socket.id, usuarioVideo);

    socket.emit('video:participantes', { participantes: existentes });
    socket.to(salaVideo).emit('video:usuarioUnido', { participante: usuarioVideo });
    logger.info('CHAT_VIDEO', `${socket.usuario.nombre} entro a ${salaVideo}`);
  });

  socket.on('video:oferta', ({ para, oferta }) => {
    if (!socket.salaVideoActual || !para || !oferta) return;
    socket.to(para).emit('video:oferta', {
      de: socket.id,
      nombre: socket.usuario.nombre,
      oferta
    });
  });

  socket.on('video:respuesta', ({ para, respuesta }) => {
    if (!socket.salaVideoActual || !para || !respuesta) return;
    socket.to(para).emit('video:respuesta', {
      de: socket.id,
      respuesta
    });
  });

  socket.on('video:ice', ({ para, candidato }) => {
    if (!socket.salaVideoActual || !para || !candidato) return;
    socket.to(para).emit('video:ice', {
      de: socket.id,
      candidato
    });
  });

  socket.on('video:estadoMedia', (estado = {}) => {
    if (!socket.salaVideoActual) return;
    const participantes = participantesVideoPorSala.get(socket.salaVideoActual);
    const participante = participantes?.get(socket.id);
    if (participante) {
      participante.audioActivo = estado.audioActivo !== false;
      participante.videoActivo = estado.videoActivo !== false;
      participantes.set(socket.id, participante);
    }
    socket.to(socket.salaVideoActual).emit('video:estadoMedia', {
      id: socket.id,
      audioActivo: estado.audioActivo !== false,
      videoActivo: estado.videoActivo !== false
    });
  });

  socket.on('video:salir', () => {
    salirVideo(socket);
  });

  // El usuario sale de la sala de chat
  socket.on('chat:salir', () => {
    if (socket.salaActual) {
      if (socket.usuario.nombre) {
        socket.to(socket.salaActual).emit('chat:sistema', {
          texto: `${socket.usuario.nombre} salio del chat`,
          fecha: new Date().toISOString()
        });
      }
      socket.leave(socket.salaActual);
      salirVideo(socket);
      logger.info('CHAT', `${socket.usuario.nombre || 'Anonimo'} salio de ${socket.salaActual}`);
      socket.salaActual = null;
    }
  });
}

// Guarda un mensaje en el historial de la sala
function guardarEnHistorial(sala, mensaje) {
  if (!historialPorSala.has(sala)) {
    historialPorSala.set(sala, []);
  }
  const historial = historialPorSala.get(sala);
  historial.push(mensaje);
  if (historial.length > MAXIMO_HISTORIAL) {
    historial.shift();
  }
}

// Limpia la referencia de sala cuando el socket se desconecta
function alDesconectar(socket, io) {
  salirVideo(socket);
  if (socket.salaActual && socket.usuario.nombre) {
    socket.to(socket.salaActual).emit('chat:sistema', {
      texto: `${socket.usuario.nombre} se desconecto`,
      fecha: new Date().toISOString()
    });
  }
}

function salirVideo(socket) {
  if (!socket.salaVideoActual) return;
  const salaVideo = socket.salaVideoActual;
  const participantes = participantesVideoPorSala.get(salaVideo);
  if (participantes) {
    participantes.delete(socket.id);
    if (participantes.size === 0) {
      participantesVideoPorSala.delete(salaVideo);
    }
  }
  socket.to(salaVideo).emit('video:usuarioSalio', { id: socket.id });
  socket.leave(salaVideo);
  logger.info('CHAT_VIDEO', `${socket.usuario.nombre || 'Anonimo'} salio de ${salaVideo}`);
  socket.salaVideoActual = null;
}

module.exports = { registrarEventosChat, alDesconectar };
