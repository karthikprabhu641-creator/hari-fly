import { safeStorage } from '../utils/storage';
import birdImage from '../../image/bird-transparent.png';

const skinImages = import.meta.glob('../../bird skins/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
});

const uploadedSkins = Object.entries(skinImages).map(([path, src]) => {
  const fileName = path.split('/').pop().replace(/\.webp$/i, '').trim();
  const id = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return { id, name: fileName.replace(/[-_]+/g, ' '), cost: 0, filter: 'none', src };
});

export const SKINS_STORAGE_KEY = 'hari_fly_unlocked_skins';
export const SELECTED_SKIN_STORAGE_KEY = 'hari_fly_selected_skin';
export const MISSIONS_STORAGE_KEY = 'hari_fly_daily_missions';

export const DAILY_MISSIONS = [
  { id: 'score10', label: 'Score 10 in one run', target: 10, reward: { coins: 5, keys: 0 }, rewardLabel: '5 coins' },
  { id: 'score25', label: 'Score 25 in one run', target: 25, reward: { coins: 10, keys: 1 }, rewardLabel: '10 coins + 1 key' },
  { id: 'score50', label: 'Score 50 in one run', target: 50, reward: { coins: 20, keys: 2 }, rewardLabel: '20 coins + 2 keys' },
  { id: 'coins20', label: 'Collect 20 coins', target: 20, reward: { coins: 10, keys: 1 }, rewardLabel: '10 coins + 1 key' },
  { id: 'keys3', label: 'Collect 3 keys', target: 3, reward: { coins: 15, keys: 0 }, rewardLabel: '15 coins' },
];

export const SKINS = [
  { id: 'classic', name: 'Classic', cost: 0, filter: 'none' },
  ...uploadedSkins,
];

export function getSkinImage(skin) {
  return skin?.src || birdImage;
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getUnlockedSkins() {
  const stored = safeStorage.getItem(SKINS_STORAGE_KEY, ['classic']);
  const freeSkins = SKINS.filter((skin) => skin.cost === 0).map((skin) => skin.id);
  return Array.isArray(stored)
    ? Array.from(new Set([...freeSkins, ...stored]))
    : freeSkins;
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
      score25: 0,
      score50: 0,
      coins20: 0,
      keys3: 0,
      claimed: [],
    };
    safeStorage.setItem(MISSIONS_STORAGE_KEY, fresh);
    return fresh;
  }

  return {
    date: today,
    score10: Number(stored.score10) || 0,
    score25: Number(stored.score25) || 0,
    score50: Number(stored.score50) || 0,
    coins20: Number(stored.coins20) || 0,
    keys3: Number(stored.keys3) || 0,
    claimed: Array.isArray(stored.claimed) ? stored.claimed : [],
  };
}

export function updateMissions({ score = 0, coinDelta = 0, keyDelta = 0 }) {
  const missions = getMissions();
  const scoreProgress = Math.max(0, Number(score) || 0);
  missions.score10 = Math.max(missions.score10, scoreProgress);
  missions.score25 = Math.max(missions.score25, scoreProgress);
  missions.score50 = Math.max(missions.score50, scoreProgress);
  missions.coins20 = Math.max(0, missions.coins20 + (Number(coinDelta) || 0));
  missions.keys3 = Math.max(0, missions.keys3 + (Number(keyDelta) || 0));

  const rewards = DAILY_MISSIONS
    .filter((mission) => missions[mission.id] >= mission.target && !missions.claimed.includes(mission.id))
    .map((mission) => {
      missions.claimed.push(mission.id);
      return mission.reward;
    });

  safeStorage.setItem(MISSIONS_STORAGE_KEY, missions);
  return { missions, rewards };
}
