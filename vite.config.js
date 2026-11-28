import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Vite config — optimised for static hosting (Vercel, Netlify, GitHub Pages).
 * Pure client-side single page web game.
 */
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'HARI.FLY',
        short_name: 'HARI.FLY',
        description: 'A fast, mobile-first flying game.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#090d16',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp3|mpeg|ogg|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hari-fly-audio',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hari-fly-images',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
