# Composables & Stores

This directory contains all Pinia stores and composables for global state management in the MVU Chat application.

## Structure

```
composables/
├── stores/              # Pinia store definitions
│   ├── settings.ts     # API configuration store
│   ├── chat.ts         # Chat messages and streaming
│   ├── workspace.ts    # Code artifacts and templates
│   ├── ui.ts           # UI state (theme, sheets, keyboard)
│   ├── index.ts        # Store exports
│   └── __tests__/      # Store unit tests
├── utils/
│   ├── storage.ts      # localStorage helpers (ported from storage.js)
│   └── __tests__/      # Storage utility tests
├── plugins/
│   └── persistencePlugin.ts  # Pinia persistence plugin
├── useWorkspace.ts     # Workspace composable
├── useChat.ts          # Chat composable
├── useSettings.ts      # Settings composable
├── useTheme.ts         # Theme composable
├── useUI.ts            # UI composable
├── initializeStores.ts # Store initialization
├── index.ts            # Main exports
└── README.md           # This file
```

## Stores

### Settings Store (`useSettingsStore`)

Manages API configuration and provider settings.

**State:**
- `apiKey` - Encoded OpenAI/Azure API key
- `providerType` - Provider type ('openai', 'azure', 'openrouter')
- `baseUrl` - API base URL
- `defaultModel` - Default model to use
- `headers` - Custom headers for API requests

**Computed:**
- `hasApiCredentials` - Whether API key is set

**Actions:**
- `loadSettings()` - Load from localStorage
- `updateSettings(patch)` - Update settings
- `updateApiKey(key)` - Update just the API key
- `clearSettings()` - Clear all settings
- `resetToDefaults()` - Reset to factory defaults
- `getState()` - Get state snapshot

**Persistence:**
- Auto-persists to localStorage with namespace `mvuChat:apiSettings`
- API key is automatically encoded before storage

### Chat Store (`useChatStore`)

Manages conversation messages and streaming state.

**State:**
- `messages[]` - Array of chat messages
- `isLoading` - Whether waiting for API response
- `error` - Current error message if any

**Computed:**
- `latestAssistantMessage` - Latest message from assistant
- `latestMessage` - Latest message from any role

**Actions:**
- `addMessage(msg)` - Add message to chat
- `updateMessage(id, patch)` - Update existing message
- `sendMessage(text, context)` - Send message to OpenAI API
- `loadChatHistory()` - Load from localStorage
- `clearChatHistory()` - Clear all messages
- `abortCurrentRequest()` - Cancel in-flight API request
- `getState()` - Get state snapshot

**Persistence:**
- Auto-persists to localStorage with namespace `mvuChat:chatHistory`
- Integrates with OpenAI service for API calls
- Supports streaming and abort signals

### Workspace Store (`useWorkspaceStore`)

Manages code artifacts and saved templates.

**State:**
- `artifacts` - Current code artifacts (html, css, javascript, yaml, script, regex)
- `baseline` - Original/saved artifacts for comparison
- `activeTab` - Currently active editor tab
- `templates[]` - Saved code templates

**Computed:**
- `currentArtifact` - Content of current active tab
- `unsavedChanges` - Object showing which artifacts have unsaved changes
- `hasUnsavedChanges` - Boolean if any artifact has changes

**Actions:**
- `updateArtifact(tabId, content)` - Update single artifact
- `updateArtifacts(patch)` - Update multiple artifacts
- `setActiveTab(tabId)` - Set active editor tab
- `setBaseline(baseline)` - Set baseline for comparison
- `resetToBaseline()` - Revert to baseline
- `extractArtifacts(content)` - Extract artifacts from content
- `saveTemplate(name, artifacts, metadata)` - Save as template
- `loadTemplate(name)` - Load template
- `loadTemplates()` - Load all templates from storage
- `deleteTemplate(name)` - Delete template
- `renameTemplate(oldName, newName)` - Rename template
- `generateExports()` - Get export payload
- `clearAll()` - Clear all artifacts and templates
- `getState()` - Get state snapshot

**Persistence:**
- Templates auto-persist to localStorage with namespace `mvuChat:codeTemplates`

### UI Store (`useUIStore`)

Manages theme, sheet visibility, and keyboard state.

**State:**
- `theme` - 'light' or 'dark'
- `isChatSheetOpen` - Bottom sheet visibility
- `isResultSheetOpen` - Results sheet visibility
- `isDrawerOpen` - Navigation drawer visibility
- `isSettingsOpen` - Settings sheet visibility
- `keyboardInset` - Virtual keyboard height (mobile)
- `sheetDragState` - Current sheet drag state
- `sheetSnapHeight` - Sheet snap position

**Computed:**
- `isDarkMode` - Whether theme is dark

**Actions:**
- `initializeTheme()` - Initialize from storage/system preference
- `toggleTheme()` - Toggle light/dark
- `setTheme(theme)` - Set theme explicitly
- `openChatSheet()` / `closeChatSheet()` / `toggleChatSheet()`
- `openResultSheet()` / `closeResultSheet()` / `toggleResultSheet()`
- `openDrawer()` / `closeDrawer()` / `toggleDrawer()`
- `openSettings()` / `closeSettings()` / `toggleSettings()`
- `updateKeyboardInset(height)` - Update keyboard height
- `setSheetDragState(state)` - Update drag state
- `setSheetSnapHeight(height)` - Set snap position
- `closeAllSheets()` - Close all open sheets
- `getState()` - Get state snapshot

**Persistence:**
- Theme persists to localStorage with namespace `mvuChat:theme`
- Applies theme to `<html>` element on change

## High-Level Composables

Each store has a corresponding composable that provides a simplified API:

```typescript
// Instead of:
import { useSettingsStore } from '@/composables/stores/settings'
const store = useSettingsStore()

// Use:
import { useSettings } from '@/composables'
const { apiKey, hasApiCredentials, updateApiKey } = useSettings()
```

Available composables:
- `useWorkspace()` - Workspace management
- `useChat()` - Chat interface
- `useSettings()` - Settings management
- `useTheme()` - Theme switching
- `useUI()` - UI state management

## Storage Utilities

Located in `composables/utils/storage.ts`, these provide localStorage access:

```typescript
import { useStorageNamespace, encodeSecret, decodeSecret } from '@/composables/utils/storage'

// Namespaced storage
const storage = useStorageNamespace('myapp')
storage.write('key', { data: 'value' })
const data = storage.read('key', {})

// Secret encoding (for API keys, etc)
const encoded = encodeSecret('my-secret')
const decoded = decodeSecret(encoded)
```

## Initialization

On app startup, initialize all stores:

```typescript
import { initializeAllStores } from '@/composables'

// In main.ts or app setup
initializeAllStores()
```

This will:
1. Load persisted settings from localStorage
2. Load chat history
3. Load saved templates
4. Initialize theme from storage or system preference

## Type Safety

All stores are fully typed with TypeScript. Global types available in `src/types/store.ts`:

```typescript
import type {
  GlobalAppState,
  StoreEvents,
  ChatMessage,
  Settings,
  CodeTemplate,
  UIState,
} from '@/types/store'
```

## Testing

Run tests with:

```bash
npm run test
```

Tests are located in `__tests__/` directories within each module and cover:
- Storage utility encode/decode
- Settings persistence and updates
- Chat message management and history
- Workspace artifact management and templates
- UI state and theme persistence

## Local Storage Keys

All data is stored under the `mvuChat` namespace:

- `mvuChat:apiSettings` - API configuration
- `mvuChat:chatHistory` - Chat messages
- `mvuChat:codeTemplates` - Saved templates
- `mvuChat:theme` - Theme preference

## Best Practices

1. **Use composables** - Always use the high-level composables (`useSettings()`, `useChat()`, etc.) in components
2. **Load on startup** - Call `initializeAllStores()` during app initialization
3. **Reactive** - All state is reactive with Vue 3 - changes automatically trigger re-renders
4. **Persistence** - No manual localStorage calls needed - stores handle it automatically
5. **Type safety** - Always import and use TypeScript types for better IDE support

## Example Usage

```typescript
import { useWorkspace, useChat, useSettings } from '@/composables'

export default {
  setup() {
    const workspace = useWorkspace()
    const chat = useChat()
    const settings = useSettings()

    // Update artifact
    workspace.updateArtifact('html', '<div>Hello</div>')

    // Send chat message
    chat.sendMessage('Generate a button component')

    // Update API key
    settings.updateApiKey('sk-...')

    return {
      workspace,
      chat,
      settings,
    }
  }
}
```
