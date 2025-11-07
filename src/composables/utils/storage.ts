/**
 * Storage utility functions for Pinia composables.
 * Ports and adapts logic from src/storage.js for use in Vue 3 stores.
 */

const isBrowser = typeof window !== 'undefined';

function getLocalStorage(): Storage | null {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('[storage] Failed to access localStorage', error);
    return null;
  }
}

function toBinaryString(value: unknown): string {
  const stringValue = `${value}`;

  if (typeof TextEncoder === 'function') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(stringValue);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return binary;
  }

  return encodeURIComponent(stringValue).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function fromBinaryString(binary: string): string {
  if (typeof TextDecoder === 'function') {
    const decoder = new TextDecoder();
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return decoder.decode(bytes);
  }

  try {
    const encoded = Array.from(binary)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('');
    return decodeURIComponent(encoded);
  } catch (error) {
    console.warn('[storage] Failed to decode binary string', error);
    return binary;
  }
}

export function encodeSecret(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';

  try {
    if (typeof btoa === 'function') {
      return btoa(toBinaryString(value));
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(`${value}`, 'utf-8').toString('base64');
    }

    return `${value}`;
  } catch (error) {
    console.warn('[storage] Failed to encode secret', error);
    return `${value}`;
  }
}

export function decodeSecret(value: string | undefined | null): string {
  if (!value) return '';

  try {
    if (typeof atob === 'function') {
      const binary = atob(value);
      return fromBinaryString(binary);
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value, 'base64').toString('utf-8');
    }

    return value;
  } catch (error) {
    console.warn('[storage] Failed to decode secret', error);
    return '';
  }
}

export function readJSON<T = unknown>(key: string, fallback: T): T {
  const storage = getLocalStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to parse JSON for ${key}`, error);
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  try {
    if (value === undefined || value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }

    return true;
  } catch (error) {
    console.warn(`[storage] Failed to write JSON for ${key}`, error);
    return false;
  }
}

/**
 * Create a namespaced storage helper
 */
export function useStorageNamespace(namespace: string) {
  const getKey = (key: string) => `${namespace}:${key}`;

  return {
    read<T = unknown>(key: string, fallback: T): T {
      return readJSON(getKey(key), fallback);
    },

    write(key: string, value: unknown): boolean {
      return writeJSON(getKey(key), value);
    },

    remove(key: string): boolean {
      const storage = getLocalStorage();
      if (!storage) return false;
      try {
        storage.removeItem(getKey(key));
        return true;
      } catch (error) {
        console.warn(`[storage] Failed to remove ${key}`, error);
        return false;
      }
    },

    clear(): boolean {
      const storage = getLocalStorage();
      if (!storage) return false;
      try {
        const prefix = getKey('');
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => storage.removeItem(key));
        return true;
      } catch (error) {
        console.warn(`[storage] Failed to clear namespace ${namespace}`, error);
        return false;
      }
    },
  };
}
