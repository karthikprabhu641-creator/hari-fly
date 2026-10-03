-- ─────────────────────────────────────────────────────────────────────────────
-- HARI.FLY Leaderboard — Supabase PostgreSQL Setup
-- Run this ONCE in your Supabase project: SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id          BIGSERIAL PRIMARY KEY,
  username    TEXT        NOT NULL CHECK (char_length(username) BETWEEN 2 AND 24),
  score       INTEGER     NOT NULL CHECK (score > 0),
  map_id      TEXT        NOT NULL DEFAULT 'classic',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row-Level Security (required for public access)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read scores (public leaderboard)
CREATE POLICY "Public read leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- 4. Allow anyone to insert a score (players submit their own scores)
CREATE POLICY "Public insert score"
  ON leaderboard FOR INSERT
  WITH CHECK (true);

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_lb_score   ON leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_lb_map     ON leaderboard (map_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_lb_user    ON leaderboard (username);

-- ─────────────────────────────────────────────────────────────────────────────
-- Done! Your leaderboard table is ready.
-- No fake data is inserted — scores are 100% real players.
-- ─────────────────────────────────────────────────────────────────────────────
