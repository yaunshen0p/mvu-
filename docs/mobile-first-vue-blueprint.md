# Vue 3 Mobile-First Refactor Blueprint

## 📋 Table of Contents

- [Context Summary](#context-summary)
- [Guiding Principles](#guiding-principles)
- [Vue SFC File Tree](#vue-sfc-file-tree)
- [Component Responsibilities](#component-responsibilities)
- [Interaction Map](#interaction-map)
- [Pinia Store Design](#pinia-store-design)
- [Cross-Component Communication Patterns](#cross-component-communication-patterns)
- [Virtual Keyboard & Mobile Handling](#virtual-keyboard--mobile-handling)
- [Global Theming](#global-theming)
- [External Libraries](#external-libraries)
- [Implementation Priority](#implementation-priority)

---

## Context Summary

**ranbo-play** is an MVU (MagVarUpdate) state bar generator for TavernAI / SillyTavern users, enabling **Vibe Coding**: simultaneous code editing and AI collaboration. The AI reads the live workspace state (HTML, CSS, JS, YAML variables) and provides real-time suggestions.

### Current State (React)
- Desktop-first layout with split panels: variable editor, code editor, chat, preview
- Real-time YAML parsing and Monaco editor integration
- AI integration via OpenAI API with context awareness
- localStorage-based persistence

### Vue 3 Refactor Goals (Scheme B - Mobile-First)
1. **Mobile-first responsive design**: Optimized for phones and tablets first
2. **Bottom sheet layout**: Chat and results as dismissible bottom sheets, not always-visible side panels
3. **Keyboard resilience**: Handle virtual keyboard insets gracefully on mobile
4. **Touch-friendly interactions**: Drawer gestures, sheet handles, accessible taps
5. **Component modularity**: Composable, reusable, predictable state flow
6. **Performance**: Lazy-loaded editors, minimal re-renders, smooth animations

---

## Guiding Principles

### 1. **Mobile-First Hierarchy**
- Small screens are the constraint, not an afterthought.
- Design assumes single-column layout with overlays; desktop gets multi-column as enhancement.
- Touch targets minimum 44×44 px (iOS) or 48×48 px (Android).

### 2. **Minimal Visible Surface**
- Workspace tabs + editor are primary; results, chat, settings are bottom sheets or modals.
- Navigation drawer toggles via hamburger, appears as overlay on mobile.
- Reduces cognitive load and maximizes editor real estate.

### 3. **Pinia for Single Source of Truth**
- All shared state lives in Pinia stores, never in component props chains.
- Composables expose reactive shortcuts (e.g., `useChat()`) without duplicating store access.
- localStorage sync is implicit (e.g., `ui.theme` auto-persists changes).

### 4. **Composables Over Props Drilling**
- Prefer `useWorkspace()`, `useChat()` over passing props 5 levels deep.
- Composables are thin wrappers around store getters/actions.

### 5. **Unified Artifact Flow**
- Single source of code artifacts in `workspace.currentArtifact`.
- All editors (Monaco, preview) bind to this; sync bidirectional.
- Chat/AI updates feed back into `workspace.artifacts`.

### 6. **Keyboard-Aware Layout**
- `useKeyboardInset()` emits virtual keyboard height; sheets adjust accordingly.
- No fixed bottom positioning without offset awareness.
- Chat composer sticks to keyboard on mobile.

### 7. **Accessible Theming**
- CSS variables on `<html>` root; no inline styles.
- Light/dark toggles update both variables and localStorage.
- Respects `prefers-color-scheme` on first load.

---

## Vue SFC File Tree

```
src/
  main.ts
  App.vue
  router/
    index.ts              (placeholder for future routing)
  assets/
    icons/
      (SVG icons or icon font references)
  styles/
    tokens.css            (design tokens: spacing, font sizes, radii)
    themes.css            (CSS variables: --color-primary, --bg-base, etc.)
  components/
    layout/
      AppLayout.vue       (main container: handles sheet z-index, keyboard offset)
      NavigationDrawer.vue
      DrawerActionList.vue
      BackdropLayer.vue
    workspace/
      WorkspaceTabs.vue   (tabs: editor, world book, HTML, CSS, JS)
      WorkspaceHeader.vue (header: artifact name, sync status)
      EditorPanel.vue     (wrapper: dispatches tab selection → store)
      PreviewPanel.vue    (iframe preview; syncs theme, artifact)
      MonacoEditor.vue    (wrapper: lazy-loaded Monaco instance)
      PreviewSandbox.vue  (iframe component: isolated preview rendering)
    results/
      ResultSheet.vue     (bottom sheet container)
      ResultSection.vue   (collapsible sections: tavern world book, regex, exports)
    chat/
      ChatSheet.vue       (bottom sheet container)
      ChatHeader.vue      (sheet handle + title + close button)
      ChatMessageList.vue (virtualized list of messages)
      ChatMessageBubble.vue
      ChatComposer.vue    (input field + send + API status)
    settings/
      SettingsModal.vue   (modal or sheet; API key, model selection)
      ProviderSelect.vue  (dropdown: OpenAI, custom base URL, etc.)
      ApiKeyField.vue     (masked input, save to settings store)
    common/
      ThemeToggle.vue     (button: light/dark icon)
      IconButton.vue      (reusable icon button component)
      SheetHandle.vue     (drag handle for bottom sheet)
  composables/
    useWorkspace.ts       (exposes: currentArtifact, updateArtifact, artifacts, etc.)
    useChat.ts            (exposes: messages, send(), isLoading, error)
    useTheme.ts           (exposes: isDark, toggle(), setTheme())
    useKeyboardInset.ts   (exposes: insetBottom, isKeyboardVisible)
    useBottomSheet.ts     (exposes: isOpen, height, position, open/close/dismiss)
  stores/
    index.ts              (export all stores)
    workspace.ts          (Pinia store: artifacts, currentArtifact, metadata)
    chat.ts               (Pinia store: messages, settings, isLoading)
    settings.ts           (Pinia store: apiKey, model, baseUrl, providers)
    ui.ts                 (Pinia store: theme, drawer open/close, sheet heights)
  services/
    openai.ts             (API wrapper: chat, completion, error handling)
  utils/
    prompts.ts            (system prompts, context assembly)
    workspace.ts          (artifact export generators: HTML, CSS, JS, YAML, regex)
    validators.ts         (YAML validation, artifact schema checks)
  env.d.ts                (TypeScript declarations for Vite env)
  vite-env.d.ts           (auto-generated by Vite)

public/
  index.html              (entry HTML)

package.json
tsconfig.json
vite.config.ts
```

---

## Component Responsibilities

### Layout Layer

#### **AppLayout.vue**
- **Role**: Root layout container; orchestrates viewport, safe-area insets, bottom sheets z-order.
- **Props**: None (reads from stores).
- **State**: Manages local keyboard offset (from `useKeyboardInset()`).
- **Emits**: None (drives UI via store mutations).
- **Responsibilities**:
  - Render header (logo, menu button, theme toggle, settings).
  - Stack workspace tabs + editor/preview below header.
  - Overlay navigation drawer (full-height on left, with backdrop).
  - Stack result sheet, chat sheet, and settings modal on top, respecting z-index.
  - Pass keyboard inset to sheet components for safe positioning.

#### **NavigationDrawer.vue**
- **Role**: Slide-in menu showing: load sample, export, view variables, docs link.
- **Derived State**: `ui.isDrawerOpen`, `ui.drawerItems`.
- **Behaviors**:
  - Toggle on hamburger click (via store action `ui.toggleDrawer()`).
  - Click item → navigate or trigger action → close drawer.
  - Swipe or backdrop click → close.

#### **DrawerActionList.vue**
- **Role**: List of clickable actions inside drawer.
- **Behaviors**: Expose `@action` event; parent controls navigation/mutation.

#### **BackdropLayer.vue**
- **Role**: Semi-transparent overlay behind drawer/modal; swallows clicks.
- **Behaviors**: Click → close drawer/modal (delegates to parent or store action).

---

### Workspace Layer

#### **WorkspaceTabs.vue**
- **Role**: Tab bar showing editor, world book, HTML, CSS, JS.
- **State**: Bound to `workspace.activeTab` (store getter).
- **Behaviors**:
  - Click tab → `workspace.setActiveTab(tabName)`.
  - Show content for active tab (delegated to EditorPanel).

#### **WorkspaceHeader.vue**
- **Role**: Display artifact name, sync status icon, action buttons (save, export, new).
- **Behaviors**:
  - Show artifact name or placeholder.
  - Sync icon pulses if `workspace.isSyncing`.
  - Click "New" → `workspace.createArtifact()`.
  - Click "Save" → trigger download or localStorage persist.

#### **EditorPanel.vue**
- **Role**: Wrapper; switches between content views based on `workspace.activeTab`.
- **Sub-components**: MonacoEditor (for HTML/CSS/JS/YAML tabs), WorkspaceTabs.
- **Behaviors**:
  - Show MonacoEditor if tab is editor-type.
  - Show WorldBook template if tab is "world book".
  - Sync content to `workspace.currentArtifact.code[tab]`.

#### **MonacoEditor.vue**
- **Role**: Lazy-loaded Monaco Editor instance.
- **Props**: `tab` (html, css, js, yaml), `content` (code string), `readOnly` (bool).
- **Emits**: `@update:content` when user types (debounced).
- **Lifecycle**:
  - Lazy-load Monaco on mount (via dynamic import or loader from `@monaco-editor/loader`).
  - Destroy instance on unmount.
  - Syntax highlighting per language.

#### **PreviewPanel.vue**
- **Role**: Container for iframe preview; manages sync of artifact + theme.
- **Responsibilities**:
  - Communicate with PreviewSandbox via `postMessage`.
  - Send `currentArtifact` and theme CSS vars on change.
  - Receive resize/load events from iframe.

#### **PreviewSandbox.vue**
- **Role**: iframe component; isolated preview environment.
- **Responsibilities**:
  - Render HTML + CSS + JS artifact inside iframe.
  - Listen for `postMessage` updates from parent (artifact, theme vars).
  - Send `postMessage` back to parent on load/error.
  - Inject `<style>` tags for CSS variables and artifact CSS.

---

### Results Layer

#### **ResultSheet.vue**
- **Role**: Bottom sheet showing exported code, YAML, regex templates.
- **State**: Bound to `ui.isResultSheetOpen`, `workspace.exportedCode`.
- **Responsibilities**:
  - Show sections: Tavern World Book YAML, Regex, HTML/CSS/JS exports.
  - Each section has copy button.
  - Handle sheet height and scrolling.
  - Close button or backdrop swipe to dismiss.

#### **ResultSection.vue**
- **Role**: Collapsible section inside result sheet (e.g., "Tavern World Book").
- **Props**: `title`, `content`, `language` (for syntax highlighting).
- **Emits**: `@copy` when copy button clicked.

---

### Chat Layer

#### **ChatSheet.vue**
- **Role**: Bottom sheet container for chat; manages height, keyboard offset, animations.
- **State**: Bound to `ui.isChatSheetOpen`, `ui.chatSheetHeight`, `useKeyboardInset().insetBottom`.
- **Responsibilities**:
  - Render ChatHeader, ChatMessageList, ChatComposer vertically.
  - Adjust bottom position based on keyboard inset.
  - On drag-to-close (below threshold) → dismiss sheet.
  - Support snap heights: peek (200px), half (50vh), full screen.

#### **ChatHeader.vue**
- **Role**: Drag handle + title + close icon.
- **Behaviors**:
  - SheetHandle for drag gestures.
  - Close icon → `ui.closeChatSheet()`.

#### **ChatMessageList.vue**
- **Role**: Virtualized or scrollable list of chat messages.
- **State**: Bound to `chat.messages`.
- **Behaviors**:
  - Auto-scroll to latest message when new message arrives.
  - Render ChatMessageBubble for each message.

#### **ChatMessageBubble.vue**
- **Role**: Single chat message (user or AI).
- **Props**: `role` (user/assistant), `content`, `timestamp`.
- **Styling**: Different background color/alignment for user vs. AI.

#### **ChatComposer.vue**
- **Role**: Input field + send button + API status indicator.
- **State**: Local text input, bound to `chat.isLoading`, `settings.apiKey`.
- **Behaviors**:
  - Type message → update local state.
  - Press Enter or click send → `chat.send(message)` (action).
  - Show loading spinner while `chat.isLoading`.
  - Auto-expand textarea on multiline.
  - Position fixed to keyboard on mobile (via keyboard inset).

---

### Settings Layer

#### **SettingsModal.vue**
- **Role**: Modal or sheet for API configuration.
- **State**: Bound to `settings.apiKey`, `settings.model`, `settings.baseUrl`, `settings.provider`.
- **Responsibilities**:
  - Show form: API Key field, Model dropdown, Base URL, Provider select.
  - Save button → `settings.updateSettings(...)`.
  - Close button or backdrop → `ui.closeSettings()`.

#### **ProviderSelect.vue**
- **Role**: Dropdown to choose provider (OpenAI, Azure, custom).
- **Behaviors**: On select → populate `baseUrl` field with provider preset.

#### **ApiKeyField.vue**
- **Role**: Masked password input for API key.
- **Behaviors**: Toggle visibility icon; auto-save to settings store (debounced).

---

### Common Layer

#### **ThemeToggle.vue**
- **Role**: Sun/moon icon button to switch light/dark.
- **Behaviors**: Click → `useTheme().toggle()` → updates CSS vars and localStorage.

#### **IconButton.vue**
- **Role**: Reusable icon button with configurable size, color, disabled state.
- **Props**: `icon`, `size` (sm|md|lg), `variant` (primary|secondary|ghost), `disabled`, `@click`.

#### **SheetHandle.vue**
- **Role**: Visual drag handle for bottom sheet.
- **Styling**: Horizontal bar (white/dark mode aware).
- **Behaviors**: No direct interaction; visual affordance only (gesture handled by parent).

---

## Interaction Map

### User Flow 1: Edit Code & Preview

```
User types in MonacoEditor
  ↓
Editor emits @update:content (debounced)
  ↓
EditorPanel → workspace.updateArtifact(code)
  ↓
Pinia store workspace.currentArtifact updated
  ↓
PreviewPanel watches workspace.currentArtifact
  ↓
PreviewPanel sends postMessage { artifact, theme } to iframe
  ↓
PreviewSandbox receives postMessage
  ↓
PreviewSandbox renders HTML + CSS + JS inside iframe
```

### User Flow 2: Chat with AI

```
User types in ChatComposer
  ↓
ChatComposer emit / local state update
  ↓
User clicks send or presses Enter
  ↓
ChatComposer → chat.send(userMessage) (Pinia action)
  ↓
chat store action:
  1. Add userMessage to messages list
  2. Set isLoading = true
  3. Call openai.chat() with currentArtifact as context
  ↓
OpenAI service sends request with workspace context
  ↓
OpenAI responds with assistant message
  ↓
chat store updates:
  1. Add assistantMessage to messages
  2. If message contains code suggestion → extract + propose update
  3. Set isLoading = false
  ↓
ChatMessageList watches chat.messages
  ↓
ChatMessageList auto-scrolls to latest message
  ↓
ChatMessageBubble renders assistant message
  ↓
(Optional) User clicks "Apply" on code suggestion
  ↓
workspace.updateArtifact(suggestedCode)
```

### User Flow 3: Toggle Bottom Sheet

```
User taps "Results" button in header / or "Chat" icon
  ↓
Header button emits action or click handler
  ↓
AppLayout component or store action: ui.openChatSheet() / ui.openResultSheet()
  ↓
ui.isChatSheetOpen or ui.isResultSheetOpen = true
  ↓
AppLayout v-if watches ui.isChatSheetOpen
  ↓
ChatSheet mounts and animates up
  ↓
ChatSheet height adjusts based on keyboard inset
  ↓
User drags handle down below threshold or clicks close
  ↓
SheetHandle emits close event / ChatSheet → ui.closeChatSheet()
  ↓
Sheet animates down and unmounts
```

### User Flow 4: Export & Copy

```
User clicks "Export" in header or result sheet button
  ↓
workspace.generateExports() action
  ↓
Pinia store calls utils/workspace.ts generators:
  - generateTavernWorldBook(artifact)
  - generateRegex(artifact)
  - generateHTML/CSS/JS(artifact)
  ↓
Results written to workspace.exportedCode
  ↓
ResultSheet component watches workspace.exportedCode
  ↓
ResultSection instances render with syntax highlighting
  ↓
User clicks copy button on section
  ↓
ResultSection → clipboard.writeText(content)
  ↓
Toast notification (or simple feedback)
```

### User Flow 5: Theme Toggle

```
User clicks theme toggle icon (sun/moon)
  ↓
ThemeToggle → useTheme().toggle()
  ↓
useTheme() updates ui.theme (Pinia store action)
  ↓
ui.theme value persists to localStorage (auto)
  ↓
AppLayout watches ui.theme
  ↓
CSS variables on <html> updated (via :root { --color-bg: ... })
  ↓
All components reactively reflect new colors
```

---

## Pinia Store Design

### Store: `workspace.ts`

**State:**
```typescript
interface WorkspaceState {
  artifacts: Artifact[];
  currentArtifactId: string;
  activeTab: 'editor' | 'worldbook' | 'html' | 'css' | 'js' | 'yaml';
  exportedCode: ExportedCode;
  isSyncing: boolean;
  lastError: string | null;
}

interface Artifact {
  id: string;
  name: string;
  code: {
    html: string;
    css: string;
    js: string;
    yaml: string;
  };
  createdAt: number;
  updatedAt: number;
  metadata: {
    description: string;
    tags: string[];
  };
}

interface ExportedCode {
  tavernWorldBook: string;
  regex: string;
  html: string;
  css: string;
  js: string;
}
```

**Getters:**
```typescript
currentArtifact: () => Artifact | null
hasUnsavedChanges: () => boolean
```

**Actions:**
```typescript
createArtifact(name: string): void
updateArtifact(code: Partial<Artifact['code']>): void
deleteArtifact(id: string): void
setActiveTab(tab: string): void
generateExports(): Promise<void>
loadFromLocalStorage(): void
persistToLocalStorage(): void
```

**localStorage Integration:**
- Key: `mvu-generator:workspace:artifacts` (JSON).
- Auto-persist on artifact update.
- Auto-load on app init.

---

### Store: `chat.ts`

**State:**
```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  contextSummary: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeBlock?: string; // extracted code from assistant response
}
```

**Getters:**
```typescript
lastMessage: () => ChatMessage | null
messageCount: () => number
```

**Actions:**
```typescript
send(message: string): Promise<void>
clearHistory(): void
loadFromLocalStorage(): void
persistToLocalStorage(): void
addMessage(message: ChatMessage): void
```

**Behavior:**
- On `send(message)`:
  1. Add user message to messages array.
  2. Set isLoading = true.
  3. Call `openai.chat()` with workspace context (from workspace store).
  4. Receive assistant response.
  5. Add assistant message to messages.
  6. Extract any code blocks and store in `codeBlock` field.
  7. Set isLoading = false.
- Auto-persist new messages to localStorage.

---

### Store: `settings.ts`

**State:**
```typescript
interface SettingsState {
  apiKey: string;
  model: string;
  baseUrl: string;
  provider: 'openai' | 'azure' | 'custom';
  providers: {
    openai: { baseUrl: string };
    azure: { baseUrl: string };
  };
}
```

**Getters:**
```typescript
apiKeyIsSaved: () => boolean
isConfigured: () => boolean
```

**Actions:**
```typescript
updateSettings(partial: Partial<SettingsState>): void
setProvider(provider: string): void
validateApiKey(): Promise<boolean>
loadFromLocalStorage(): void
persistToLocalStorage(): void
```

**localStorage Integration:**
- Key: `mvu-generator:settings:apiKey`, `mvu-generator:settings:config` (JSON).
- Auto-persist on update.

---

### Store: `ui.ts`

**State:**
```typescript
interface UIState {
  theme: 'light' | 'dark' | 'auto';
  isDrawerOpen: boolean;
  isChatSheetOpen: boolean;
  isResultSheetOpen: boolean;
  isSettingsOpen: boolean;
  chatSheetHeight: 'peek' | 'half' | 'full';
  resultSheetHeight: 'peek' | 'half' | 'full';
  drawerItems: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}
```

**Getters:**
```typescript
isDarkMode: () => boolean
isAnySheetOpen: () => boolean
```

**Actions:**
```typescript
setTheme(theme: string): void
toggleTheme(): void
toggleDrawer(): void
openChatSheet(): void
closeChatSheet(): void
openResultSheet(): void
closeResultSheet(): void
openSettings(): void
closeSettings(): void
setChatSheetHeight(height: string): void
```

**localStorage Integration:**
- Key: `mvu-generator:ui:theme`.
- Auto-persist theme changes.

---

## Cross-Component Communication Patterns

### Pattern 1: Store-Driven State (Preferred)

```vue
<!-- Component -->
<script setup>
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
</script>

<template>
  <div>{{ workspace.currentArtifact.name }}</div>
  <button @click="workspace.createArtifact('New')">New</button>
</template>
```

**Rationale**: Direct store access avoids prop drilling; reactive out of the box.

---

### Pattern 2: Composable Shortcuts

```typescript
// composables/useWorkspace.ts
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

export function useWorkspace() {
  const store = useWorkspaceStore()
  
  return {
    currentArtifact: computed(() => store.currentArtifact),
    updateCode: (code) => store.updateArtifact({ code }),
    artifacts: computed(() => store.artifacts),
  }
}
```

```vue
<!-- Component -->
<script setup>
import { useWorkspace } from '@/composables/useWorkspace'

const { currentArtifact, updateCode } = useWorkspace()
</script>

<template>
  <div>{{ currentArtifact.name }}</div>
  <button @click="() => updateCode({ html: '...' })">Update</button>
</template>
```

**Rationale**: Thin wrapper; provides consistent API; easier to test and reuse.

---

### Pattern 3: Emits for Local State

```vue
<!-- Component: MonacoEditor.vue -->
<script setup>
import { ref } from 'vue'

defineProps({
  content: String,
})

const emit = defineEmits(['update:content'])

const handleChange = (newContent) => {
  emit('update:content', newContent)
}
</script>
```

```vue
<!-- Parent: EditorPanel.vue -->
<template>
  <MonacoEditor 
    :content="workspace.currentArtifact.code.html" 
    @update:content="(code) => workspace.updateArtifact({ html: code })"
  />
</template>
```

**Rationale**: Encapsulates local editor state; parent drives mutations to store.

---

### Pattern 4: postMessage for Iframe Sync

**Parent (PreviewPanel.vue):**
```javascript
const previewIframe = ref(null)

const syncPreview = () => {
  previewIframe.value?.contentWindow.postMessage({
    type: 'UPDATE_ARTIFACT',
    payload: workspace.currentArtifact,
    theme: ui.theme,
  }, '*')
}

watch(() => workspace.currentArtifact, syncPreview, { deep: true })
watch(() => ui.theme, syncPreview)
```

**Child (PreviewSandbox.vue inside iframe):**
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_ARTIFACT') {
    const { payload, theme } = event.data
    applyTheme(theme)
    renderArtifact(payload)
  }
})
```

**Rationale**: iframe is isolated; `postMessage` is the only safe communication bridge.

---

### Pattern 5: Event Bus for Global Actions (Optional)

If needed for complex flows (e.g., toast notifications):

```typescript
// utils/eventBus.ts
import { reactive } from 'vue'

const eventBus = reactive({
  showToast: null,
  onShowToast: (callback) => { eventBus.showToast = callback },
})

export function useEventBus() {
  return {
    showToast: (message) => eventBus.showToast?.(message),
  }
}
```

**Rationale**: Minimal event bus for cross-cutting concerns; avoid overuse.

---

## Virtual Keyboard & Mobile Handling

### useKeyboardInset Composable

**Purpose**: Detect virtual keyboard visibility and emit safe inset offset.

```typescript
// composables/useKeyboardInset.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useKeyboardInset() {
  const insetBottom = ref(0)
  const isKeyboardVisible = computed(() => insetBottom.value > 0)
  
  const handleResize = () => {
    const newInsetBottom = window.innerHeight - window.visualViewport.height
    insetBottom.value = Math.max(0, newInsetBottom)
  }
  
  onMounted(() => {
    window.visualViewport.addEventListener('resize', handleResize)
    handleResize() // initial value
  })
  
  onUnmounted(() => {
    window.visualViewport.removeEventListener('resize', handleResize)
  })
  
  return {
    insetBottom: computed(() => insetBottom.value),
    isKeyboardVisible,
  }
}
```

### ChatSheet Mobile Layout

```vue
<template>
  <div
    class="chat-sheet"
    :style="{ 
      bottom: `${keyboardInset.insetBottom}px`,
      maxHeight: `calc(100vh - 50px - ${keyboardInset.insetBottom}px)`
    }"
  >
    <ChatHeader @close="closeChatSheet" />
    <ChatMessageList />
    <ChatComposer />
  </div>
</template>

<script setup>
import { useKeyboardInset } from '@/composables/useKeyboardInset'
import { useUIStore } from '@/stores/ui'

const keyboardInset = useKeyboardInset()
const ui = useUIStore()
const closeChatSheet = () => ui.closeChatSheet()
</script>
```

### Responsive Breakpoints

**Tailwind breakpoints (CSS variables equivalents):**
```css
/* styles/tokens.css */
:root {
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
}
```

**Mobile-first strategy:**
- **< 640px**: Single column, full-screen sheets, large touch targets.
- **640px–768px**: Tablet portrait, sidebar drawer might be persistent.
- **> 768px**: Desktop, multi-column layout, persistent panels.

---

## Global Theming

### CSS Variables Strategy

**File: `styles/themes.css`**

```css
:root {
  /* Light mode (default) */
  --color-bg-base: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
  --color-primary-light: #dbeafe;
  --color-accent: #f59e0b;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Font sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #1f2937;
    --color-bg-secondary: #111827;
    --color-text-primary: #f3f4f6;
    --color-text-secondary: #d1d5db;
    --color-border: #374151;
    --color-primary: #60a5fa;
    --color-primary-light: #1e40af;
  }
}

/* Explicit dark mode class (for manual toggle override) */
html.dark {
  --color-bg-base: #1f2937;
  --color-bg-secondary: #111827;
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #d1d5db;
  --color-border: #374151;
  --color-primary: #60a5fa;
  --color-primary-light: #1e40af;
}

html.light {
  --color-bg-base: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
  --color-primary-light: #dbeafe;
}
```

### useTheme Composable

```typescript
// composables/useTheme.ts
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'

export function useTheme() {
  const ui = useUIStore()
  
  const isDark = computed(() => {
    if (ui.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return ui.theme === 'dark'
  })
  
  const applyTheme = (theme: string) => {
    document.documentElement.classList.remove('light', 'dark')
    if (theme !== 'auto') {
      document.documentElement.classList.add(theme)
    }
  }
  
  const toggle = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    ui.setTheme(newTheme)
    applyTheme(newTheme)
  }
  
  const setTheme = (theme: string) => {
    ui.setTheme(theme)
    applyTheme(theme)
  }
  
  return {
    isDark,
    theme: computed(() => ui.theme),
    toggle,
    setTheme,
  }
}
```

### Auto-Persist Theme

In `stores/ui.ts`:

```typescript
const actions = {
  setTheme(theme: string) {
    this.theme = theme
    localStorage.setItem('mvu-generator:ui:theme', theme)
  },
}
```

---

## External Libraries

### Core Dependencies

| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **Vue** | ^3.3.0 | UI framework | Latest Composition API, better TypeScript support |
| **Pinia** | ^2.0.0 | State management | Lightweight, tree-shakeable, Vite-optimized |
| **TypeScript** | ^5.0.0 | Type safety | Full type support in Pinia, composables, components |
| **Vite** | ^4.0.0 | Build tooling | Fast HMR, tree-shaking, modern ESM output |
| **@monaco-editor/loader** | ^1.3.0 | Lazy-load Monaco | Reduce initial bundle; load only when editor tab active |
| **js-yaml** | ^4.1.0 | YAML parsing | Parse YAML artifacts; error handling |
| **openai** | ^4.0.0 | OpenAI SDK | Simplify API calls; handle streaming |

### Utility Libraries

| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **VueUse** | ^10.0.0 | Composable utilities | `useWindowSize`, `useKeyboard`, `useLocalStorage` shortcuts |
| **floating-ui** | ^0.13.0 | Position popovers/tooltips | Prevent settings modal/popover from being clipped |
| **clsx** | ^2.0.0 | Dynamic CSS class builder | Cleaner class bindings in templates |
| **zod** | ^3.20.0 | Schema validation | Validate YAML structure, artifact exports |
| **date-fns** | ^2.29.0 | Date formatting | Format chat timestamps, artifact dates |

### Optional Enhancements

| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **framer-motion** or **@vueuse/motion** | ^0.1.0 | Animation library | Smooth sheet transitions, drawer slide-in; optional for parity with React version |
| **lucide-vue-next** | ^0.260.0 | Icon library | Consistent 24×24 px icons; lightweight alternative to FontAwesome |

### Why Not Include

- **Vuetify / Quasar**: Opinionated; we need fine-grained mobile control.
- **Tailwind CSS**: Can use utility CSS directly in Vite + PostCSS; keep setup lean.
- **Redux/Vuex**: Pinia is simpler and smaller; no need for middleware overhead.
- **Axios/Fetch**: Use native `fetch` or OpenAI SDK directly.

---

## Implementation Priority

### Phase 1: Foundation (Blocks Core Features)
1. **Stores**: `workspace.ts`, `chat.ts`, `settings.ts`, `ui.ts` with localStorage sync.
2. **Composables**: `useWorkspace`, `useChat`, `useTheme`, `useKeyboardInset`.
3. **Layout**: `AppLayout.vue`, `NavigationDrawer.vue`, `BackdropLayer.vue`.
4. **Common**: `IconButton.vue`, `ThemeToggle.vue`, `SheetHandle.vue`.

### Phase 2: Workspace Editing
5. **Editor**: `MonacoEditor.vue` (lazy-loaded), `EditorPanel.vue`, `WorkspaceTabs.vue`, `WorkspaceHeader.vue`.
6. **Preview**: `PreviewPanel.vue`, `PreviewSandbox.vue` (iframe).
7. **Utils**: Artifact generators (`workspace.ts` utils), YAML validators.

### Phase 3: Chat & Results
8. **Chat**: `ChatSheet.vue`, `ChatHeader.vue`, `ChatMessageList.vue`, `ChatComposer.vue`.
9. **Results**: `ResultSheet.vue`, `ResultSection.vue`.
10. **Services**: `openai.ts` (API integration).

### Phase 4: Settings & Polish
11. **Settings**: `SettingsModal.vue`, `ProviderSelect.vue`, `ApiKeyField.vue`.
12. **Animations**: Smooth sheet transitions, drawer slide-in.
13. **Accessibility**: ARIA labels, keyboard navigation, focus management.
14. **Testing**: Unit tests for stores, composables; E2E tests for key flows.

---

## Design Scheme B: Mobile-First Features

This blueprint explicitly supports **Design Scheme B** requirements:

### ✅ Bottom Sheets (Not Always-Visible Panels)
- Chat, Results, and Settings appear as bottom sheets/modals.
- Saves screen real estate on mobile; improves focus on editor.
- Swipe/drag to dismiss; snap heights (peek, half, full).

### ✅ Virtual Keyboard Handling
- `useKeyboardInset()` composable detects keyboard visibility.
- ChatSheet and composer adjust position based on keyboard inset.
- No clipping of input field when keyboard is visible.

### ✅ Touch-Friendly Interactions
- 48×48 px minimum touch targets (all buttons, taps).
- SheetHandle for drag gestures; backdrop swipe to close.
- Hamburger menu for navigation drawer (no horizontal hamburger bar).

### ✅ Single-Column Primary Layout
- Workspace tabs + editor/preview stack vertically.
- Chat, results, settings layer on top as overlays.
- Desktop enhancements (side panels) are CSS-only (@media queries).

### ✅ Theme Persistence & CSS Variables
- Global theme toggle (light/dark) with localStorage sync.
- All colors via CSS variables on `<html>` root.
- Respects `prefers-color-scheme` on first load.

### ✅ Responsive Breakpoints
- Mobile-first CSS; enhancements at `@media (min-width: 768px)`.
- Workspace sidebar visible on desktop only.
- Landscape orientation support (reduce header height).

---

## Legacy React Feature Mapping

Ensuring **no feature loss** from the existing React app:

| React Feature | Vue Implementation | Store/Composable |
|---------------|-------------------|-----------------|
| Variable Editor (YAML) | `EditorPanel.vue` + `MonacoEditor.vue` tab | `workspace.updateArtifact` |
| Code Editor (HTML/CSS/JS) | `EditorPanel.vue` + `MonacoEditor.vue` tabs | `workspace.updateArtifact` |
| Chat Interface | `ChatSheet.vue` + `ChatMessageList.vue` | `chat.send()`, `chat.messages` |
| AI Suggestions | Code blocks extracted in `ChatMessageBubble.vue` | `chat.message.codeBlock` |
| Real-time Preview | `PreviewPanel.vue` + `PreviewSandbox.vue` (iframe) | `workspace.currentArtifact` |
| Export (YAML, Regex, HTML) | `ResultSheet.vue` + utils/workspace.ts | `workspace.generateExports()` |
| Settings (API Key, Model) | `SettingsModal.vue` + `ApiKeyField.vue` | `settings.updateSettings()` |
| Theme Toggle (Light/Dark) | `ThemeToggle.vue` | `useTheme().toggle()` |
| localStorage Persistence | Auto in each store | Pinia with watch + localStorage |
| Split Pane Resize | CSS Grid + drag logic (future) | Could use `floating-ui` |

---

## Notes for Implementation

### Performance Considerations
- **Monaco lazy-loading**: Import only when editor tab is active; use `@monaco-editor/loader`.
- **ChatMessageList virtualization**: If message count grows large, use `vue-virtual-scroller`.
- **PreviewSandbox debounce**: Limit iframe re-renders on every keystroke; debounce postMessage updates by 500ms.
- **Store watchers**: Use `shallow: true` on large arrays to avoid deep reactivity cost.

### Testing Strategy
- **Unit tests**: Pinia stores (mutations, actions), composables (useKeyboard inset, useTheme).
- **Component tests**: MonacoEditor sync, ChatComposer input handling, SheetHandle gestures.
- **E2E tests**: Full user flows (edit code → preview → chat → export).
- **Mobile testing**: Use Chrome DevTools device emulation; test on iOS Safari and Android Chrome.

### Accessibility
- ARIA labels on all buttons and interactive elements.
- Focus management when sheets open/close.
- Keyboard navigation: Tab through form fields, Enter to submit, Escape to close sheets.
- Color contrast: Ensure 4.5:1 contrast ratio for text on all backgrounds.

### Deployment & Build
- Build: `vite build` → outputs to `dist/`.
- Serve: Static hosting (Netlify, Vercel, or Docker).
- Environment variables: Store API defaults in `.env`, override via settings UI.
- Source maps: Enable for production debugging; strip on final release.

---

## Conclusion

This blueprint provides a **complete roadmap** for refactoring ranbo-play from React to Vue 3 with a **mobile-first design** (Scheme B). It captures:

✅ **Component hierarchy** and responsibilities  
✅ **Pinia stores** for centralized state  
✅ **Composable-first communication** patterns  
✅ **Virtual keyboard handling** for mobile  
✅ **Global theming** with CSS variables  
✅ **Bottom sheet layouts** for chat/results  
✅ **External library rationale**  
✅ **Legacy feature mapping** (no loss)  

The file tree is prescriptive but flexible; adjust as needed during implementation. Each component is designed to be **testable, composable, and maintainable**, supporting rapid iteration and future extensions (routing, plugins, etc.).

**Success Criteria:**
- All components follow Vue 3 + Pinia best practices.
- All Scheme B mobile-first features are implemented.
- All legacy React features are preserved.
- App is responsive and performs well on mobile, tablet, and desktop.
- Code is well-documented and ready for team handoff.
