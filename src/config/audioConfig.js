/**
 * Central audio catalog. Add new gameplay or game-over songs here only.
 */

export const GAMEPLAY_MUSIC_MODES = {
  FAVORITE: 'favorite',
  PLAY_ALL: 'play-all',
};

export const GAMEPLAY_SONGS = [
  {
    id: 'blue-eyes',
    name: 'Blue Eyes',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Blue%20Eyes.mp3`,
  },
  {
    id: 'butter-fly',
    name: 'Butter Fly',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Butter%20fly.mp3`,
  },
  {
    id: 'dope-shope',
    name: 'Dope Shope',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/Dope%20Shope.mp3`,
  },
  {
    id: 'udta-hi-phiru',
    name: 'Udta Hi Phiru',
    artist: 'Gameplay Music',
    src: `${import.meta.env.BASE_URL}music/udta%20hi%20phiru.mpeg`,
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