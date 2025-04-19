import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import websocket from '@fastify/websocket';
import os from 'os';
import fastifyCors from '@fastify/cors';
import BaseDeDatos from 'better-sqlite3';

const aplicacion: FastifyInstance = Fastify({});
const mensajesParaGabo = new BaseDeDatos('mensajes.db');

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
    const idioma = peticion.headers['accept-language'];

    console.log('IP:', ip);
    console.log('Dispositivo:', dispositivo);
    console.log('Idioma:', idioma);

    conexion.send('https://unmensajeparagabo.enflujo.com');

    conexion.on('message', (msg) => {
      console.log('Mensaje recibido del cliente:', msg.toString());
    });

    conexion.on('close', () => {
      console.log('Cliente desconectado');
    });
  });
});

aplicacion.post('/mensaje', async (peticion) => {
  const { mensaje } = peticion.body as { mensaje: string };
  const ip = peticion.ip; // IP del cliente
  const dispositivo = peticion.headers['user-agent'];
  const idioma = peticion.headers['accept-language'];
  const fecha = new Date().toISOString();

  // Guardar el mensaje en la base de datos
  const consulta = mensajesParaGabo.prepare(
    'INSERT INTO mensajes (mensaje, ip, dispositivo, idioma, fecha) VALUES (?, ?, ?, ?, ?)'
  );
  consulta.run(mensaje, ip, dispositivo, idioma, fecha);

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
