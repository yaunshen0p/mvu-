/**
 * Global type definitions for store state and events
 */

import type {
  Settings,
  SettingsState,
  ChatMessage,
  ChatState,
  CodeTemplate,
  WorkspaceState,
  ExportPayload,
  UIState,
} from '../composables/stores';

/**
 * Global application state combining all stores
 */
export interface GlobalAppState {
  settings: SettingsState;
  chat: ChatState;
  workspace: WorkspaceState;
  ui: UIState;
}

/**
 * Store event types for external communication
 */
export interface StoreEvents {
  // Settings events
  'settings:updated': Settings;
  'settings:api-key-changed': string;
  'settings:provider-changed': string;

  // Chat events
  'chat:message-added': ChatMessage;
  'chat:message-updated': ChatMessage;
  'chat:history-cleared': void;
  'chat:loading-started': void;
  'chat:loading-stopped': void;
  'chat:error': Error | null;

  // Workspace events
  'workspace:artifact-updated': { tabId: string; content: string };
  'workspace:artifacts-updated': Record<string, string>;
  'workspace:tab-changed': string;
  'workspace:baseline-changed': Record<string, string>;
  'workspace:template-saved': CodeTemplate;
  'workspace:template-loaded': CodeTemplate;
  'workspace:template-deleted': string;
  'workspace:template-renamed': { oldName: string; newName: string };

  // UI events
  'ui:theme-changed': 'light' | 'dark';
  'ui:chat-sheet-toggled': boolean;
  'ui:result-sheet-toggled': boolean;
  'ui:drawer-toggled': boolean;
  'ui:settings-toggled': boolean;
  'ui:keyboard-inset-changed': number;
  'ui:sheet-drag-state-changed': 'idle' | 'dragging' | 'settling';
}

/**
 * Type for emitting store events
 */
export type StoreEventEmitter = {
  emit<K extends keyof StoreEvents>(event: K, ...args: StoreEvents[K] extends void ? [] : [StoreEvents[K]]): void;
};

/**
 * Persistence metadata for stores
 */
export interface PersistenceConfig {
  key: string;
  namespace: string;
  version: number;
}

/**
 * Store initialization options
 */
export interface StoreInitOptions {
  enablePersistence?: boolean;
  persistenceNamespace?: string;
  encryptSecrets?: boolean;
}
