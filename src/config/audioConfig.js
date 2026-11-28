/**
 * Central audio catalog. Gameplay tracks are discovered from the music folder.
 * All gameplay tracks are free and always unlocked.
 */

export const GAMEPLAY_MUSIC_MODES = {
  FAVORITE: 'favorite',
  PLAY_ALL: 'play-all',
};

/** LocalStorage key for the array of unlocked song IDs */
export const SONG_UNLOCK_STORAGE_KEY = 'hari_fly_unlocked_songs';

const songFiles = import.meta.glob('../../music/*.{mp3,mpeg}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const existingSongIds = {
  'Blue Eyes': 'blue-eyes',
  'Butter fly': 'butter-fly',
  'Dope Shope': 'dope-shope',
  'udta hi phiru': 'udta-hi-phiru',
  'ninja hattori': 'ninja-hattori',
};

const existingSongNames = {
  'Blue Eyes': 'Blue Eyes',
  'Butter fly': 'Butter Fly',
  'Dope Shope': 'Dope Shope',
  'udta hi phiru': 'Udta Hi Phiru',
  'ninja hattori': 'Ninja Hattori',
};

const existingSongOrder = Object.values(existingSongIds);

export const GAMEPLAY_SONGS = Object.entries(songFiles)
  .map(([path, src]) => {
    const fileName = path.split('/').pop().replace(/\.(mp3|mpeg)$/i, '').trim();
    const id = existingSongIds[fileName]
      || fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return {
      id,
      name: existingSongNames[fileName] || fileName.replace(/\s+/g, ' '),
      artist: 'Gameplay Music',
      src,
      price: 0,
    };
  })
  .sort((a, b) => {
    const aOrder = existingSongOrder.indexOf(a.id);
    const bOrder = existingSongOrder.indexOf(b.id);
    if (aOrder !== bOrder) {
      if (aOrder === -1) return 1;
      if (bOrder === -1) return -1;
      return aOrder - bOrder;
    }
    return a.name.localeCompare(b.name);
  });

export const GAME_OVER_SONGS = [
  {
    id: 'out-song',
    name: 'Out Music',
    artist: 'Game Over',
    src: `${import.meta.env.BASE_URL}assets/audio/out.mp3.mpeg`,
  },
];