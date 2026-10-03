import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config
 *
 * The leaderboard is now powered by Supabase (real free database).
 * No local API middleware needed — the Supabase JS client calls
 * the Supabase REST API directly from the browser in both dev and production.
 *
 * Required env vars (create .env.local in project root for local dev;
 * set the same vars in Vercel dashboard for production):
 *
 *   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
 *   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
});
