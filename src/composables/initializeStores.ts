/**
 * Initialize all stores on application startup
 */

import { useSettingsStore } from './stores/settings';
import { useChatStore } from './stores/chat';
import { useWorkspaceStore } from './stores/workspace';
import { useUIStore } from './stores/ui';

/**
 * Initialize all stores from localStorage on app startup
 */
export function initializeAllStores() {
  const settingsStore = useSettingsStore();
  const chatStore = useChatStore();
  const workspaceStore = useWorkspaceStore();
  const uiStore = useUIStore();

  // Load persisted data
  settingsStore.loadSettings();
  chatStore.loadChatHistory();
  workspaceStore.loadTemplates();
  uiStore.initializeTheme();

  return {
    settingsStore,
    chatStore,
    workspaceStore,
    uiStore,
  };
}
