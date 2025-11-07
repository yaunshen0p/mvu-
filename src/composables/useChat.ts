/**
 * Composable for chat management with high-level actions
 */

import { useChatStore } from './stores/chat';

export function useChat() {
  const store = useChatStore();

  return {
    // State
    messages: store.messages,
    isLoading: store.isLoading,
    error: store.error,

    // Computed
    latestAssistantMessage: store.latestAssistantMessage,
    latestMessage: store.latestMessage,

    // Actions
    addMessage: store.addMessage,
    updateMessage: store.updateMessage,
    sendMessage: store.sendMessage,
    loadChatHistory: store.loadChatHistory,
    clearChatHistory: store.clearChatHistory,
    abortCurrentRequest: store.abortCurrentRequest,
    getState: store.getState,
  };
}
