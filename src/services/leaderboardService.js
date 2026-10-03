/**
 * Leaderboard & Pilot Profile Service
 * All data is real — fetched from / written to Supabase PostgreSQL.
 * Works in both local dev (Vite) and Vercel production.
 *
 * Supabase table schema (run once in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS leaderboard (
 *     id          BIGSERIAL PRIMARY KEY,
 *     username    TEXT        NOT NULL,
 *     score       INTEGER     NOT NULL CHECK (score > 0),
 *     map_id      TEXT        NOT NULL DEFAULT 'classic',
 *     created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *
 *   -- Allow anyone to read leaderboard
 *   ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public read" ON leaderboard FOR SELECT USING (true);
 *   CREATE POLICY "Public insert" ON leaderboard FOR INSERT WITH CHECK (true);
 *
 *   -- Performance indexes
 *   CREATE INDEX IF NOT EXISTS idx_lb_score ON leaderboard(score DESC);
 *   CREATE INDEX IF NOT EXISTS idx_lb_map   ON leaderboard(map_id, score DESC);
 */

import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/storage';

export const PILOT_USERNAME_STORAGE_KEY = 'hari_fly_pilot_username';

// ─── Pilot Identity ──────────────────────────────────────────────────────────

/**
 * Get the current pilot username from localStorage.
 * Returns empty string if not set.
 */
export function getPilotUsername() {
  const stored = safeStorage.getItem(PILOT_USERNAME_STORAGE_KEY, '');
  return typeof stored === 'string' ? stored.trim() : '';
}

/**
 * Persist a pilot username to localStorage.
 * @param {string} username
 * @returns {string} cleaned username
 */
export function setPilotUsername(username) {
  const clean = String(username || '').trim().slice(0, 20);
  if (clean) {
    safeStorage.setItem(PILOT_USERNAME_STORAGE_KEY, clean);
  }
  return clean;
}

/**
 * Returns true if the player has registered a call-sign of at least 2 chars.
 */
export function hasRegisteredUsername() {
  const name = getPilotUsername();
  return Boolean(name && name.length >= 2);
}

// ─── Leaderboard Fetch ───────────────────────────────────────────────────────

/**
 * Fetch top pilot scores from Supabase, grouped by username (best score per player).
 * @param {string} [mapId='all']
 * @param {number} [limit=50]
 * @returns {Promise<{ success: boolean, leaderboard: Array, count: number, isOffline?: boolean }>}
 */
export async function fetchLeaderboard(mapId = 'all', limit = 50) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));

  try {
    // Build query — get best score per username
    let query = supabase
      .from('leaderboard')
      .select('username, score, map_id, created_at')
      .order('score', { ascending: false })
      .limit(safeLimit * 5); // over-fetch so we can deduplicate by username client-side

    if (mapId && mapId !== 'all') {
      query = query.eq('map_id', mapId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Deduplicate: keep only best score per username
    const bestByUser = new Map();
    for (const row of (data || [])) {
      const existing = bestByUser.get(row.username);
      if (!existing || row.score > existing.score) {
        bestByUser.set(row.username, row);
      }
    }

    const sorted = Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit)
      .map((row, idx) => ({
        rank: idx + 1,
        username: row.username,
        score: row.score,
        mapId: row.map_id,
        createdAt: row.created_at,
      }));

    return { success: true, leaderboard: sorted, count: sorted.length };

  } catch (err) {
    console.warn('[LeaderboardService] Fetch failed:', err.message);
    // No fake data — return empty real state
    return {
      success: false,
      isOffline: true,
      leaderboard: [],
      count: 0,
      error: err.message,
    };
  }
}

// ─── Score Submission ─────────────────────────────────────────────────────────

/**
 * Submit a pilot score to Supabase.
 * @param {string} username
 * @param {number} score
 * @param {string} [mapId='classic']
 */
export async function submitScore(username, score, mapId = 'classic') {
  const cleanUser = String(username || '').trim().slice(0, 24);
  const cleanScore = Math.floor(Number(score) || 0);
  const cleanMap = String(mapId || 'classic').trim().slice(0, 32);

  if (!cleanUser || cleanScore <= 0) {
    return { success: false, error: 'Invalid username or score' };
  }

  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert([{ username: cleanUser, score: cleanScore, map_id: cleanMap }]);

    if (error) throw new Error(error.message);

    // Fetch current rank
    const { leaderboard } = await fetchLeaderboard('all', 200);
    const myEntry = leaderboard.find(
      (p) => p.username.toLowerCase() === cleanUser.toLowerCase()
    );

    return {
      success: true,
      rank: myEntry?.rank || null,
      personalBest: myEntry?.score || cleanScore,
      entry: { username: cleanUser, score: cleanScore, mapId: cleanMap },
    };
  } catch (err) {
    console.warn('[LeaderboardService] Score submission failed:', err.message);
    return {
      success: false,
      isOffline: true,
      rank: null,
      personalBest: cleanScore,
      error: err.message,
    };
  }
}
