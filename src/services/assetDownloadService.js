import { ASSET_MANIFEST } from '../config/assetManifest';
import { GAME_OVER_SONGS } from '../config/audioConfig';

const bundledAssets = import.meta.glob([
  '../../image/*.{png,jpg,jpeg,webp,svg}',
  '../../bird skins/*.{png,jpg,jpeg,webp,svg}',
  '../../music/*.{mp3,mpeg,ogg,wav}',
  '../../out music/*.{mp3,mpeg,ogg,wav}',
  '../../game over card/*.{png,jpg,jpeg,webp,svg}',
  '../assets/**/*.{png,jpg,jpeg,webp,svg,mp3,mpeg,ogg,wav}',
], {
  eager: true,
  import: 'default',
  query: '?url',
});

export const GAME_ASSETS = Array.from(new Set([
  ...Object.values(bundledAssets),
  ...Object.values(ASSET_MANIFEST.audio).map((asset) => asset.src),
  ...GAME_OVER_SONGS.map((track) => track.src),
])).filter((src) => typeof src === 'string' && src.length > 0);

let downloadPromise = null;
let latestProgress = { completed: 0, total: GAME_ASSETS.length };
const progressListeners = new Set();

function notifyProgress(progress) {
  latestProgress = progress;
  progressListeners.forEach((listener) => listener(progress));
}

async function downloadAllAssets() {
  let nextIndex = 0;
  let completed = 0;
  const failedAssets = [];
  notifyProgress({ completed, total: GAME_ASSETS.length });

  const downloadWorker = async () => {
    while (nextIndex < GAME_ASSETS.length) {
      const src = GAME_ASSETS[nextIndex];
      nextIndex += 1;

      try {
        const response = await fetch(src, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        await response.arrayBuffer();
      } catch (error) {
        failedAssets.push({ src, message: error.message });
      } finally {
        completed += 1;
        notifyProgress({ completed, total: GAME_ASSETS.length });
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(3, GAME_ASSETS.length) }, downloadWorker));

  if (failedAssets.length > 0) {
    const error = new Error(`Failed to download ${failedAssets.length} game asset(s).`);
    error.failedAssets = failedAssets;
    throw error;
  }
}

export function preloadGameAssets(onProgress) {
  if (typeof onProgress === 'function') {
    progressListeners.add(onProgress);
    onProgress(latestProgress);
  }

  if (!downloadPromise) {
    downloadPromise = downloadAllAssets().catch((error) => {
      downloadPromise = null;
      throw error;
    });
  }

  return downloadPromise.finally(() => {
    if (typeof onProgress === 'function') {
      progressListeners.delete(onProgress);
    }
  });
}
