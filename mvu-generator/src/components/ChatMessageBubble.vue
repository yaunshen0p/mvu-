<template>
  <div :class="['chat-message-bubble', { 'is-user': message.role === 'user', 'is-assistant': message.role === 'assistant', 'is-system': message.role === 'system' }]">
    <div class="message-content">
      <p class="message-text">{{ message.content }}</p>
    </div>
    <span class="message-timestamp">{{ formatTime(message.timestamp) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@@/composables/stores/chat'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const message = computed(() => props.message)

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.chat-message-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  flex-direction: column;
}

.is-user .message-content {
  align-items: flex-end;
}

.is-assistant .message-content {
  align-items: flex-start;
}

.message-text {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.is-user .message-text {
  background: var(--color-accent);
  color: white;
  border-radius: 0.75rem 0.25rem 0.75rem 0.75rem;
}

.is-assistant .message-text {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem 0.75rem 0.75rem 0.75rem;
}

.is-system .message-text {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  text-align: center;
}

.message-timestamp {
  display: flex;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0 0.5rem;
}

.is-user .message-timestamp {
  justify-content: flex-end;
}

.is-assistant .message-timestamp {
  justify-content: flex-start;
}

@media (max-width: 640px) {
  .message-text {
    max-width: 90%;
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
}
</style>
