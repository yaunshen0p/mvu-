<template>
  <div
    ref="listContainer"
    class="chat-message-list"
    :class="{ 'scrolled-up': isScrolledUp }"
    @scroll="handleScroll"
  >
    <div v-if="messages.length === 0" class="empty-state">
      <p>No messages yet. Start a conversation!</p>
    </div>
    
    <div v-else class="messages-container">
      <ChatMessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        role="article"
        :aria-label="`${message.role} message: ${message.content.slice(0, 50)}...`"
      />
      <div v-if="isLoading" class="loading-indicator">
        <div class="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Assistant is typing...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import ChatMessageBubble from './ChatMessageBubble.vue'
import type { ChatMessage } from '@@/composables/stores/chat'

interface Props {
  messages: ChatMessage[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const listContainer = ref<HTMLDivElement>()
const isScrolledUp = ref(false)
const lastMessageCount = ref(0)

const shouldAutoScroll = computed(() => !isScrolledUp.value)

function handleScroll() {
  if (!listContainer.value) return

  const { scrollHeight, scrollTop, clientHeight } = listContainer.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

  isScrolledUp.value = !isAtBottom
}

function scrollToBottom() {
  if (!listContainer.value) return

  nextTick(() => {
    const { scrollHeight } = listContainer.value!
    listContainer.value!.scrollTop = scrollHeight
  })
}

watch(
  () => props.messages.length,
  (newLength) => {
    if (newLength > lastMessageCount.value && shouldAutoScroll.value) {
      scrollToBottom()
      lastMessageCount.value = newLength
    } else if (newLength > lastMessageCount.value) {
      lastMessageCount.value = newLength
    }
  }
)

watch(
  () => props.isLoading,
  (loading) => {
    if (loading && shouldAutoScroll.value) {
      scrollToBottom()
    }
  }
)

onMounted(() => {
  lastMessageCount.value = props.messages.length
  scrollToBottom()
})
</script>

<style scoped>
.chat-message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  -webkit-overflow-scrolling: touch;
}

.chat-message-list::-webkit-scrollbar {
  width: 6px;
}

.chat-message-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-message-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.chat-message-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-muted);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.empty-state p {
  margin: 0;
  text-align: center;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-top: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.loading-indicator p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.typing-animation {
  display: flex;
  gap: 0.35rem;
}

.typing-animation span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--text-secondary);
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-0.5rem);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .chat-message-list {
    padding: 0.75rem;
  }

  .loading-indicator {
    padding: 0.75rem;
  }
}
</style>
