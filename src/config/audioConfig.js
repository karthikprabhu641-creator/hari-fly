/**
 * Central audio catalog. Add new gameplay or game-over songs here only.
 * price: 0  = free (always unlocked)
 * price: 30 = costs 30 coins to unlock
 */

export const GAMEPLAY_MUSIC_MODES = {
  FAVORITE: 'favorite',
  PLAY_ALL: 'play-all',
};

/** LocalStorage key for the array of unlocked song IDs */
export const SONG_UNLOCK_STORAGE_KEY = 'hari_fly_unlocked_songs';

export const GAMEPLAY_SONGS = [
  {
    id: 'blue-eyes',
    name: 'Blue Eyes',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Blue%20Eyes.mp3`,
    price: 0,
  },
  {
    id: 'butter-fly',
    name: 'Butter Fly',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Butter%20fly.mp3`,
    price: 30,
  },
  {
    id: 'dope-shope',
    name: 'Dope Shope',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Dope%20Shope.mp3`,
    price: 30,
  },
  {
    id: 'udta-hi-phiru',
    name: 'Udta Hi Phiru',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/udta%20hi%20phiru.mpeg`,
    price: 30,
  },
  {
    id: 'ninja-hattori',
    name: 'Ninja Hattori',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/ninja%20hattori.mpeg`,
    price: 30,
  },
];

export const GAME_OVER_SONGS = [
  {
    id: 'out-song',
    name: 'Out Music',
    artist: 'Game Over',
    src: `${import.meta.env.BASE_URL}assets/audio/out.mp3.mpeg`,
  },
];