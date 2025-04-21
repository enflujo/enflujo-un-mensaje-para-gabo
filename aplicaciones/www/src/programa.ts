import './scss/estilos.scss';

const mensaje = document.getElementById('mensaje') as HTMLTextAreaElement;
const contador = document.getElementById('contador') as HTMLDivElement;
const enviar = document.getElementById('enviar') as HTMLButtonElement;
const formulario = document.getElementById('formulario') as HTMLFormElement;

mensaje.addEventListener('input', () => {
  const longitud = mensaje.value.length;
  contador.textContent = `${longitud} / 500`;
  enviar.disabled = longitud === 0 || longitud > 500;
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const contenido = mensaje.value.trim();
  const convertido = convertirTexto(contenido);
  console.log(convertido);

  const respuestaServidor = await fetch('https://hades-gabo.enflujo.com/mensaje', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mensaje: contenido }),
  });

  await respuestaServidor.json();
  if (respuestaServidor.ok) {
    // respuesta.innerText = 'Mensaje enviado con éxito. Gracias.';
    mensaje.value = '';
    contador.textContent = '0 / 500';
  } else {
    // respuesta.innerText = data.error || 'Hubo un problema al enviar tu mensaje.';
  }
});

// Función para codificar texto a ISO-8859-1
function convertirTexto(str: string): Uint8Array {
  const latin1Bytes: number[] = [];

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);

    // Solo incluir caracteres dentro del rango ISO-8859-1 (0x00 - 0xFF)
    if (charCode <= 0xff) {
      latin1Bytes.push(charCode);
    } else {
      // Para caracteres fuera de ISO-8859-1, puedes elegir cómo manejarlos
      // Aquí simplemente los codifico en el rango válido como un "replacement" por ejemplo
      latin1Bytes.push(0x3f); // El carácter de "reemplazo" (?)
    }
  }

  return new Uint8Array(latin1Bytes);
}
