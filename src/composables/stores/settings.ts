/**
 * Settings store for API configuration and provider settings.
 * Manages API key, base URL, model, provider type, and custom headers.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorageNamespace, encodeSecret, decodeSecret } from '../utils/storage';

export interface Settings {
  providerType: 'openai' | 'azure' | 'openrouter' | string;
  baseUrl: string;
  defaultModel: string;
  headers: Record<string, string>;
  apiKey: string;
}

export interface SettingsState {
  providerType: string;
  baseUrl: string;
  defaultModel: string;
  headers: Record<string, string>;
  apiKey: string;
}

const DEFAULT_SETTINGS: Settings = {
  providerType: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-3.5-turbo',
  headers: {},
  apiKey: '',
};

const STORAGE_NAMESPACE = 'mvuChat';

export const useSettingsStore = defineStore('settings', () => {
  const storage = useStorageNamespace(STORAGE_NAMESPACE);
  const API_SETTINGS_KEY = 'apiSettings';

  // State
  const providerType = ref<string>(DEFAULT_SETTINGS.providerType);
  const baseUrl = ref<string>(DEFAULT_SETTINGS.baseUrl);
  const defaultModel = ref<string>(DEFAULT_SETTINGS.defaultModel);
  const headers = ref<Record<string, string>>(DEFAULT_SETTINGS.headers);
  const apiKey = ref<string>('');

  // Load persisted settings
  function loadSettings() {
    const stored = storage.read<Settings | null>(API_SETTINGS_KEY, null);

    if (!stored) {
      resetToDefaults();
      return;
    }

    const { encodedKey, apiKey: rawKey, ...rest } = stored as any;
    const decodedKey = decodeSecret(encodedKey || rawKey);

    providerType.value = rest.providerType || DEFAULT_SETTINGS.providerType;
    baseUrl.value = rest.baseUrl || DEFAULT_SETTINGS.baseUrl;
    defaultModel.value = rest.defaultModel || DEFAULT_SETTINGS.defaultModel;
    headers.value = rest.headers || DEFAULT_SETTINGS.headers;
    apiKey.value = decodedKey;
  }

  // Computed
  const hasApiCredentials = computed(() => Boolean(apiKey.value));

  // Actions
  function resetToDefaults() {
    providerType.value = DEFAULT_SETTINGS.providerType;
    baseUrl.value = DEFAULT_SETTINGS.baseUrl;
    defaultModel.value = DEFAULT_SETTINGS.defaultModel;
    headers.value = { ...DEFAULT_SETTINGS.headers };
    apiKey.value = '';
  }

  function updateSettings(patch: Partial<Settings>) {
    if (patch.providerType) providerType.value = patch.providerType;
    if (patch.baseUrl) baseUrl.value = patch.baseUrl;
    if (patch.defaultModel) defaultModel.value = patch.defaultModel;
    if (patch.headers) headers.value = patch.headers;
    if (patch.apiKey !== undefined) apiKey.value = patch.apiKey;

    // Persist to localStorage
    persistSettings();
  }

  function updateApiKey(key: string) {
    apiKey.value = key;
    persistSettings();
  }

  function persistSettings() {
    const data = {
      providerType: providerType.value,
      baseUrl: baseUrl.value,
      defaultModel: defaultModel.value,
      headers: headers.value,
      encodedKey: encodeSecret(apiKey.value),
    };

    storage.write(API_SETTINGS_KEY, data);
  }

  function clearSettings() {
    storage.remove(API_SETTINGS_KEY);
    resetToDefaults();
  }

  function getState(): SettingsState {
    return {
      providerType: providerType.value,
      baseUrl: baseUrl.value,
      defaultModel: defaultModel.value,
      headers: headers.value,
      apiKey: apiKey.value,
    };
  }

  return {
    // State
    providerType,
    baseUrl,
    defaultModel,
    headers,
    apiKey,

    // Computed
    hasApiCredentials,

    // Actions
    loadSettings,
    updateSettings,
    updateApiKey,
    resetToDefaults,
    clearSettings,
    persistSettings,
    getState,
  };
});
