/**
 * Chat store for managing conversation messages and streaming state.
 * Handles chat history, loading state, and abort signals for API requests.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorageNamespace } from '../utils/storage';
import { createChatCompletion } from '../../services/openai';
import { useSettingsStore } from './settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  abortSignal: AbortSignal | null;
  error: string | null;
}

const STORAGE_NAMESPACE = 'mvuChat';
const CHAT_HISTORY_KEY = 'chatHistory';

function normaliseChatMessage(message: any): ChatMessage | null {
  if (!message || typeof message !== 'object') return null;
  if (!message.role || !message.content) return null;

  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
    id: message.id || `${message.role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
}

export const useChatStore = defineStore('chat', () => {
  const storage = useStorageNamespace(STORAGE_NAMESPACE);
  const settingsStore = useSettingsStore();

  // State
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const currentAbortController = ref<AbortController | null>(null);
  const error = ref<string | null>(null);

  // Load persisted chat history
  function loadChatHistory() {
    const history = storage.read<any[]>(CHAT_HISTORY_KEY, []);

    if (!Array.isArray(history)) {
      messages.value = [];
      return;
    }

    messages.value = history
      .map(normaliseChatMessage)
      .filter((msg): msg is ChatMessage => msg !== null);
  }

  // Computed
  const latestAssistantMessage = computed(() => {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'assistant') {
        return messages.value[i];
      }
    }
    return null;
  });

  const latestMessage = computed(() => {
    return messages.value.length > 0 ? messages.value[messages.value.length - 1] : null;
  });

  // Actions
  function addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const timestamp = message.timestamp || new Date().toISOString();
    const id = message.id || `${message.role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp,
    } as ChatMessage;

    messages.value.push(newMessage);
    persistChatHistory();

    return newMessage;
  }

  function updateMessage(id: string, patch: Partial<ChatMessage>) {
    const index = messages.value.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...patch };
      persistChatHistory();
    }
  }

  function persistChatHistory() {
    const sanitised = messages.value.map(normaliseChatMessage).filter((msg): msg is ChatMessage => msg !== null);
    storage.write(CHAT_HISTORY_KEY, sanitised);
  }

  async function sendMessage(userMessage: string, contextData?: Record<string, any>) {
    if (!userMessage.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Add user message to history
    const userMsg = addMessage({
      role: 'user',
      content: userMessage.trim(),
    });

    // Set loading state
    isLoading.value = true;
    error.value = null;

    // Create abort controller for this request
    const abortController = new AbortController();
    currentAbortController.value = abortController;

    try {
      const settings = settingsStore.getState();

      if (!settings.apiKey) {
        throw new Error('API key is not configured');
      }

      // Build the messages array with context
      const messagesToSend: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = messages.value.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call OpenAI API
      const { payload } = await createChatCompletion({
        apiKey: settings.apiKey,
        providerType: settings.providerType,
        baseUrl: settings.baseUrl,
        model: settings.defaultModel,
        messages: messagesToSend,
        headers: settings.headers,
        signal: abortController.signal,
      });

      const assistantContent = payload?.choices?.[0]?.message?.content;

      if (!assistantContent) {
        throw new Error('No response received from API');
      }

      // Add assistant message to history
      const assistantMsg = addMessage({
        role: 'assistant',
        content: assistantContent,
      });

      return {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        error.value = 'Request was cancelled';
      } else {
        error.value = err?.message || 'Failed to send message';
      }
      console.error('[chat] Send message error:', err);
      throw err;
    } finally {
      isLoading.value = false;
      currentAbortController.value = null;
    }
  }

  function clearChatHistory() {
    messages.value = [];
    storage.remove(CHAT_HISTORY_KEY);
  }

  function abortCurrentRequest() {
    if (currentAbortController.value) {
      currentAbortController.value.abort();
      currentAbortController.value = null;
      isLoading.value = false;
    }
  }

  function getState(): ChatState {
    return {
      messages: messages.value,
      isLoading: isLoading.value,
      abortSignal: currentAbortController.value?.signal || null,
      error: error.value,
    };
  }

  return {
    // State
    messages,
    isLoading,
    error,

    // Computed
    latestAssistantMessage,
    latestMessage,

    // Actions
    addMessage,
    updateMessage,
    sendMessage,
    loadChatHistory,
    clearChatHistory,
    abortCurrentRequest,
    persistChatHistory,
    getState,
  };
});
