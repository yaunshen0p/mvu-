/**
 * Chat store for managing conversation messages and streaming state.
 * Handles chat history, loading state, and abort signals for API requests.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorageNamespace } from '../utils/storage';
import { createChatCompletion } from '../../services/openai';
import { useSettingsStore } from './settings';
import { useWorkspaceStore } from './workspace';
import { assemblePrompt, type ContextSelection, type VariableSummary } from '../../utils/prompts';
import { translateErrorMessage } from '../../utils/errors';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  pending?: boolean;
  status?: 'pending' | 'complete' | 'cancelled' | 'error';
  error?: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  abortSignal: AbortSignal | null;
  error: string | null;
}

export interface SendMessageOptions {
  userInput?: string;
  context?: ContextSelection;
  variableSummary?: VariableSummary;
  history?: ChatMessage[];
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
  const workspaceStore = useWorkspaceStore();

  // State
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const isStreaming = ref(false);
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

  async function sendMessage(userMessage: string, options?: SendMessageOptions) {
    const userInput = options?.userInput || userMessage;
    
    if (!userInput.trim()) {
      const errorMsg = '请输入要发送的内容。';
      error.value = errorMsg;
      throw new Error(errorMsg);
    }

    // Check API credentials
    const settings = settingsStore.getState();
    if (!settings.apiKey) {
      const errorMsg = '请先配置 API 凭据。';
      error.value = errorMsg;
      throw new Error(errorMsg);
    }

    // Prevent duplicate requests
    if (isLoading.value) {
      return;
    }

    // Assemble the prompt
    let assembled;
    try {
      const historyForPrompt = options?.history || messages.value;
      assembled = assemblePrompt({
        userInput: userInput.trim(),
        history: historyForPrompt.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        variableSummary: options?.variableSummary || {},
        context: options?.context || {},
      });
    } catch (assemblyError: any) {
      const errorMsg = translateErrorMessage(assemblyError?.message) || '无法构建提示。';
      error.value = errorMsg;
      throw new Error(errorMsg);
    }

    const timestamp = new Date().toISOString();
    
    // Add user message
    const userId = `user-${Date.now().toString(36)}`;
    const assistantId = `assistant-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

    const userMsg = addMessage({
      id: userId,
      role: 'user',
      content: userInput.trim(),
      timestamp,
    });

    // Add placeholder assistant message
    const assistantMsg = addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp,
      pending: true,
      status: 'pending',
    });

    // Set loading state
    isLoading.value = true;
    isStreaming.value = true;
    error.value = null;

    // Create abort controller for this request
    const abortController = new AbortController();
    currentAbortController.value = abortController;

    try {
      // Call OpenAI API with streaming
      const result = await createChatCompletion({
        apiKey: settings.apiKey,
        providerType: settings.providerType,
        baseUrl: settings.baseUrl,
        model: settings.defaultModel,
        messages: assembled.messages,
        headers: settings.headers,
        stream: true,
        signal: abortController.signal,
        onToken: (delta: string, fullText: string) => {
          // Update assistant message in real-time
          updateMessage(assistantId, {
            content: fullText,
            pending: true,
            status: 'pending',
          });
        },
        onComplete: (finalContent: string) => {
          // Mark message as complete
          updateMessage(assistantId, {
            content: finalContent,
            pending: false,
            status: 'complete',
            error: null,
          });

          // Extract and update workspace artifacts
          if (finalContent) {
            workspaceStore.extractArtifacts(finalContent);
            workspaceStore.setBaseline(workspaceStore.artifacts);
          }

          isStreaming.value = false;
        },
        onError: () => {
          isStreaming.value = false;
        },
      });

      const finalContent = result?.payload?.choices?.[0]?.message?.content ?? '';

      // Ensure the message is marked as complete (in case streaming didn't call onComplete)
      if (finalContent) {
        updateMessage(assistantId, {
          content: finalContent,
          pending: false,
          status: 'complete',
          error: null,
        });

        // Extract and update workspace artifacts
        workspaceStore.extractArtifacts(finalContent);
        workspaceStore.setBaseline(workspaceStore.artifacts);
      }

      return {
        userMessage: userMsg,
        assistantMessage: messages.value.find((msg) => msg.id === assistantId) || assistantMsg,
      };
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      
      if (!isAbort) {
        console.error('[chat] Send message error:', err);
      }

      const localizedError = translateErrorMessage(err?.message);
      const errorMessage = isAbort
        ? '请求已取消。'
        : localizedError || '请求失败，请稍后重试。';

      error.value = errorMessage;

      // Update assistant message with error
      updateMessage(assistantId, {
        content: isAbort
          ? '🚫 请求已取消。'
          : `⚠️ 错误：${errorMessage}`,
        pending: false,
        status: isAbort ? 'cancelled' : 'error',
        error: isAbort ? null : errorMessage,
      });

      throw err;
    } finally {
      isLoading.value = false;
      isStreaming.value = false;
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
      isStreaming.value = false;
    }
  }

  function getState(): ChatState {
    return {
      messages: messages.value,
      isLoading: isLoading.value,
      isStreaming: isStreaming.value,
      abortSignal: currentAbortController.value?.signal || null,
      error: error.value,
    };
  }

  return {
    // State
    messages,
    isLoading,
    isStreaming,
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
