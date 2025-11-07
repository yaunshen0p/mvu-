/**
 * Unit tests for storage utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  encodeSecret,
  decodeSecret,
  readJSON,
  writeJSON,
  useStorageNamespace,
} from '../storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('encodeSecret', () => {
    it('should encode a string', () => {
      const original = 'my-secret-key';
      const encoded = encodeSecret(original);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toBe(original);
    });

    it('should handle empty string', () => {
      expect(encodeSecret('')).toBe('');
      expect(encodeSecret(null)).toBe('');
      expect(encodeSecret(undefined)).toBe('');
    });

    it('should handle numbers', () => {
      const encoded = encodeSecret(12345);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeSecret', () => {
    it('should decode an encoded secret', () => {
      const original = 'my-secret-key';
      const encoded = encodeSecret(original);
      const decoded = decodeSecret(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle empty or null values', () => {
      expect(decodeSecret('')).toBe('');
      expect(decodeSecret(null)).toBe('');
      expect(decodeSecret(undefined)).toBe('');
    });

    it('should handle decode errors gracefully', () => {
      const invalid = 'not-valid-base64!!!';
      const decoded = decodeSecret(invalid);
      expect(typeof decoded).toBe('string');
    });
  });

  describe('readJSON', () => {
    it('should read JSON from localStorage', () => {
      const data = { foo: 'bar', count: 42 };
      localStorage.setItem('test-key', JSON.stringify(data));

      const result = readJSON('test-key', {});
      expect(result).toEqual(data);
    });

    it('should return fallback for missing key', () => {
      const fallback = { default: true };
      const result = readJSON('non-existent', fallback);
      expect(result).toEqual(fallback);
    });

    it('should return fallback for invalid JSON', () => {
      localStorage.setItem('bad-key', 'not-json{]');
      const fallback = { default: true };
      const result = readJSON('bad-key', fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('writeJSON', () => {
    it('should write JSON to localStorage', () => {
      const data = { foo: 'bar' };
      const result = writeJSON('test-key', data);

      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify(data));
    });

    it('should remove item when value is null', () => {
      localStorage.setItem('test-key', 'some-value');
      writeJSON('test-key', null);

      expect(localStorage.getItem('test-key')).toBe(null);
    });

    it('should remove item when value is undefined', () => {
      localStorage.setItem('test-key', 'some-value');
      writeJSON('test-key', undefined);

      expect(localStorage.getItem('test-key')).toBe(null);
    });
  });

  describe('useStorageNamespace', () => {
    it('should create namespaced storage', () => {
      const ns = useStorageNamespace('test-namespace');
      ns.write('key1', { data: 'value' });

      const result = ns.read('key1', null);
      expect(result).toEqual({ data: 'value' });
    });

    it('should prefix keys with namespace', () => {
      const ns = useStorageNamespace('app');
      ns.write('setting', { theme: 'dark' });

      const rawKey = 'app:setting';
      expect(localStorage.getItem(rawKey)).toBe(JSON.stringify({ theme: 'dark' }));
    });

    it('should remove namespaced item', () => {
      const ns = useStorageNamespace('app');
      ns.write('key1', { data: 'value' });
      const removed = ns.remove('key1');

      expect(removed).toBe(true);
      expect(ns.read('key1', null)).toBe(null);
    });

    it('should clear all namespaced items', () => {
      const ns = useStorageNamespace('app');
      ns.write('key1', 'value1');
      ns.write('key2', 'value2');
      ns.write('key3', 'value3');

      const cleared = ns.clear();
      expect(cleared).toBe(true);

      expect(ns.read('key1', null)).toBe(null);
      expect(ns.read('key2', null)).toBe(null);
      expect(ns.read('key3', null)).toBe(null);
    });

    it('should handle multiple namespaces independently', () => {
      const ns1 = useStorageNamespace('app1');
      const ns2 = useStorageNamespace('app2');

      ns1.write('setting', 'value1');
      ns2.write('setting', 'value2');

      expect(ns1.read('setting', null)).toBe('value1');
      expect(ns2.read('setting', null)).toBe('value2');

      ns1.clear();

      expect(ns1.read('setting', null)).toBe(null);
      expect(ns2.read('setting', null)).toBe('value2');
    });
  });
});
