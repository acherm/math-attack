import { defineConfig } from 'vite';
import { serviceWorker } from './src/pwa/vite-plugin-sw.js';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Installable app: writes dist/sw.js (offline play), see src/pwa/
  plugins: [serviceWorker({ exclude: ['screenshots/'] })],
  test: {
    environment: 'node'
  }
});
