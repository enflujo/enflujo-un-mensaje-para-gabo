import './scss/estilos.scss';

const mensaje = document.getElementById('mensaje') as HTMLTextAreaElement;
const contador = document.getElementById('contador') as HTMLDivElement;
const enviar = document.getElementById('enviar') as HTMLButtonElement;

mensaje.addEventListener('input', () => {
  const longitud = mensaje.value.length;
  contador.textContent = `${longitud} / 500`;
  enviar.disabled = longitud === 0;
});
