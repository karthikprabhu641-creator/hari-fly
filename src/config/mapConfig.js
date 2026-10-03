import skylandPreview from '../assets/maps/skyland.svg';
import sunsetPreview from '../assets/maps/sunset-valley.svg';
import nightCityPreview from '../assets/maps/night-city.svg';
import snowfallPreview from '../assets/maps/snowfall.svg';
import junglePreview from '../assets/maps/jungle.svg';
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
    sky: ['#38a9ec', '#8bd9f2', '#e3f5f4'],
    land: '#4b9a79',
    ground: ['#d9ce86', '#85bd54'],
    weather: ['clouds', 'rain', 'wind'],
  },
  'sunset-valley': {
    id: 'sunset-valley',
    name: 'Sunset Valley',
    description: 'Golden light over a warm valley',
    theme: 'sunset',
    preview: sunsetPreview,
    sky: ['#5e397f', '#e16a7c', '#ffc27e'],
    land: '#a74d62',
    ground: ['#bc8051', '#6b513b'],
    weather: ['rain', 'wind'],
  },
  'night-city': {
    id: 'night-city',
    name: 'Night City',
    description: 'Moonlight over a glowing skyline',
    theme: 'night',
    preview: nightCityPreview,
    sky: ['#08142e', '#172b50', '#536084'],
    land: '#18243c',
    ground: ['#56536b', '#24263c'],
    weather: ['rain', 'fog'],
  },
  snowfall: {
    id: 'snowfall',
    name: 'Snowfall',
    description: 'Blue ice and snow-capped peaks',
    theme: 'snow',
    preview: snowfallPreview,
    sky: ['#70b9e5', '#b9e2f2', '#edf8f7'],
    land: '#8fb9cb',
    ground: ['#e5f3f4', '#9ccbd7'],
    weather: ['snow', 'wind'],
  },
  jungle: {
    id: 'jungle',
    name: 'Jungle',
    description: 'Tropical canopy, vines and mist',
    theme: 'jungle',
    preview: junglePreview,
    sky: ['#1d5361', '#539783', '#b1cc83'],
    land: '#205e45',
    ground: ['#6b9b47', '#294b35'],
    weather: ['rain', 'fog', 'wind'],
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