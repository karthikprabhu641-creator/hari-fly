import { safeStorage } from '../utils/storage';

export const SKINS_STORAGE_KEY = 'hari_fly_unlocked_skins';
export const SELECTED_SKIN_STORAGE_KEY = 'hari_fly_selected_skin';
export const MISSIONS_STORAGE_KEY = 'hari_fly_daily_missions';

export const SKINS = [
  { id: 'classic', name: 'Classic', cost: 0, filter: 'none' },
  { id: 'gold', name: 'Gold Pilot', cost: 3, filter: 'sepia(1) saturate(1.5) hue-rotate(355deg)' },
  { id: 'cyan', name: 'Cyan Pilot', cost: 5, filter: 'sepia(1) saturate(1.8) hue-rotate(145deg)' },
];

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getUnlockedSkins() {
  const stored = safeStorage.getItem(SKINS_STORAGE_KEY, ['classic']);
  return Array.isArray(stored) ? Array.from(new Set(['classic', ...stored])) : ['classic'];
}

export function unlockSkin(skinId) {
  const unlocked = getUnlockedSkins();
  if (unlocked.includes(skinId)) return true;
  const skins = SKINS.find((skin) => skin.id === skinId);
  if (!skins) return false;
  safeStorage.setItem(SKINS_STORAGE_KEY, [...unlocked, skinId]);
  return true;
}

export function getSelectedSkin() {
  const selected = safeStorage.getItem(SELECTED_SKIN_STORAGE_KEY, 'classic');
  return SKINS.some((skin) => skin.id === selected) ? selected : 'classic';
}

export function saveSelectedSkin(skinId) {
  const skin = SKINS.find((item) => item.id === skinId);
  if (!skin) return 'classic';
  safeStorage.setItem(SELECTED_SKIN_STORAGE_KEY, skinId);
  return skinId;
}

export function getMissions() {
  const today = getLocalDateKey();
  const stored = safeStorage.getItem(MISSIONS_STORAGE_KEY, null);
  if (!stored || stored.date !== today) {
    const fresh = {
      date: today,
      score10: 0,
      coins20: 0,
    };
    safeStorage.setItem(MISSIONS_STORAGE_KEY, fresh);
    return fresh;
  }
  return stored;
}

export function updateMissions({ score = 0, coinDelta = 0 }) {
  const missions = getMissions();
  missions.score10 = Math.max(0, missions.score10, Number(score) || 0);
  missions.coins20 = Math.max(0, missions.coins20 + (Number(coinDelta) || 0));
  safeStorage.setItem(MISSIONS_STORAGE_KEY, missions);
  return missions;
}
