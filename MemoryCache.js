import { AsyncStorage } from 'react-native';

const STORAGE_KEY = '@crossroads-anywhere:images';
const DEFAULT_EXPIRES = 3600; // seconds

let inMemoryCache = {};
let MemoryCache = {};

function currentTime(){
    return Math.floor((new Date().getTime() / 1000));
}

async function getItem(key) {
}

MemoryCache.set = async (key, value, expires = DEFAULT_EXPIRES) => {
    const cache = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
    const entry = {
      value,
      expires: currentTime() + expires,
    };
    cache[key] = JSON.stringify(entry);
    inMemoryCache = { ...cache };
    return await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

MemoryCache.get = async (key) => {
    if (Object.keys(inMemoryCache).length === 0) {
      const cache = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
      inMemoryCache = { ...cache };
    }
    if (!inMemoryCache[key]) {
      return null;
    }

    const entry = JSON.parse(inMemoryCache[key]);
    if (entry.expires >= currentTime()) {
      return entry.value;
    }

    delete inMemoryCache[key];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryCache));
    return null;
};

MemoryCache.remove = async (key) => {
    const cache = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
    delete cache[key];
    inMemoryCache = { ...cache };
    return await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

MemoryCache.flush = async () => {
    inMemoryCache = {};
    return await AsyncStorage.removeItem(STORAGE_KEY);
};

MemoryCache.isExpired = async (key) => {
    if (Object.keys(inMemoryCache).length === 0) {
      const cache = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
      inMemoryCache = { ...cache };
    }
    if (!inMemoryCache[key]) return true;

    const entry = JSON.parse(inMemoryCache[key]);
    return entry.expires < currentTime();
};

MemoryCache.getAllKeys = async () => {
    if (Object.keys(inMemoryCache).length === 0) {
      const cache = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
      inMemoryCache = { ...cache };
    }
    return Object.keys(inMemoryCache);
};

export default MemoryCache;
