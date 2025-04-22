import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import websocket, { type WebSocket } from '@fastify/websocket';
import os from 'os';
import fastifyCors from '@fastify/cors';
import BaseDeDatos from 'better-sqlite3';

type idsPantallas = 'pantalla1' | 'pantalla2' | 'pantalla3' | 'pantalla4';
interface Pantalla {
  conectada: boolean;
  mensajes: string[];
  conexion: WebSocket | null;
}

const aplicacion: FastifyInstance = Fastify({});
const mensajesParaGabo = new BaseDeDatos('./mensajes.db');

// Crear la tabla si no existe
mensajesParaGabo.exec(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mensaje TEXT NOT NULL,
    ip TEXT,
    dispositivo TEXT,
    idioma TEXT,
    fecha TEXT
  )
`);

const pantallas: { [llave: string]: Pantalla } = {
  pantalla1: { conectada: false, mensajes: [], conexion: null },
  pantalla2: { conectada: false, mensajes: [], conexion: null },
  pantalla3: { conectada: false, mensajes: [], conexion: null },
  pantalla4: { conectada: false, mensajes: [], conexion: null },
};
let ultimaPantallaConectada: idsPantallas | null = null;
let indicePantallaActual = 0;
const nombresPantallas: idsPantallas[] = ['pantalla1', 'pantalla2', 'pantalla3', 'pantalla4'];

aplicacion.register(fastifyCors, {
  origin: '*', // Esto permite conexiones desde cualquier origen. Puedes restringirlo si lo deseas.
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
});

aplicacion.register(websocket);

aplicacion.register(async function (fastify) {
  // Estigia es el río que separa el mundo de los vivos del inframundo en la mitología griega.
  // estigia es acá el canal de comunicación entre el cliente y el servidor, o entre los vivos y Gabo.
  fastify.get('/estigia', { websocket: true }, (conexion, peticion) => {
    console.log('Cliente conectado');

    // Obtener información del encabezado
    const ip = peticion.ip; // IP del cliente
    const dispositivo = peticion.headers['user-agent'];

    // Verificar si el cliente es ESP32 que usa "TinyWebsockets Client", de lo contrario cerrar la conexión.
    if (!dispositivo || (dispositivo && dispositivo !== 'TinyWebsockets Client')) {
      console.log('El cliente no es TinyWebsockets Client');
      conexion.close();
      return;
    }

    console.log('IP de la ESP32:', ip);
    console.log('Dispositivo:', dispositivo);

    // conexion.send('https://unmensajeparagabo.enflujo.com');

    conexion.on('message', (carga) => {
      console.log('Mensaje recibido del cliente:', carga.toString());
      try {
        const datos = JSON.parse(carga.toString()) as { tipo: string; mensaje: string };
        const { tipo, mensaje } = datos;
        console.log('Mensaje procesado:', mensaje, tipo);

        if (tipo === 'id') {
          // Si el cliente envía un ID, se registra la pantalla como conectada
          const pantalla = mensaje as idsPantallas;
          if (pantallas[pantalla]) {
            pantallas[pantalla].conectada = true;
            pantallas[pantalla].conexion = conexion;
            ultimaPantallaConectada = pantalla;
            console.log(`${mensaje} conectada`);
          } else {
            console.log(`${mensaje} no válida`);
          }
        }
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    conexion.on('close', () => {
      console.log('Cliente desconectado');

      // Buscar qué pantalla estaba usando esta conexión y limpiarla
      for (const [nombrePantalla, pantalla] of Object.entries(pantallas)) {
        if (pantalla.conexion === conexion) {
          pantalla.conectada = false;
          pantalla.conexion = null;
          console.log(`Desconectada ${nombrePantalla}`);
        }
      }
    });
  });
});



aplicacion.post('/mensaje', async (peticion, respuesta) => {
  const { mensaje } = peticion.body as { mensaje?: string };

  if (!mensaje || mensaje.trim() === '') {
    return respuesta.status(400).send({ error: 'El mensaje está vacío o no fue enviado.' });
  }

  const ip = peticion.ip; // IP del cliente
  const dispositivo = peticion.headers['user-agent'];
  const idioma = peticion.headers['accept-language'];
  const fecha = new Date().toISOString();

  // Guardar el mensaje en la base de datos
  const consulta = mensajesParaGabo.prepare(
    'INSERT INTO mensajes (mensaje, ip, dispositivo, idioma, fecha) VALUES (?, ?, ?, ?, ?)'
  );
  consulta.run(mensaje, ip, dispositivo, idioma, fecha);

  let mensajeEnviado = false;
  let intentos = 0;

  // if (ultimaPantallaConectada) {
  //   const pantalla = pantallas[ultimaPantallaConectada];
  //   if (pantalla.conectada && pantalla.conexion) {
  //     pantalla.conexion.send(mensaje);
  //     console.log(`Mensaje enviado a ${ultimaPantallaConectada}:`, mensaje);
  //   } else {
  //     console.log(`La pantalla ${ultimaPantallaConectada} no está conectada.`);
  //   }
  // } else {
  //   console.log('No hay pantallas conectadas.');
  // }

  while (!mensajeEnviado && intentos < nombresPantallas.length) {
    const nombrePantalla = nombresPantallas[indicePantallaActual];
    const pantalla = pantallas[nombrePantalla];
  
    if (pantalla.conectada && pantalla.conexion) {
      pantalla.conexion.send(mensaje);
      console.log(`Mensaje enviado a ${nombrePantalla}:`, mensaje);
      mensajeEnviado = true;
    } else {
      console.log(`Pantalla ${nombrePantalla} no conectada. Se intenta con la siguiente.`);
    }
  
    indicePantallaActual = (indicePantallaActual + 1) % nombresPantallas.length;
    intentos++;
  }

  if (!mensajeEnviado) {
    console.log('No hay pantallas conectadas disponibles para recibir el mensaje.');
  }

  return { message: 'Mensaje enviado a Gabo' };
});

const start = async () => {
  try {
    await aplicacion.listen({ port: 4001, host: '0.0.0.0' });

    // Obtener la IP local de la Raspberry Pi
    const interfaces = os.networkInterfaces();
    let ipLocal = '';

    for (const interfaz of Object.values(interfaces)) {
      for (const infoInterfaz of interfaz || []) {
        // Filtrar interfaces activas y que no sean de tipo 'loopback' (127.0.0.1)
        if (!infoInterfaz.internal && infoInterfaz.family === 'IPv4') {
          ipLocal = infoInterfaz.address;
          break;
        }
      }
      if (ipLocal) break;
    }

    const url = aplicacion.server.address();
    const puerto = typeof url === 'string' ? url : url?.port;

    // Imprimir IP local y puerto
    console.log(`Servidor corriendo en http://${ipLocal}:${puerto}`);
  } catch (err) {
    aplicacion.log.error(err);
    process.exit(1);
  }
};

start();
