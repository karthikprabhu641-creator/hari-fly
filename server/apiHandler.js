/**
 * Leaderboard API Request Handler
 * Parses HTTP requests for /api/leaderboard and /api/pilot/:username
 * and connects directly with SQLite database.
 */

import { getLeaderboard, recordScore, getPilotStats } from './db.js';

export async function handleLeaderboardApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // GET /api/leaderboard
  if (req.method === 'GET' && pathname === '/api/leaderboard') {
    const mapId = url.searchParams.get('mapId') || url.searchParams.get('map') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const data = getLeaderboard({ mapId, limit });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      mapId,
      count: data.length,
      leaderboard: data,
    }));
    return true;
  }

  // POST /api/leaderboard
  if (req.method === 'POST' && pathname === '/api/leaderboard') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Guard against oversized payloads
      if (body.length > 50000) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { username, score, mapId } = payload;

        if (!username || typeof username !== 'string' || !username.trim()) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Username is required' }));
          return;
        }

        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore <= 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Valid score greater than 0 is required' }));
          return;
        }

        const result = recordScore({ username, score: numericScore, mapId });
        res.statusCode = result.success ? 200 : 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return true;
  }

  // GET /api/pilot/:username
  if (req.method === 'GET' && pathname.startsWith('/api/pilot/')) {
    const rawUsername = pathname.replace('/api/pilot/', '');
    const username = decodeURIComponent(rawUsername);
    const stats = getPilotStats(username);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      pilot: stats,
    }));
    return true;
  }

  return false;
}
