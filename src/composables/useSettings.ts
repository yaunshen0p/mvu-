/**
 * Composable for settings management with high-level actions
 */

import { useSettingsStore } from './stores/settings';

export function useSettings() {
  const store = useSettingsStore();

  return {
    // State
    providerType: store.providerType,
    baseUrl: store.baseUrl,
    defaultModel: store.defaultModel,
    headers: store.headers,
    apiKey: store.apiKey,

    // Computed
    hasApiCredentials: store.hasApiCredentials,

    // Actions
    loadSettings: store.loadSettings,
    updateSettings: store.updateSettings,
    updateApiKey: store.updateApiKey,
    resetToDefaults: store.resetToDefaults,
    clearSettings: store.clearSettings,
    getState: store.getState,
  };
}
