/**
 * Safe LocalStorage Wrapper with In-Memory Fallback
 * Handles corrupt data, quota exceptions, disabled storage, and SSR/incognito modes.
 */

class SafeStorage {
  constructor() {
    this.memoryStore = new Map();
    this.isStorageAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__hrai_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    if (this.isStorageAvailable) {
      try {
        const val = window.localStorage.getItem(key);
        if (val === null || val === undefined) {
          return defaultValue;
        }
        return JSON.parse(val);
      } catch {
        // In case of JSON parse error or corruption
        return defaultValue;
      }
    }
    return this.memoryStore.has(key) ? this.memoryStore.get(key) : defaultValue;
  }

  setItem(key, value) {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        // Quota exceeded or permission error, fallback to memory
        this.memoryStore.set(key, value);
        return false;
      }
    } else {
      this.memoryStore.set(key, value);
      return true;
    }
  }

  getNumber(key, defaultValue = 0) {
    const val = this.getItem(key, defaultValue);
    const num = Number(val);
    return Number.isFinite(num) ? num : defaultValue;
  }

  setNumber(key, value) {
    return this.setItem(key, Number.isFinite(value) ? value : 0);
  }

  removeItem(key) {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
    this.memoryStore.delete(key);
  }
}

export const safeStorage = new SafeStorage();
