/**
 * Pinia persistence plugin for automatic state hydration and persistence
 */

import type { PiniaPluginContext } from 'pinia';
import { useStorageNamespace, encodeSecret, decodeSecret } from '../utils/storage';

/**
 * Pinia plugin to automatically persist and hydrate store state
 */
export function createPersistencePlugin() {
  return (context: PiniaPluginContext) => {
    const { store, options } = context;

    // Skip if store doesn't have persistence metadata
    const storeName = store.$id;

    // Define which stores should be persisted and their keys
    const persistenceConfig: Record<string, { key: string; encode?: string[] }> = {
      settings: {
        key: 'apiSettings',
        encode: ['apiKey'],
      },
      chat: {
        key: 'chatHistory',
      },
      workspace: {
        key: 'codeTemplates',
      },
      ui: {
        key: 'theme',
      },
    };

    const config = persistenceConfig[storeName];
    if (!config) return;

    const storage = useStorageNamespace('mvuChat');
    const PERSIST_NAMESPACE = 'mvuChat';

    // Hydrate from storage on initialization
    const stored = storage.read(config.key, null);
    if (stored) {
      if (config.encode) {
        // Handle encoded fields
        const data = stored as any;
        if (typeof data === 'object' && !Array.isArray(data)) {
          config.encode.forEach((field) => {
            if (data[field]) {
              data[field] = decodeSecret(data[field]);
            }
          });
        }
      }

      // For settings store, we need special handling
      if (storeName === 'settings' && typeof stored === 'object') {
        const { encodedKey, apiKey, ...rest } = stored as any;
        const decodedKey = decodeSecret(encodedKey || apiKey);
        store.$patch({ ...rest, apiKey: decodedKey });
      } else if (storeName === 'chat' && Array.isArray(stored)) {
        store.$patch({ messages: stored });
      } else if (storeName === 'ui') {
        store.$patch({ theme: stored });
      } else if (storeName === 'workspace' && Array.isArray(stored)) {
        store.$patch({ templates: stored });
      }
    }

    // Subscribe to state changes and persist
    store.$subscribe(
      (mutation, state) => {
        if (storeName === 'settings') {
          // Encode sensitive data before persisting
          const toSave = {
            providerType: (state as any).providerType,
            baseUrl: (state as any).baseUrl,
            defaultModel: (state as any).defaultModel,
            headers: (state as any).headers,
            encodedKey: encodeSecret((state as any).apiKey),
          };
          storage.write(config.key, toSave);
        } else if (storeName === 'chat') {
          // Persist chat history
          storage.write(config.key, (state as any).messages);
        } else if (storeName === 'ui') {
          // Persist theme
          storage.write(config.key, (state as any).theme);
        } else if (storeName === 'workspace') {
          // Persist templates
          storage.write(config.key, (state as any).templates);
        }
      },
      { deep: true }
    );
  };
}
