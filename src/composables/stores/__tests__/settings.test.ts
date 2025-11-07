/**
 * Unit tests for settings store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from '../settings';

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

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default settings', () => {
    const store = useSettingsStore();
    store.loadSettings();

    expect(store.apiKey).toBe('');
    expect(store.baseUrl).toBe('https://api.openai.com/v1');
    expect(store.defaultModel).toBe('gpt-3.5-turbo');
    expect(store.providerType).toBe('openai');
  });

  it('should have no API credentials initially', () => {
    const store = useSettingsStore();
    store.loadSettings();

    expect(store.hasApiCredentials).toBe(false);
  });

  it('should update API key', () => {
    const store = useSettingsStore();
    store.updateApiKey('test-key-123');

    expect(store.apiKey).toBe('test-key-123');
    expect(store.hasApiCredentials).toBe(true);
  });

  it('should update settings', () => {
    const store = useSettingsStore();

    store.updateSettings({
      providerType: 'azure',
      baseUrl: 'https://custom.openai.azure.com',
      defaultModel: 'gpt-4',
      apiKey: 'azure-key',
    });

    expect(store.providerType).toBe('azure');
    expect(store.baseUrl).toBe('https://custom.openai.azure.com');
    expect(store.defaultModel).toBe('gpt-4');
    expect(store.apiKey).toBe('azure-key');
  });

  it('should persist settings to localStorage', () => {
    const store = useSettingsStore();

    store.updateSettings({
      providerType: 'openai',
      apiKey: 'sk-test',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-3.5-turbo',
    });

    // Check that settings were persisted
    const raw = localStorage.getItem('mvuChat:apiSettings');
    expect(raw).toBeTruthy();

    const persisted = JSON.parse(raw!);
    expect(persisted.providerType).toBe('openai');
    expect(persisted.defaultModel).toBe('gpt-3.5-turbo');
    // API key should be encoded
    expect(persisted.encodedKey).toBeTruthy();
  });

  it('should load persisted settings', () => {
    // First store - set some settings
    const store1 = useSettingsStore();
    store1.updateSettings({
      providerType: 'azure',
      apiKey: 'secret-key',
      defaultModel: 'gpt-4',
    });

    // Create new store instance and load
    const store2 = useSettingsStore();
    store2.loadSettings();

    expect(store2.providerType).toBe('azure');
    expect(store2.defaultModel).toBe('gpt-4');
    expect(store2.apiKey).toBe('secret-key');
  });

  it('should reset to defaults', () => {
    const store = useSettingsStore();

    store.updateSettings({
      providerType: 'azure',
      apiKey: 'custom-key',
    });

    store.resetToDefaults();

    expect(store.apiKey).toBe('');
    expect(store.baseUrl).toBe('https://api.openai.com/v1');
    expect(store.providerType).toBe('openai');
  });

  it('should clear settings', () => {
    const store = useSettingsStore();

    store.updateSettings({
      apiKey: 'secret',
      providerType: 'azure',
    });

    store.clearSettings();

    expect(store.apiKey).toBe('');
    expect(localStorage.getItem('mvuChat:apiSettings')).toBe(null);
  });

  it('should return state object', () => {
    const store = useSettingsStore();
    store.updateSettings({
      apiKey: 'test-key',
      providerType: 'openai',
    });

    const state = store.getState();

    expect(state.apiKey).toBe('test-key');
    expect(state.providerType).toBe('openai');
    expect(state.baseUrl).toBe('https://api.openai.com/v1');
  });

  it('should handle custom headers', () => {
    const store = useSettingsStore();
    const customHeaders = { 'X-Custom': 'value' };

    store.updateSettings({
      headers: customHeaders,
    });

    expect(store.headers).toEqual(customHeaders);

    const state = store.getState();
    expect(state.headers).toEqual(customHeaders);
  });
});
