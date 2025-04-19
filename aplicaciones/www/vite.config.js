import { defineConfig } from 'vite';

export default defineConfig({
  // base: '/',
  server: {
    port: 3000,
  },
  site: 'https://unmensajeparagabo.enflujo.com',
  publicDir: 'estaticos',
  build: {
    outDir: 'publico',
    assetsDir: 'estaticos',
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
