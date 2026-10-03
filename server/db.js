/**
 * Database module for HARI.FLY Leaderboard
 * Uses Node 24's built-in native SQLite (node:sqlite DatabaseSync)
 * with zero external dependencies and persistent file storage.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = resolve(__dirname, 'data');
const DB_PATH = resolve(DB_DIR, 'leaderboard.db');
const JSON_BACKUP_PATH = resolve(DB_DIR, 'leaderboard.json');

// Ensure directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

let sqliteDb = null;
let useJsonFallback = false;

// Attempt to initialize native node:sqlite
try {
  const { DatabaseSync } = await import('node:sqlite');
  sqliteDb = new DatabaseSync(DB_PATH);

  // Initialize schema
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      score INTEGER NOT NULL,
      map_id TEXT NOT NULL DEFAULT 'classic',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(username);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_map ON leaderboard(map_id, score DESC);
  `);

  // No seed data — leaderboard starts empty and fills with real players only.

  console.log('[Leaderboard DB] Native SQLite initialized at', DB_PATH);
} catch (err) {
  console.warn('[Leaderboard DB] Native SQLite failed, falling back to JSON storage:', err.message);
  useJsonFallback = true;
}

// JSON storage fallback helpers
function readJsonStore() {
  try {
    if (existsSync(JSON_BACKUP_PATH)) {
      return JSON.parse(readFileSync(JSON_BACKUP_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading JSON fallback store:', e);
  }
  // Return empty array — no fake data
  return [];
}

function writeJsonStore(data) {
  try {
    writeFileSync(JSON_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing JSON fallback store:', e);
  }
}

/**
 * Retrieve the top leaderboard entries grouped by unique username (best score per player).
 * @param {Object} options
 * @param {string} [options.mapId] - Filter by specific map, or all if empty/'all'
 * @param {number} [options.limit=50] - Number of top scores to return
 */
export function getLeaderboard({ mapId = '', limit = 50 } = {}) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));

  if (!useJsonFallback && sqliteDb) {
    let query;
    let params;

    if (mapId && mapId !== 'all') {
      query = `
        SELECT 
          username, 
          MAX(score) as score, 
          map_id, 
          MAX(created_at) as created_at
        FROM leaderboard
        WHERE map_id = ?
        GROUP BY username
        ORDER BY score DESC, created_at ASC
        LIMIT ?
      `;
      params = [mapId, safeLimit];
    } else {
      query = `
        SELECT 
          username, 
          MAX(score) as score, 
          map_id, 
          MAX(created_at) as created_at
        FROM leaderboard
        GROUP BY username
        ORDER BY score DESC, created_at ASC
        LIMIT ?
      `;
      params = [safeLimit];
    }

    const rows = sqliteDb.prepare(query).all(...params);
    return rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
      mapId: row.map_id,
      createdAt: row.created_at,
    }));
  }

  // JSON fallback
  let list = readJsonStore();
  if (mapId && mapId !== 'all') {
    list = list.filter((item) => item.map_id === mapId);
  }

  // Group by username, taking highest score
  const mapByUser = new Map();
  for (const item of list) {
    const existing = mapByUser.get(item.username);
    if (!existing || item.score > existing.score) {
      mapByUser.set(item.username, item);
    }
  }

  const sorted = Array.from(mapByUser.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, safeLimit);

  return sorted.map((row, index) => ({
    rank: index + 1,
    username: row.username,
    score: row.score,
    mapId: row.map_id,
    createdAt: row.created_at,
  }));
}

/**
 * Record a flight score for a pilot username.
 * @param {Object} entry
 * @param {string} entry.username
 * @param {number} entry.score
 * @param {string} [entry.mapId='classic']
 */
export function recordScore({ username, score, mapId = 'classic' }) {
  const cleanUsername = String(username || '').trim().slice(0, 24);
  const cleanScore = Math.max(0, Math.floor(Number(score) || 0));
  const cleanMap = String(mapId || 'classic').trim().slice(0, 32);

  if (!cleanUsername || cleanScore <= 0) {
    return { success: false, error: 'Invalid username or score' };
  }

  if (!useJsonFallback && sqliteDb) {
    const stmt = sqliteDb.prepare(
      "INSERT INTO leaderboard (username, score, map_id, created_at) VALUES (?, ?, ?, datetime('now'))"
    );
    stmt.run(cleanUsername, cleanScore, cleanMap);

    // Get current rank for this player
    const leaderList = getLeaderboard({ mapId: 'all', limit: 100 });
    const userRank = leaderList.findIndex((p) => p.username.toLowerCase() === cleanUsername.toLowerCase()) + 1;
    const personalBest = leaderList.find((p) => p.username.toLowerCase() === cleanUsername.toLowerCase())?.score || cleanScore;

    return {
      success: true,
      rank: userRank > 0 ? userRank : null,
      personalBest,
      entry: {
        username: cleanUsername,
        score: cleanScore,
        mapId: cleanMap,
        createdAt: new Date().toISOString(),
      },
    };
  }

  // JSON fallback
  const store = readJsonStore();
  const newEntry = {
    id: Date.now() + Math.random(),
    username: cleanUsername,
    score: cleanScore,
    map_id: cleanMap,
    created_at: new Date().toISOString(),
  };
  store.push(newEntry);
  writeJsonStore(store);

  const leaderList = getLeaderboard({ mapId: 'all', limit: 100 });
  const userRank = leaderList.findIndex((p) => p.username.toLowerCase() === cleanUsername.toLowerCase()) + 1;

  return {
    success: true,
    rank: userRank > 0 ? userRank : null,
    personalBest: cleanScore,
    entry: newEntry,
  };
}

/**
 * Get stats for a specific pilot username.
 */
export function getPilotStats(username) {
  if (!username) return null;
  const cleanUsername = String(username).trim().toLowerCase();
  const allLeaders = getLeaderboard({ mapId: 'all', limit: 500 });
  const entry = allLeaders.find((p) => p.username.toLowerCase() === cleanUsername);

  return {
    username: entry?.username || username,
    bestScore: entry?.score || 0,
    rank: entry?.rank || null,
    totalLeadersCount: allLeaders.length,
  };
}
