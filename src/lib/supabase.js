/**
 * Supabase Client
 * Initialises the Supabase JS client using environment variables injected by Vite.
 *
 * Required env vars (set in .env.local for dev, Vercel dashboard for production):
 *   VITE_SUPABASE_URL   – your project URL  (e.g. https://xxxx.supabase.co)
 *   VITE_SUPABASE_ANON_KEY – your project's public anon key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Create a .env.local file in the project root with those values.\n' +
    'The leaderboard will show an empty state until you configure it.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
