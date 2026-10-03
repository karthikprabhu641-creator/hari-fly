import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — optimised for Vercel deployment.
 *
 * Leaderboard is powered by Supabase (real free database).
 * Required env vars (set in Vercel dashboard → Environment Variables):
 *
 *   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
 *   VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
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
