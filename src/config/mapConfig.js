import skylandPreview from '../assets/maps/skyland.svg';
import sunsetPreview from '../assets/maps/sunset-valley.svg';
import nightCityPreview from '../assets/maps/night-city.svg';
import snowfallPreview from '../assets/maps/snowfall.svg';
import junglePreview from '../assets/maps/jungle.svg';
import desertPreview from '../assets/maps/desert.svg';
import oceanPreview from '../assets/maps/ocean.svg';
import volcanoPreview from '../assets/maps/volcano.svg';
import skylandPhoto from '../assets/maps-real/skyland.webp';
import sunsetPhoto from '../assets/maps-real/sunset-valley.webp';
import nightCityPhoto from '../assets/maps-real/night-city.webp';
import snowfallPhoto from '../assets/maps-real/snowfall.webp';
import junglePhoto from '../assets/maps-real/jungle.webp';
import desertPhoto from '../assets/maps-real/desert.webp';
import oceanPhoto from '../assets/maps-real/ocean.webp';
import volcanoPhoto from '../assets/maps-real/volcano.webp';
import { safeStorage } from '../utils/storage';

export const DEFAULT_MAP_ID = 'skyland';
export const SELECTED_MAP_STORAGE_KEY = 'selectedMap';

export const MAPS = {
  skyland: {
    id: 'skyland',
    name: 'Skyland',
    description: 'Bright clouds and floating islands',
    theme: 'day',
    preview: skylandPreview,
    photo: skylandPhoto,
    sky: ['#38a9ec', '#8bd9f2', '#e3f5f4'],
    land: '#4b9a79',
    ground: ['#d9ce86', '#85bd54'],
    weather: ['clouds', 'rain', 'wind'],
    accent: '#2bb5f0',
    backdrop: ['#07141a', '#0c2a2a'],
    pipeTheme: {
      colors: ['#7898a2', '#e9f5ee', '#b6d4d0', '#567d8b'],
      outline: '#456773',
      highlight: '#ffffff',
      detail: '#d9f5f0',
      pattern: 'cloud',
    },
  },
  'sunset-valley': {
    id: 'sunset-valley',
    name: 'Sunset Valley',
    description: 'Golden light over a warm valley',
    theme: 'sunset',
    preview: sunsetPreview,
    photo: sunsetPhoto,
    sky: ['#5e397f', '#e16a7c', '#ffc27e'],
    land: '#a74d62',
    ground: ['#bc8051', '#6b513b'],
    weather: ['rain', 'wind'],
    accent: '#ffc21a',
    backdrop: ['#24101f', '#8a3d32'],
    pipeTheme: {
      colors: ['#9a482e', '#f28c45', '#d96337', '#652e36'],
      outline: '#572a31',
      highlight: '#ffe0a3',
      detail: '#ffc27e',
      pattern: 'bands',
    },
  },
  'night-city': {
    id: 'night-city',
    name: 'Night City',
    description: 'Moonlight over a glowing skyline',
    theme: 'night',
    preview: nightCityPreview,
    photo: nightCityPhoto,
    sky: ['#08142e', '#172b50', '#536084'],
    land: '#18243c',
    ground: ['#56536b', '#24263c'],
    weather: ['rain', 'fog'],
    accent: '#ff5fa2',
    backdrop: ['#050711', '#17294f'],
    pipeTheme: {
      colors: ['#20244d', '#5546a8', '#393b82', '#11152f'],
      outline: '#100e2b',
      highlight: '#ff5fa2',
      detail: '#9eeaff',
      pattern: 'circuit',
    },
  },
  snowfall: {
    id: 'snowfall',
    name: 'Snowfall',
    description: 'Blue ice and snow-capped peaks',
    theme: 'snow',
    preview: snowfallPreview,
    photo: snowfallPhoto,
    sky: ['#70b9e5', '#b9e2f2', '#edf8f7'],
    land: '#8fb9cb',
    ground: ['#e5f3f4', '#9ccbd7'],
    weather: ['snow', 'wind'],
    accent: '#2bb5f0',
    backdrop: ['#07141a', '#0c2a2a'],
    pipeTheme: {
      colors: ['#5c91aa', '#dff7ff', '#9fd1e7', '#477b96'],
      outline: '#38677f',
      highlight: '#ffffff',
      detail: '#eafaff',
      pattern: 'ice',
    },
  },
  jungle: {
    id: 'jungle',
    name: 'Jungle',
    description: 'Tropical canopy, vines and mist',
    theme: 'jungle',
    preview: junglePreview,
    photo: junglePhoto,
    sky: ['#1d5361', '#539783', '#b1cc83'],
    land: '#205e45',
    ground: ['#6b9b47', '#294b35'],
    weather: ['rain', 'fog', 'wind'],
    accent: '#b6f23a',
    backdrop: ['#071913', '#1d5361'],
    pipeTheme: {
      colors: ['#4b3022', '#91623d', '#70482d', '#30251d'],
      outline: '#281d17',
      highlight: '#c89b65',
      detail: '#75b84e',
      pattern: 'vines',
    },
  },
  desert: {
    id: 'desert',
    name: 'Desert Dunes',
    description: 'Sun-baked canyons and golden sands',
    theme: 'desert',
    preview: desertPreview,
    photo: desertPhoto,
    sky: ['#70b5c8', '#f0c77b', '#ffe4a3'],
    land: '#bd7644',
    ground: ['#e5b968', '#a85c37'],
    weather: ['wind'],
    accent: '#ffcf70',
    backdrop: ['#26171a', '#8e4a35'],
    pipeTheme: {
      colors: ['#8c4d35', '#e3a34f', '#c57a3e', '#713c32'],
      outline: '#5e342d',
      highlight: '#ffe0a3',
      detail: '#f5c979',
      pattern: 'sandstone',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Coral Ocean',
    description: 'A blue deep-sea flight through coral reefs',
    theme: 'ocean',
    preview: oceanPreview,
    photo: oceanPhoto,
    sky: ['#087eaa', '#22b8b2', '#b5e7cc'],
    land: '#087e8b',
    ground: ['#62c7ae', '#087d88'],
    weather: ['rain', 'wind'],
    accent: '#4be4d2',
    backdrop: ['#041c37', '#087e8b'],
    pipeTheme: {
      colors: ['#075985', '#22b8b2', '#0e8e9b', '#063b63'],
      outline: '#032f4d',
      highlight: '#a7fff0',
      detail: '#70f0dc',
      pattern: 'bubbles',
    },
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    description: 'Smoldering volcanic rock and glowing lava',
    theme: 'volcanic',
    preview: volcanoPreview,
    photo: volcanoPhoto,
    sky: ['#281b35', '#8e3d42', '#f08345'],
    land: '#4b3038',
    ground: ['#6c4140', '#241e2a'],
    weather: ['fog', 'wind'],
    accent: '#ff7445',
    backdrop: ['#170f1d', '#5f2634'],
    pipeTheme: {
      colors: ['#28252d', '#66505a', '#49343e', '#1c1a22'],
      outline: '#17151b',
      highlight: '#ff8a45',
      detail: '#ffc15e',
      pattern: 'lava',
    },
  },
};

export const MAP_LIST = Object.values(MAPS);

export function getMap(mapId) {
  return MAPS[mapId] || MAPS[DEFAULT_MAP_ID];
}

export function getSelectedMapId() {
  const storedMapId = safeStorage.getItem(SELECTED_MAP_STORAGE_KEY, DEFAULT_MAP_ID);
  return MAPS[storedMapId] ? storedMapId : DEFAULT_MAP_ID;
}

export function saveSelectedMap(mapId) {
  const selectedMapId = MAPS[mapId] ? mapId : DEFAULT_MAP_ID;
  safeStorage.setItem(SELECTED_MAP_STORAGE_KEY, selectedMapId);
  return selectedMapId;
}