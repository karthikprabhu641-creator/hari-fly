/**
 * Leaderboard Modal Component
 * Live Global Pilot Rankings powered by Supabase (real database).
 * Displays Podium for Top 3, ranked table for #4+, map filters, and current user status.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../hooks/useAudio';
import { fetchLeaderboard, getPilotUsername } from '../services/leaderboardService';
import { MAP_LIST } from '../config/mapConfig';

export function LeaderboardModal({ onClose, onOpenPilotEdit }) {
  const { playClick } = useAudio();
  const [selectedMapFilter, setSelectedMapFilter] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [myUsername, setMyUsername] = useState(() => getPilotUsername());

  const loadData = useCallback(async (mapFilter, showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetchLeaderboard(mapFilter, 50);
      setLeaderboard(res.leaderboard || []);
      setIsOffline(res.isOffline === true);
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedMapFilter, true);
  }, [selectedMapFilter, loadData]);

  useEffect(() => {
    setMyUsername(getPilotUsername());
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playClick, onClose]);

  const handleBack = (e) => {
    e.stopPropagation();
    playClick();
    onClose();
  };

  const handleFilterChange = (mapId) => {
    playClick();
    setSelectedMapFilter(mapId);
  };

  const handleRefresh = (e) => {
    e.stopPropagation();
    playClick();
    loadData(selectedMapFilter, false);
  };

  // Identify podium & runner-ups
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;
  const restList = leaderboard.slice(3);

  // Find user's rank
  const myRankEntry = myUsername
    ? leaderboard.find((p) => p.username.toLowerCase() === myUsername.toLowerCase())
    : null;

  return (
    <div className="leaderboard-backdrop" id="leaderboard-overlay" onClick={handleBack}>
      <div className="leaderboard-container live-leaderboard" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="leaderboard-header">
          <button
            className="leaderboard-back-btn"
            onClick={handleBack}
            id="leaderboard-back-btn"
            type="button"
            aria-label="Back to main menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>BACK</span>
          </button>

          <div className="leaderboard-titles">
            <h1 className="leaderboard-title">GLOBAL LEADERBOARD</h1>
            <p className="leaderboard-subtitle">Real-time Pilot Rankings &amp; Flight Records</p>
          </div>

          <button
            type="button"
            className={`leaderboard-refresh-btn${isRefreshing ? ' is-spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh Rankings"
            aria-label="Refresh rankings"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </header>

        {/* Map Filter Tabs */}
        <div className="leaderboard-map-tabs">
          <button
            type="button"
            className={`map-tab-btn${selectedMapFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Maps
          </button>
          {MAP_LIST.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`map-tab-btn${selectedMapFilter === m.id ? ' is-active' : ''}`}
              onClick={() => handleFilterChange(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* User Status Bar */}
        <div className="leaderboard-my-status">
          <div className="my-status-left">
            <span className="my-status-avatar">👨‍✈️</span>
            <div className="my-status-info">
              <span className="my-status-label">YOUR CALL-SIGN</span>
              <strong className="my-status-name">
                {myUsername ? `@${myUsername}` : 'Unregistered Pilot'}
              </strong>
            </div>
          </div>

          <div className="my-status-right">
            {myRankEntry ? (
              <div className="my-rank-badge">
                <span className="rank-label">GLOBAL RANK</span>
                <strong className="rank-num">#{myRankEntry.rank}</strong>
                <span className="score-val">{myRankEntry.score} PTS</span>
              </div>
            ) : (
              <div className="my-rank-badge unranked">
                <span className="rank-label">STATUS</span>
                <strong className="rank-num">NOT RANKED YET</strong>
              </div>
            )}
            {onOpenPilotEdit && (
              <button
                type="button"
                className="my-status-edit-btn"
                onClick={() => {
                  playClick();
                  onOpenPilotEdit();
                }}
              >
                EDIT
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="leaderboard-body">
          {isLoading ? (
            <div className="leaderboard-loading-state">
              <div className="leaderboard-spinner" />
              <span>Fetching live pilot records...</span>
            </div>
          ) : (
            <>
              {/* Podium for Top 3 */}
              {leaderboard.length > 0 && (
                <div className="leaderboard-podium-cards live-podium">
                  {/* Rank 2 */}
                  <div className={`podium-card podium-silver${top2?.username.toLowerCase() === myUsername?.toLowerCase() ? ' is-me' : ''}`}>
                    <div className="podium-badge">#2</div>
                    <div className="podium-avatar">🥈</div>
                    <div className="podium-name">{top2 ? top2.username : '---'}</div>
                    <div className="podium-score">{top2 ? `${top2.score} PTS` : '0 PTS'}</div>
                    {top2 && (
                      <span className="podium-tier-tag">
                        {top2.username.toLowerCase() === myUsername?.toLowerCase() ? '★ YOU' : (top2.mapId || 'Classic')}
                      </span>
                    )}
                  </div>

                  {/* Rank 1 */}
                  <div className={`podium-card podium-gold${top1?.username.toLowerCase() === myUsername?.toLowerCase() ? ' is-me' : ''}`}>
                    <div className="podium-crown">👑</div>
                    <div className="podium-badge">#1</div>
                    <div className="podium-avatar">🥇</div>
                    <div className="podium-name">{top1 ? top1.username : '---'}</div>
                    <div className="podium-score">{top1 ? `${top1.score} PTS` : '0 PTS'}</div>
                    {top1 && (
                      <span className="podium-tier-tag">
                        {top1.username.toLowerCase() === myUsername?.toLowerCase() ? '★ YOU' : 'Grand Champion'}
                      </span>
                    )}
                  </div>

                  {/* Rank 3 */}
                  <div className={`podium-card podium-bronze${top3?.username.toLowerCase() === myUsername?.toLowerCase() ? ' is-me' : ''}`}>
                    <div className="podium-badge">#3</div>
                    <div className="podium-avatar">🥉</div>
                    <div className="podium-name">{top3 ? top3.username : '---'}</div>
                    <div className="podium-score">{top3 ? `${top3.score} PTS` : '0 PTS'}</div>
                    {top3 && (
                      <span className="podium-tier-tag">
                        {top3.username.toLowerCase() === myUsername?.toLowerCase() ? '★ YOU' : (top3.mapId || 'Classic')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Ranks 4 to 50 list */}
              {restList.length > 0 ? (
                <div className="leaderboard-table-wrap">
                  <div className="leaderboard-table-header">
                    <span>RANK</span>
                    <span>PILOT CALL-SIGN</span>
                    <span>FLIGHT MAP</span>
                    <span>SCORE</span>
                  </div>

                  <div className="leaderboard-rows-list">
                    {restList.map((entry) => {
                      const isMe = myUsername && entry.username.toLowerCase() === myUsername.toLowerCase();
                      return (
                        <div
                          key={`${entry.username}-${entry.rank}`}
                          className={`leaderboard-row-item${isMe ? ' is-me' : ''}`}
                        >
                          <div className="col-rank">
                            <span className="rank-number">#{entry.rank}</span>
                          </div>
                          <div className="col-pilot">
                            <span className="pilot-name">{entry.username}</span>
                            {isMe && <span className="pilot-you-pill">YOU</span>}
                          </div>
                          <div className="col-map">
                            <span className="map-name-pill">{entry.mapId || 'classic'}</span>
                          </div>
                          <div className="col-score">
                            <strong className="score-num">{entry.score}</strong>
                            <span className="score-unit">PTS</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                leaderboard.length === 0 && (
                  <div className="leaderboard-empty-state">
                    {isOffline ? (
                      <>
                        <span className="empty-icon">🔌</span>
                        <h3>Connection Error</h3>
                        <p>Could not reach the leaderboard database.<br />Check your internet connection and try again.</p>
                      </>
                    ) : (
                      <>
                        <span className="empty-icon">✈️</span>
                        <h3>No Records Yet — Be First!</h3>
                        <p>Complete a flight to appear on the global leaderboard.</p>
                      </>
                    )}
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="leaderboard-footer">
          <span className="leaderboard-footer-stats">
            {leaderboard.length} Aviators Recorded
          </span>
          <button
            type="button"
            className="leaderboard-done-btn"
            onClick={handleBack}
            id="leaderboard-done-btn"
          >
            RETURN TO MENU
          </button>
        </footer>
      </div>
    </div>
  );
}
