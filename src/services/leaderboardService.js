/**
 * Pilot Profile & Offline Leaderboard Service
 * 100% Client-side and stored securely in LocalStorage / memory.
 * No external database or backend needed — instant, reliable, and mobile-friendly.
 */

import { safeStorage } from '../utils/storage';

export const PILOT_USERNAME_STORAGE_KEY = 'hari_fly_pilot_username';
export const LEADERBOARD_STORAGE_KEY = 'hari_fly_local_leaderboard_records';

// List of fake / bot player names to purge from local storage
const FAKE_PLAYERS = new Set(['acepilot', 'skyfalcon', 'neonhawk', 'nightrider', 'retrobird']);

// Default leaderboard is empty — no fake players
const DEFAULT_LEADERBOARD = [];

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

// ─── Leaderboard Storage Helpers ─────────────────────────────────────────────

function getStoredRecords() {
  const records = safeStorage.getItem(LEADERBOARD_STORAGE_KEY, null);
  if (Array.isArray(records)) {
    // Purge any fake players if they were saved previously
    const realRecords = records.filter(
      (r) => r && r.username && !FAKE_PLAYERS.has(String(r.username).trim().toLowerCase())
    );
    if (realRecords.length !== records.length) {
      safeStorage.setItem(LEADERBOARD_STORAGE_KEY, realRecords);
    }
    return realRecords;
  }
  safeStorage.setItem(LEADERBOARD_STORAGE_KEY, []);
  return [];
}

function saveStoredRecords(records) {
  safeStorage.setItem(LEADERBOARD_STORAGE_KEY, records);
}

// ─── Leaderboard Fetch ───────────────────────────────────────────────────────

/**
 * Fetch top pilot scores from local storage, grouped by username (best score per player).
 * @param {string} [mapId='all']
 * @param {number} [limit=50]
 * @returns {Promise<{ success: boolean, leaderboard: Array, count: number, isOffline: boolean }>}
 */
export async function fetchLeaderboard(mapId = 'all', limit = 50) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));

  try {
    const rawList = getStoredRecords();

    // Filter by mapId if requested
    const filtered = (mapId && mapId !== 'all')
      ? rawList.filter((item) => String(item.mapId).toLowerCase() === String(mapId).toLowerCase())
      : rawList;

    // Deduplicate: keep only the highest score per pilot username
    const bestByUser = new Map();
    for (const row of filtered) {
      const lower = String(row.username || '').toLowerCase();
      const existing = bestByUser.get(lower);
      if (!existing || Number(row.score) > Number(existing.score)) {
        bestByUser.set(lower, row);
      }
    }

    const sorted = Array.from(bestByUser.values())
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, safeLimit)
      .map((row, idx) => ({
        rank: idx + 1,
        username: row.username,
        score: Number(row.score) || 0,
        mapId: row.mapId || 'classic',
        createdAt: row.createdAt || new Date().toISOString(),
      }));

    return { success: true, leaderboard: sorted, count: sorted.length, isOffline: false };
  } catch (err) {
    return {
      success: true,
      leaderboard: [],
      count: 0,
      isOffline: false,
    };
  }
}

// ─── Score Submission ─────────────────────────────────────────────────────────

/**
 * Submit a pilot score locally to localStorage.
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
    const records = getStoredRecords();
    const newEntry = {
      username: cleanUser,
      score: cleanScore,
      mapId: cleanMap,
      createdAt: new Date().toISOString(),
    };

    records.push(newEntry);
    saveStoredRecords(records);

    // Fetch current rankings to find player's position
    const { leaderboard } = await fetchLeaderboard('all', 100);
    const myEntry = leaderboard.find(
      (p) => p.username.toLowerCase() === cleanUser.toLowerCase()
    );

    return {
      success: true,
      rank: myEntry?.rank || null,
      personalBest: myEntry?.score || cleanScore,
      entry: newEntry,
    };
  } catch (err) {
    return {
      success: true,
      rank: null,
      personalBest: cleanScore,
      entry: { username: cleanUser, score: cleanScore, mapId: cleanMap },
    };
  }
}
