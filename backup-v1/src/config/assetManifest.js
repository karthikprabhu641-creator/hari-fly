/**
 * Asset Manifest
 * Maps logical asset identifiers to relative file paths or sources.
 * Game systems refer to logical IDs (e.g. 'player.default', 'audio.bgm_udta')
 * rather than hardcoded URLs or file paths.
 */

import birdImage from '../../image/bird-transparent.png';
import coinImage from '../../image/coin.png';
import keyImage from '../../image/key.png';

export const ASSET_MANIFEST = {
  images: {
    'player.default': {
      id: 'player.default',
      name: 'Custom Bird',
      src: birdImage,
      type: 'image',
      format: 'png',
      width: 46,
      height: 46,
      hasAlpha: true,
    },
    'collectible.coin': {
      id: 'collectible.coin',
      name: 'Coin',
      src: coinImage,
      type: 'image',
      format: 'png',
      width: 48,
      height: 48,
      hasAlpha: true,
    },
    'collectible.key': {
      id: 'collectible.key',
      name: 'Key',
      src: keyImage,
      type: 'image',
      format: 'png',
      width: 48,
      height: 48,
      hasAlpha: true,
    },
    // Placeholders for future sprite sheets or obstacle custom textures
    'obstacle.pipe_body': {
      id: 'obstacle.pipe_body',
      src: null, // renders procedural stylized canvas pipe when null
      type: 'image',
    },
    'background.day': {
      id: 'background.day',
      src: null, // renders dynamic procedural parallax sky & mountains
      type: 'image',
    },
  },
  audio: {
    'audio.bgm_udta': {
      id: 'audio.bgm_udta',
      title: 'Udta Hi Phiru',
      artist: 'Bollywood Classic',
      src: `${import.meta.env.BASE_URL}assets/audio/udta_hi_phiru.mpeg`,
      loop: true,
      format: 'mpeg',
    },
  },
};
