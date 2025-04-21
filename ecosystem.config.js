module.exports = {
  apps: [
    {
      name: 'unmensajeparagabo',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './aplicaciones/www/publico',
        PM2_SERVE_PORT: 4000,
      },
    },
    {
      name: 'hades',
      script: './aplicaciones/servidor/publico/hades.js',
    },
  ],
};
