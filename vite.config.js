import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — optimised for static hosting (Vercel, Netlify, GitHub Pages).
 * Pure client-side single page web game.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
