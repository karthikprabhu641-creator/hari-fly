/**
 * ModesModal / Modes Page Component
 * Dedicated full-screen modal view displaying all available game modes.
 * Displays mode previews, weather systems, theme descriptions, and active status.
 */

import React, { useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import { MAP_LIST } from '../config/mapConfig';
import { WalletDisplay } from './WalletDisplay';

export function ModesModal({ selectedMapId, onSelectMap, onStart, onClose, coins = 0, keys = 0 }) {
  const { playClick } = useAudio();

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
  }, [onClose, playClick]);

  const handleSelect = (mapId) => {
    playClick();
    onSelectMap(mapId);
  };

  const handleStartFlight = (e) => {
    e.stopPropagation();
    playClick();
    onStart();
  };

  const handleBack = (e) => {
    e.stopPropagation();
    playClick();
    onClose();
  };

  const selectedMap = MAP_LIST.find((m) => m.id === selectedMapId) || MAP_LIST[0];

  return (
    <div className="modes-page-backdrop" id="modes-page-overlay" onClick={handleBack}>
      <div className="modes-page-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="modes-page-header">
          <div className="modes-page-header-left">
            <button
              className="modes-page-back-btn"
              onClick={handleBack}
              id="modes-back-btn"
              aria-label="Back to main menu"
              type="button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>BACK</span>
            </button>
            <div className="modes-page-titles">
              <h1 className="modes-page-title">GAME MODES</h1>
              <p className="modes-page-subtitle">Select an environment & atmosphere for your flight</p>
            </div>
          </div>

          <div className="modes-page-header-right">
            <WalletDisplay coins={coins} keys={keys} className="modes-wallet" />
          </div>
        </header>

        {/* Modes Grid */}
        <div className="modes-grid-scroll-area">
          <div className="modes-cards-grid">
            {MAP_LIST.map((map) => {
              const isSelected = map.id === selectedMapId;
              return (
                <div
                  key={map.id}
                  className={`mode-card${isSelected ? ' is-active' : ''}`}
                  onClick={() => handleSelect(map.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Select ${map.name} mode`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(map.id);
                    }
                  }}
                >
                  <div className="mode-card-preview-wrapper">
                    <img src={map.preview} alt={map.name} className="mode-card-preview-img" />
                    <span className="mode-card-theme-tag">{map.theme.toUpperCase()}</span>
                    {isSelected && (
                      <span className="mode-card-badge-selected" aria-label="Currently active mode">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>

                  <div className="mode-card-body">
                    <div className="mode-card-title-row">
                      <h3 className="mode-card-name">{map.name}</h3>
                    </div>
                    <p className="mode-card-description">{map.description}</p>

                    {map.weather && map.weather.length > 0 && (
                      <div className="mode-card-weather-tags">
                        {map.weather.map((w) => (
                          <span key={w} className="mode-weather-tag">
                            {w === 'rain' && '🌧 Rain'}
                            {w === 'snow' && '❄ Snow'}
                            {w === 'wind' && '💨 Wind'}
                            {w === 'fog' && '🌫 Fog'}
                            {w === 'clouds' && '⛅ Clouds'}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mode-card-action">
                      <button
                        type="button"
                        className={`mode-select-btn${isSelected ? ' is-selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(map.id);
                        }}
                      >
                        {isSelected ? '✓ ACTIVE' : 'SELECT MODE'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="modes-page-footer">
          <div className="modes-footer-info">
            <span className="modes-footer-label">SELECTED:</span>
            <strong className="modes-footer-name">{selectedMap?.name}</strong>
          </div>
          <div className="modes-footer-buttons">
            <button
              type="button"
              className="modes-footer-close-btn"
              onClick={handleBack}
            >
              BACK TO MENU
            </button>
            <button
              type="button"
              className="modes-footer-play-btn"
              onClick={handleStartFlight}
              id="modes-play-btn"
            >
              <span>START FLYING</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
