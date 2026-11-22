import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// @ts-expect-error process is a Node global at config time
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  // Relative base so the bundle also works from file:// inside the Tauri shell
  base: './',
  clearScreen: false,
  server: {
    port: 1420,
    allowedHosts: true,
    strictPort: true,
    host: host || false,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
});
