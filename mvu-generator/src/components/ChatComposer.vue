<template>
  <div class="chat-composer">
    <div class="composer-controls">
      <button
        class="context-toggle"
        :class="{ active: showContext }"
        @click="showContext = !showContext"
        aria-label="Toggle context options"
        title="Context settings"
      >
        ⚙️
      </button>
    </div>

    <div v-if="showContext" class="context-section">
      <div class="context-header">
        <h3>Context Settings</h3>
        <button
          class="close-btn"
          @click="showContext = false"
          aria-label="Close context settings"
        >
          ✕
        </button>
      </div>
      <div class="context-content">
        <label class="context-item">
          <input
            v-model="includeWorkspaceContext"
            type="checkbox"
            @change="updateWorkspaceContext"
          />
          <span>Include workspace artifacts</span>
        </label>
        <label class="context-item">
          <input
            v-model="includeChatHistory"
            type="checkbox"
          />
          <span>Use full chat history</span>
        </label>
      </div>
    </div>

    <div class="composer-input-section">
      <textarea
        ref="textareaRef"
        v-model="message"
        class="composer-textarea"
        placeholder="Type your message... (Shift+Enter for new line)"
        :disabled="isLoading || !hasApiCredentials"
        @keydown="handleKeyDown"
        @input="handleInput"
        aria-label="Message input"
        rows="1"
      />

      <div class="composer-actions">
        <button
          v-if="!isLoading"
          class="send-btn"
          :disabled="!message.trim() || !hasApiCredentials || isLoading"
          @click="handleSend"
          aria-label="Send message"
        >
          Send
        </button>
        <button
          v-else
          class="stop-btn"
          @click="handleStop"
          aria-label="Stop generating"
        >
          Stop
        </button>
      </div>
    </div>

    <div v-if="showPromptPreview && message" class="prompt-preview">
      <div class="preview-header">
        <h4>Message Preview</h4>
        <button
          class="close-btn"
          @click="showPromptPreview = false"
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>
      <div class="preview-content">
        {{ message }}
      </div>
    </div>

    <div v-if="!hasApiCredentials" class="api-warning">
      <p>⚠️ API credentials not configured. Please set them in settings.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChat, useSettings, useWorkspace } from '@@/composables'

const emit = defineEmits<{
  send: [message: string]
  stop: []
}>()

const { sendMessage, isLoading, abortCurrentRequest } = useChat()
const { hasApiCredentials } = useSettings()
const { artifacts } = useWorkspace()

const message = ref('')
const showContext = ref(false)
const showPromptPreview = ref(false)
const includeWorkspaceContext = ref(true)
const includeChatHistory = ref(true)
const textareaRef = ref<HTMLTextAreaElement>()

function autoResizeTextarea() {
  if (!textareaRef.value) return

  textareaRef.value.style.height = 'auto'
  const newHeight = Math.min(textareaRef.value.scrollHeight, 120)
  textareaRef.value.style.height = `${newHeight}px`
}

function handleInput() {
  autoResizeTextarea()
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  } else if (event.key === 'Enter' && event.shiftKey) {
    // Allow default behavior for Shift+Enter (new line)
  }
}

async function handleSend() {
  if (!message.value.trim() || !hasApiCredentials.value || isLoading.value) {
    return
  }

  const userMessage = message.value.trim()
  message.value = ''
  emit('send', userMessage)

  try {
    await sendMessage(userMessage, {
      workspace: includeWorkspaceContext.value ? artifacts.value : undefined,
    })
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    autoResizeTextarea()
  }
}

function handleStop() {
  abortCurrentRequest()
  emit('stop')
}

function updateWorkspaceContext() {
  // This would update the workspace context setting
  // Can be integrated with workspace store if needed
}

onMounted(() => {
  autoResizeTextarea()
})
</script>

<style scoped>
.chat-composer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.composer-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.context-toggle {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.context-toggle:hover,
.context-toggle.active {
  background: var(--bg-tertiary);
  border-color: var(--color-accent);
}

.context-section {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.context-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.context-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.context-item input {
  cursor: pointer;
  width: 1rem;
  height: 1rem;
}

.composer-input-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.composer-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.4;
  resize: none;
  min-height: 2.5rem;
  max-height: 120px;
  overflow-y: auto;
  transition: border-color 0.2s;
}

.composer-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--bg-secondary);
}

.composer-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.composer-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.send-btn,
.stop-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn {
  background: var(--color-accent);
  color: white;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-btn {
  background: #ef4444;
  color: white;
}

.stop-btn:hover {
  background: #dc2626;
}

.prompt-preview {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  animation: slideDown 0.2s ease-out;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.preview-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-content {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  max-height: 100px;
  overflow-y: auto;
}

.api-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.dark .api-warning {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

.api-warning p {
  margin: 0;
}

@media (max-width: 640px) {
  .chat-composer {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .composer-textarea {
    font-size: 0.875rem;
    padding: 0.625rem;
  }

  .send-btn,
  .stop-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }
}
</style>
