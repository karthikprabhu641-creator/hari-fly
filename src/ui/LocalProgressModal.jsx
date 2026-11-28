import React, { useEffect, useState } from 'react';
import {
  SKINS,
  getUnlockedSkins,
  getSelectedSkin,
  saveSelectedSkin,
  unlockSkin,
  getMissions,
  getSkinImage,
  DAILY_MISSIONS,
} from '../services/localProgressService';
import { useAudio } from '../hooks/useAudio';
import { ClayIcon } from './ClayIcon';
import { assetManager } from '../assets/AssetManager';
import { showToast } from '../utils/toast';

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

  const handleSkin = async (skin) => {
    playClick();
    if (!unlocked.includes(skin.id)) {
      if (keys < skin.cost) return;
      if (!onSpendKeys(skin.cost)) return;
    }

    const image = await assetManager.registerImage('player.selected', getSkinImage(skin));
    if (!image) {
      showToast(`Could not load ${skin.name}. Please try again.`);
      return;
    }

    if (!unlocked.includes(skin.id)) {
      unlockSkin(skin.id);
      setUnlocked(getUnlockedSkins());
    }
    setSelected(saveSelectedSkin(skin.id));
    onClose();
  };

  return (
    <div className="modal-backdrop local-progress-backdrop" onClick={handleClose}>
      <div className={`local-progress-card${mode === 'skins' ? ' skin-picker-card' : ''}`} role="dialog" aria-modal="true" aria-label={mode === 'skins' ? 'Skins' : 'Daily missions'} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="settings-close-btn" onClick={handleClose} aria-label={`Close ${mode}`}><ClayIcon name="close" size={18} /></button>
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
                  <span className="skin-preview" style={{ filter: skin.src ? 'none' : skin.filter }}>
                    <img src={getSkinImage(skin)} alt="" />
                  </span>
                  <strong>{skin.name}</strong>
                  <small>{isUnlocked ? (selected === skin.id ? 'EQUIPPED' : 'UNLOCKED') : `LOCKED · ${skin.cost} KEYS`}</small>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mission-list">
            {DAILY_MISSIONS.map((mission) => {
              const progress = Math.min(missions[mission.id] || 0, mission.target);
              const isComplete = progress >= mission.target;
              return (
                <div className={`mission-row${isComplete ? ' is-complete' : ''}`} key={mission.id}>
                  <span>
                    <strong>{mission.label}</strong>
                    <small>{progress} / {mission.target}</small>
                  </span>
                  <div className="mission-progress">
                    <i style={{ width: `${Math.min(100, (progress / mission.target) * 100)}%` }} />
                  </div>
                  <small className="mission-reward">
                    {isComplete ? 'REWARD EARNED' : `Reward: ${mission.rewardLabel}`}
                  </small>
                </div>
              );
            })}
            <p className="mission-reset-note">Resets at local midnight</p>
          </div>
        )}
      </div>
    </div>
  );
}
