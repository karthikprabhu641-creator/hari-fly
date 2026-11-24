import { safeStorage } from '../utils/storage';
import normalPreview from '../assets/modes/normal.jpg';
import hardPreview from '../assets/modes/hard.jpg';
import extremePreview from '../assets/modes/extreme.jpg';

export const DEFAULT_GAME_MODE_ID = 'normal';
export const GAME_MODE_STORAGE_KEY = 'hraifly_game_mode';

export const GAME_MODES = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'The classic Hari Fly experience.',
    badge: 'STANDARD',
    preview: normalPreview,
    obstacleSpeed: 180,
    gapSize: 175,
    spawnInterval: 1.7,
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Faster obstacles and narrower gaps.',
    badge: 'CHALLENGE',
    preview: hardPreview,
    obstacleSpeed: 220,
    gapSize: 150,
    spawnInterval: 1.55,
  },
  {
    id: 'hari-special',
    name: 'Extreme',
    description: 'Extreme mode: the fastest obstacles and tightest gaps.',
    badge: 'EXTREME',
    preview: extremePreview,
    obstacleSpeed: 260,
    gapSize: 125,
    spawnInterval: 1.4,
  },
];

export function getSelectedGameModeId() {
  const storedModeId = safeStorage.getItem(GAME_MODE_STORAGE_KEY, DEFAULT_GAME_MODE_ID);
  return GAME_MODES.some((mode) => mode.id === storedModeId) ? storedModeId : DEFAULT_GAME_MODE_ID;
}

export function saveSelectedGameMode(modeId) {
  const selectedMode = GAME_MODES.find((mode) => mode.id === modeId);
  const selectedModeId = selectedMode ? selectedMode.id : DEFAULT_GAME_MODE_ID;
  safeStorage.setItem(GAME_MODE_STORAGE_KEY, selectedModeId);
  return selectedModeId;
}
