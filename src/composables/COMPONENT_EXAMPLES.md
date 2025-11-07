# Component Examples

This document shows how to use the stores and composables in Vue components.

## Table of Contents

1. [Settings Component](#settings-component)
2. [Chat Component](#chat-component)
3. [Workspace Component](#workspace-component)
4. [Theme Toggle](#theme-toggle)
5. [Complete App Example](#complete-app-example)

## Settings Component

Example component for managing API settings:

```vue
<template>
  <div class="settings-panel">
    <h2>API Configuration</h2>
    
    <form @submit.prevent="saveSettings">
      <!-- Provider Select -->
      <label>
        Provider:
        <select v-model="localSettings.provider">
          <option value="openai">OpenAI</option>
          <option value="azure">Azure</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </label>

      <!-- API Key Input -->
      <label>
        API Key:
        <input 
          v-model="localSettings.apiKey" 
          type="password"
          placeholder="sk-..."
        />
      </label>

      <!-- Model Select -->
      <label>
        Model:
        <input 
          v-model="localSettings.model" 
          type="text"
          placeholder="gpt-3.5-turbo"
        />
      </label>

      <!-- Base URL -->
      <label>
        Base URL:
        <input 
          v-model="localSettings.baseUrl"
          type="url"
          placeholder="https://api.openai.com/v1"
        />
      </label>

      <button type="submit">Save Settings</button>
      <button type="button" @click="resetSettings">Reset</button>
    </form>

    <p v-if="hasApiCredentials" class="success">
      ✓ API credentials configured
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSettings } from '@/composables'

const {
  apiKey,
  baseUrl,
  defaultModel,
  providerType,
  hasApiCredentials,
  updateSettings,
  resetToDefaults,
  loadSettings,
} = useSettings()

const localSettings = reactive({
  apiKey: apiKey,
  baseUrl: baseUrl,
  model: defaultModel,
  provider: providerType,
})

function saveSettings() {
  updateSettings({
    apiKey: localSettings.apiKey,
    baseUrl: localSettings.baseUrl,
    defaultModel: localSettings.model,
    providerType: localSettings.provider,
  })
  alert('Settings saved!')
}

function resetSettings() {
  resetToDefaults()
  loadSettings()
  localSettings.apiKey = apiKey
  localSettings.baseUrl = baseUrl
  localSettings.model = defaultModel
  localSettings.provider = providerType
}

// Load persisted settings on mount
onMounted(() => loadSettings())
</script>

<style scoped>
.settings-panel {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input, select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.success {
  color: green;
  font-weight: bold;
}
</style>
```

## Chat Component

Example chat interface component:

```vue
<template>
  <div class="chat-container">
    <div class="messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.role]"
      >
        <strong>{{ msg.role }}:</strong>
        <p>{{ msg.content }}</p>
        <small>{{ formatTime(msg.timestamp) }}</small>
      </div>
    </div>

    <div class="composer">
      <textarea
        v-model="newMessage"
        placeholder="Type your message..."
        @keydown.enter.ctrl="sendMessage"
      ></textarea>
      
      <button 
        @click="sendMessage"
        :disabled="isLoading || !hasApiCredentials"
      >
        {{ isLoading ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <div v-if="error" class="error">
      Error: {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChat } from '@/composables'
import { useSettings } from '@/composables'

const {
  messages,
  isLoading,
  error,
  sendMessage: storeSendMessage,
  loadChatHistory,
} = useChat()

const { hasApiCredentials } = useSettings()

const newMessage = ref('')

onMounted(() => {
  loadChatHistory()
})

async function sendMessage() {
  if (!newMessage.value.trim()) return

  const message = newMessage.value
  newMessage.value = ''

  try {
    await storeSendMessage(message)
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
}

.message {
  margin: 12px 0;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background: #e3f2fd;
  text-align: right;
}

.message.assistant {
  background: #f5f5f5;
}

.message strong {
  display: block;
  margin-bottom: 4px;
  color: #333;
}

.message small {
  display: block;
  margin-top: 4px;
  color: #999;
  font-size: 0.8em;
}

.composer {
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  resize: none;
  height: 60px;
}

button {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #d32f2f;
  padding: 8px;
  background: #ffebee;
  border-radius: 4px;
}
</style>
```

## Workspace Component

Example workspace with code editor tabs:

```vue
<template>
  <div class="workspace">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
        <span v-if="unsavedChanges[tab.id]" class="unsaved">*</span>
      </button>
    </div>

    <div class="editor">
      <textarea
        v-model="currentArtifact"
        @input="updateArtifact(activeTab, $event.target.value)"
        :placeholder="`Enter ${activeTab} code...`"
      ></textarea>
    </div>

    <div class="controls">
      <button 
        @click="saveTemplateDialog = true"
        :disabled="!hasUnsavedChanges"
      >
        Save as Template
      </button>
      <button @click="resetToBaseline">Reset Changes</button>
    </div>

    <!-- Save Template Dialog -->
    <div v-if="saveTemplateDialog" class="dialog">
      <div class="dialog-content">
        <h3>Save as Template</h3>
        <input
          v-model="templateName"
          placeholder="Template name"
        />
        <textarea
          v-model="templateDescription"
          placeholder="Description (optional)"
        ></textarea>
        <div class="dialog-actions">
          <button @click="confirmSaveTemplate">Save</button>
          <button @click="saveTemplateDialog = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkspace } from '@/composables'
import { WORKSPACE_TABS } from '@/utils/workspace'

const {
  artifacts,
  activeTab,
  currentArtifact,
  unsavedChanges,
  hasUnsavedChanges,
  updateArtifact,
  setActiveTab,
  resetToBaseline,
  saveTemplate,
  loadTemplates,
} = useWorkspace()

const tabs = ref(WORKSPACE_TABS)
const saveTemplateDialog = ref(false)
const templateName = ref('')
const templateDescription = ref('')

onMounted(() => {
  loadTemplates()
})

function confirmSaveTemplate() {
  if (!templateName.value.trim()) {
    alert('Please enter a template name')
    return
  }

  saveTemplate(templateName.value, undefined, {
    description: templateDescription.value,
  })

  templateName.value = ''
  templateDescription.value = ''
  saveTemplateDialog.value = false

  alert('Template saved!')
}
</script>

<style scoped>
.workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #ddd;
  padding: 0 8px;
}

.tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  position: relative;
}

.tab.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: bold;
}

.unsaved {
  color: #ff9800;
  margin-left: 4px;
}

.editor {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

textarea {
  width: 100%;
  height: 100%;
  padding: 12px;
  border: none;
  font-family: monospace;
  font-size: 14px;
  resize: none;
}

.controls {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 400px;
}

.dialog input,
.dialog textarea {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
```

## Theme Toggle

Simple theme toggle button:

```vue
<template>
  <button class="theme-toggle" @click="toggleTheme" :aria-label="ariaLabel">
    {{ isDarkMode ? '🌙' : '☀️' }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables'

const { toggleTheme, isDarkMode } = useTheme()

const ariaLabel = computed(() =>
  isDarkMode.value ? 'Switch to light mode' : 'Switch to dark mode'
)
</script>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: #f5f5f5;
}
</style>
```

## Complete App Example

Here's a complete example app combining all stores:

```vue
<template>
  <div :class="['app', { dark: isDarkMode }]">
    <header>
      <h1>MVU Chat</h1>
      <div class="header-actions">
        <button @click="toggleSettings">⚙️ Settings</button>
        <button @click="toggleTheme">{{ isDarkMode ? '🌙' : '☀️' }}</button>
      </div>
    </header>

    <main>
      <div class="layout">
        <!-- Workspace -->
        <section class="workspace-section">
          <WorkspaceComponent />
        </section>

        <!-- Chat -->
        <section class="chat-section">
          <ChatComponent />
        </section>
      </div>
    </main>

    <!-- Settings Modal -->
    <div v-if="isSettingsOpen" class="modal-overlay" @click="toggleSettings">
      <div class="modal" @click.stop>
        <button class="close" @click="toggleSettings">×</button>
        <SettingsComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme, useUI, initializeAllStores } from '@/composables'
import WorkspaceComponent from './components/WorkspaceComponent.vue'
import ChatComponent from './components/ChatComponent.vue'
import SettingsComponent from './components/SettingsComponent.vue'

const { isDarkMode, toggleTheme, initializeTheme } = useTheme()
const { isSettingsOpen, toggleSettings } = useUI()

onMounted(() => {
  // Initialize all stores from localStorage
  initializeAllStores()
  initializeTheme()
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  color: #000;
}

.app.dark {
  background: #1e1e1e;
  color: #fff;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.app.dark header {
  background: #2d2d2d;
  border-bottom-color: #444;
}

main {
  flex: 1;
  overflow: hidden;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .chat-section {
    display: none;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.app.dark .modal {
  background: #2d2d2d;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>
```

## More Information

For more details on using these composables, see:
- [README.md](./README.md) - Store documentation
- [SETUP.md](./SETUP.md) - Setup instructions
- Individual store files for full API reference
