# Store Setup Guide

This guide explains how to set up and use the Pinia stores in your Vue 3 application.

## Prerequisites

- Vue 3.5+
- Pinia 2.2+
- TypeScript (recommended)

## Setup Steps

### 1. Install Dependencies

The package.json has been updated with required dependencies:

```bash
cd mvu-generator
npm install
```

Required packages:
- `pinia@^2.2.6` - State management
- `vue@^3.5.12` - Vue framework
- `@vueuse/core@^11.1.0` - Vue composition utilities

### 2. Configure Pinia in main.ts

Create or update `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createPersistencePlugin } from '@/composables/plugins/persistencePlugin'

const app = createApp(App)
const pinia = createPinia()

// Add persistence plugin
pinia.use(createPersistencePlugin())

app.use(pinia)
app.mount('#app')

// Initialize stores on app start
import { initializeAllStores } from '@/composables'
initializeAllStores()
```

### 3. Use in Components

```vue
<template>
  <div>
    <button @click="toggleTheme">
      {{ isDarkMode ? '🌙' : '☀️' }}
    </button>
    
    <textarea v-model="workspace.currentArtifact"></textarea>
    
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { useTheme, useWorkspace, useChat } from '@/composables'

const { toggleTheme, isDarkMode } = useTheme()
const { workspace } = useWorkspace()
const { sendMessage } = useChat()
</script>
```

## File Structure

```
src/
├── composables/                    # All stores and composables
│   ├── stores/                    # Pinia store definitions
│   │   ├── settings.ts
│   │   ├── chat.ts
│   │   ├── workspace.ts
│   │   ├── ui.ts
│   │   └── __tests__/
│   ├── utils/                     # Storage helpers
│   │   ├── storage.ts
│   │   └── __tests__/
│   ├── plugins/
│   │   └── persistencePlugin.ts
│   ├── useWorkspace.ts            # Composables
│   ├── useChat.ts
│   ├── useSettings.ts
│   ├── useTheme.ts
│   ├── useUI.ts
│   ├── initializeStores.ts
│   ├── index.ts
│   └── README.md
├── services/
│   ├── openai.ts                  # OpenAI API service
│   └── openai.js                  # Legacy JS version
├── types/
│   └── store.ts                   # TypeScript types
└── utils/
    └── workspace.js               # Artifact utilities

mvu-generator/
├── src/                           # Vue app
│   ├── main.ts                   # App entry point
│   ├── App.vue
│   ├── components/               # Vue components
│   └── ...
├── package.json                   # Updated with Vue 3, Pinia
├── tsconfig.json                  # TypeScript config
├── vitest.config.ts               # Test runner config
├── vite.config.js                 # Updated for Vue
└── ...
```

## Key Concepts

### Stores

Each store manages a specific domain:

- **Settings** - API configuration
- **Chat** - Conversation state
- **Workspace** - Code artifacts and templates
- **UI** - Theme, sheets, keyboard

### Composables

High-level API for components:

```typescript
const { workspace } = useWorkspace()
const { chat } = useChat()
const { settings } = useSettings()
const { theme } = useTheme()
const { ui } = useUI()
```

### Persistence

All state automatically persists to localStorage under the `mvuChat` namespace:

```
mvuChat:apiSettings       → Settings
mvuChat:chatHistory       → Chat messages
mvuChat:codeTemplates     → Saved templates
mvuChat:theme             → Theme preference
```

API keys are automatically encoded before storage.

### Type Safety

All stores are fully typed:

```typescript
import type {
  Settings,
  ChatMessage,
  CodeTemplate,
  UIState,
  GlobalAppState,
} from '@/types/store'
```

## Testing

Run tests:

```bash
npm run test
```

Tests use Vitest with jsdom environment and include:
- Storage utility tests
- Settings store tests
- Chat store tests
- Workspace store tests
- UI store tests

## Initialization Flow

When your app starts:

1. **Create Pinia instance** with persistence plugin
2. **Mount Vue app** with Pinia
3. **Call `initializeAllStores()`** to load persisted data:
   - Settings from localStorage
   - Chat history from localStorage
   - Saved templates from localStorage
   - Theme from localStorage or system preference

```typescript
// In main.ts
const pinia = createPinia()
pinia.use(createPersistencePlugin())
app.use(pinia)

// After mounting
initializeAllStores()
```

## Common Patterns

### Theme Switching

```typescript
const { toggleTheme, isDarkMode } = useTheme()

toggleTheme() // Switch between light and dark
```

### Sending Chat Messages

```typescript
const { sendMessage, messages, isLoading } = useChat()

try {
  await sendMessage('Hello, generate a component')
} catch (error) {
  console.error(error)
}
```

### Managing Artifacts

```typescript
const { updateArtifact, saveTemplate, currentArtifact } = useWorkspace()

updateArtifact('html', '<div>New HTML</div>')
saveTemplate('My Template')
```

### API Configuration

```typescript
const { updateApiKey, hasApiCredentials } = useSettings()

updateApiKey('sk-...')

if (hasApiCredentials) {
  // Can now make API calls
}
```

## Troubleshooting

### Store not persisting

Ensure `initializeAllStores()` is called after mounting:

```typescript
app.mount('#app')
initializeAllStores()
```

### localStorage errors

The stores gracefully handle missing localStorage. Check console for `[storage]` warnings.

### API key not working

Verify:
1. API key is set via `updateApiKey()`
2. Provider type matches your API (`openai`, `azure`, etc.)
3. Base URL is correct for your provider

### Messages not appearing

Check:
1. Chat history loaded: `useChat().loadChatHistory()`
2. Messages added: `useChat().addMessage(...)`
3. localStorage keys not being cleared unexpectedly

## Next Steps

1. ✅ Stores and composables are ready
2. ⏳ Create Vue components (EditorPanel, ChatSheet, etc.)
3. ⏳ Add more composables for specific features (useKeyboardInset, etc.)
4. ⏳ Setup routing with vue-router
5. ⏳ Add more comprehensive tests

## References

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript in Vue](https://vuejs.org/guide/typescript/overview.html)
