/**
 * Production Web & API Server
 * Serves the built frontend static files from /dist
 * and powers the Leaderboard REST API on /api/leaderboard.
 * Automatically finds an available port if 3000 is occupied.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleLeaderboardApi } from './server/apiHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const START_PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'audio/mpeg',
  '.wav': 'audio/wav',
};

const server = http.createServer(async (req, res) => {
  // Check API routes first
  if (req.url.startsWith('/api/')) {
    const handled = await handleLeaderboardApi(req, res);
    if (handled) return;
  }

  // Static file serving from /dist
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let filePath = path.join(DIST_DIR, parsedUrl.pathname);

  // If path is root or directory, serve index.html
  if (parsedUrl.pathname === '/' || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html
      const fallback = path.join(DIST_DIR, 'index.html');
      fs.readFile(fallback, (fallbackErr, data) => {
        if (fallbackErr) {
          res.statusCode = 404;
          res.end('Not Found - Run `npm run build` first to generate dist files.');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(data);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(port, maxAttempts = 10) {
  server.listen(port, () => {
    console.log(`\n=================================================`);
    console.log(`✈️   HARI.FLY Game running at: http://localhost:${port}`);
    console.log(`🏆  Leaderboard API:         http://localhost:${port}/api/leaderboard`);
    console.log(`=================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      server.close();
      if (maxAttempts > 0) {
        startServer(port + 1, maxAttempts - 1);
      } else {
        console.error('No free ports available.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(START_PORT);
