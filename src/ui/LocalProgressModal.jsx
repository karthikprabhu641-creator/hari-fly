import React, { useEffect, useState } from 'react';
import {
  SKINS,
  getUnlockedSkins,
  getSelectedSkin,
  saveSelectedSkin,
  unlockSkin,
  getMissions,
} from '../services/localProgressService';
import { useAudio } from '../hooks/useAudio';

export function LocalProgressModal({ mode = 'skins', keys = 0, onSpendKeys, onClose }) {
  const { playClick } = useAudio();
  const [unlocked, setUnlocked] = useState(() => getUnlockedSkins());
  const [selected, setSelected] = useState(() => getSelectedSkin());
  const [missions, setMissions] = useState(() => getMissions());

  useEffect(() => {
    const timer = window.setInterval(() => setMissions(getMissions()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleClose = () => {
    playClick();
    onClose();
  };

  const handleSkin = (skin) => {
    playClick();
    if (!unlocked.includes(skin.id)) {
      if (keys < skin.cost) return;
      if (!onSpendKeys(skin.cost)) return;
      unlockSkin(skin.id);
      setUnlocked(getUnlockedSkins());
    }
    setSelected(saveSelectedSkin(skin.id));
  };

  return (
    <div className="modal-backdrop local-progress-backdrop" onClick={handleClose}>
      <div className="local-progress-card" role="dialog" aria-modal="true" aria-label={mode === 'skins' ? 'Skins' : 'Daily missions'} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="settings-close-btn" onClick={handleClose} aria-label={`Close ${mode}`}>✕</button>
        <h2 className="settings-title">{mode === 'skins' ? 'SKINS' : 'MISSIONS'}</h2>
        {mode === 'skins' ? (
          <div className="skin-grid">
            {SKINS.map((skin) => {
              const isUnlocked = unlocked.includes(skin.id);
              return (
                <button
                  type="button"
                  key={skin.id}
                  className={`skin-option${selected === skin.id ? ' is-selected' : ''}`}
                  onClick={() => handleSkin(skin)}
                  disabled={!isUnlocked && keys < skin.cost}
                >
                  <span className="skin-preview" style={{ filter: skin.filter }}><span>H</span></span>
                  <strong>{skin.name}</strong>
                  <small>{isUnlocked ? (selected === skin.id ? 'EQUIPPED' : 'UNLOCKED') : `LOCKED · ${skin.cost} KEYS`}</small>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mission-list">
            <div className="mission-row">
              <span><strong>Score 10</strong><small>{Math.min(missions.score10 || 0, 10)} / 10</small></span>
              <div className="mission-progress"><i style={{ width: `${Math.min(100, ((missions.score10 || 0) / 10) * 100)}%` }} /></div>
            </div>
            <div className="mission-row">
              <span><strong>Collect 20 coins</strong><small>{Math.min(missions.coins20 || 0, 20)} / 20</small></span>
              <div className="mission-progress"><i style={{ width: `${Math.min(100, ((missions.coins20 || 0) / 20) * 100)}%` }} /></div>
            </div>
            <p className="mission-reset-note">Resets at local midnight</p>
          </div>
        )}
      </div>
    </div>
  );
}
