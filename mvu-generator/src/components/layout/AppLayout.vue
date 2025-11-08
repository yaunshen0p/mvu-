<template>
  <div class="app-layout">
    <!-- Backdrop for mobile drawer -->
    <div
      v-if="isDrawerOpen && !isDesktop"
      class="drawer-backdrop"
      @click="closeDrawer"
      aria-hidden="true"
    />

    <!-- Navigation Drawer -->
    <NavigationDrawer
      :is-open="isDrawerOpen"
      @close="closeDrawer"
      @load-sample="handleLoadSample"
      @paste-init-var="handlePasteInitVar"
      @export="handleExport"
      @template-management="handleTemplateManagement"
      @view-results="handleViewResults"
      @documentation="handleDocumentation"
      @keyboard-shortcuts="handleKeyboardShortcuts"
      @about="handleAbout"
    />

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Top App Bar -->
      <header class="app-header">
        <div class="header-content">
          <!-- Menu Button (mobile only) -->
          <button
            v-if="!isDesktop"
            @click="openDrawer"
            class="menu-button"
            aria-label="Open navigation menu"
          >
            <span class="menu-icon">☰</span>
          </button>

          <!-- App Title -->
          <div class="app-title">
            <h1 class="title-text">MVU Generator</h1>
            <span class="title-subtitle">Mobile-First Development Tool</span>
          </div>

          <!-- Header Actions -->
          <div class="header-actions">
            <!-- Floating Action Buttons -->
            <button
              @click="openChatSheet"
              class="fab-button fab-button--chat"
              aria-label="Open chat"
            >
              <span class="fab-icon">💬</span>
            </button>
            
            <button
              @click="openResultSheet"
              class="fab-button fab-button--result"
              aria-label="View results"
            >
              <span class="fab-icon">📊</span>
            </button>

            <!-- Settings Button -->
            <button
              @click="openSettings"
              class="settings-button"
              aria-label="Settings"
            >
              <span class="settings-icon">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workspace Area -->
      <main class="app-main">
        <div class="workspace-container">
          <!-- Workspace Tabs Placeholder -->
          <div class="workspace-tabs-placeholder">
            <div class="tabs-header">
              <div class="tab active">
                <span class="tab-label">Main</span>
              </div>
              <div class="tab">
                <span class="tab-label">Variables</span>
              </div>
              <div class="tab">
                <span class="tab-label">Preview</span>
              </div>
            </div>
          </div>

          <!-- Workspace Content Area -->
          <div class="workspace-content">
            <!-- This will be replaced by actual workspace components -->
            <div class="workspace-placeholder">
              <div class="placeholder-icon">🚀</div>
              <h2>Workspace Area</h2>
              <p>Ready for workspace components integration</p>
              <div class="placeholder-actions">
                <button class="placeholder-button">Start New Project</button>
                <button class="placeholder-button placeholder-button--secondary">Load Example</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reserve space for chat sheet overlay -->
        <div class="sheet-reservation" />
      </main>
    </div>

    <!-- Chat Sheet Placeholder (will be integrated later) -->
    <div v-if="isChatSheetOpen" class="sheet-placeholder chat-sheet-placeholder">
      <div class="sheet-header">
        <h3>Chat Interface</h3>
        <button @click="closeChatSheet" class="sheet-close">×</button>
      </div>
      <div class="sheet-content">
        <p>Chat sheet will be integrated here</p>
      </div>
    </div>

    <!-- Result Sheet Placeholder (will be integrated later) -->
    <div v-if="isResultSheetOpen" class="sheet-placeholder result-sheet-placeholder">
      <div class="sheet-header">
        <h3>Results</h3>
        <button @click="closeResultSheet" class="sheet-close">×</button>
      </div>
      <div class="sheet-content">
        <p>Result sheet will be integrated here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUI } from '../../../../src/composables/useUI'
import NavigationDrawer from './NavigationDrawer.vue'

const {
  isDrawerOpen,
  isChatSheetOpen,
  isResultSheetOpen,
  openDrawer,
  closeDrawer,
  openChatSheet,
  closeChatSheet,
  openResultSheet,
  closeResultSheet,
  openSettings,
} = useUI()

// Responsive breakpoint detection
const windowWidth = ref(window.innerWidth)
const isDesktop = computed(() => windowWidth.value >= 1024)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  
  // Auto-close drawer on desktop when window resizes to mobile
  if (isDesktop.value && isDrawerOpen.value) {
    // Keep drawer open on desktop
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

// Action handlers (these will emit events or call store methods)
const handleLoadSample = () => {
  console.log('Load sample action triggered')
  // TODO: Implement load sample functionality
}

const handlePasteInitVar = () => {
  console.log('Paste InitVar action triggered')
  // TODO: Implement paste InitVar functionality
}

const handleExport = () => {
  console.log('Export action triggered')
  // TODO: Implement export functionality
}

const handleTemplateManagement = () => {
  console.log('Template management action triggered')
  // TODO: Implement template management
}

const handleViewResults = () => {
  openResultSheet()
}

const handleDocumentation = () => {
  console.log('Documentation action triggered')
  // TODO: Open documentation
}

const handleKeyboardShortcuts = () => {
  console.log('Keyboard shortcuts action triggered')
  // TODO: Show keyboard shortcuts modal
}

const handleAbout = () => {
  console.log('About action triggered')
  // TODO: Show about modal
}
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

/* Backdrop */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Header */
.app-header {
  position: relative;
  z-index: 30;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  height: 64px;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background: var(--bg-tertiary);
}

.menu-button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.menu-icon {
  font-size: 1.25rem;
}

.app-title {
  flex: 1;
  min-width: 0;
}

.title-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.title-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
  margin-top: 0.125rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.fab-button:hover {
  background: var(--bg-primary);
  border-color: var(--color-accent);
}

.fab-button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.fab-button--chat {
  background: rgba(var(--color-accent), 0.1);
  border-color: rgba(var(--color-accent), 0.3);
  color: rgb(var(--color-accent));
}

.fab-button--chat:hover {
  background: rgba(var(--color-accent), 0.2);
}

.fab-button--result {
  background: rgba(var(--color-accent), 0.1);
  border-color: rgba(var(--color-accent), 0.3);
  color: rgb(var(--color-accent));
}

.fab-button--result:hover {
  background: rgba(var(--color-accent), 0.2);
}

.fab-icon {
  font-size: 1rem;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.settings-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.settings-button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.settings-icon {
  font-size: 1.125rem;
}

/* Main Content */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.workspace-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Workspace Tabs Placeholder */
.workspace-tabs-placeholder {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tabs-header {
  display: flex;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-header::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab.active {
  color: rgb(var(--color-accent));
  border-bottom-color: rgb(var(--color-accent));
}

.tab-label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Workspace Content */
.workspace-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.workspace-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  min-height: 400px;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.workspace-placeholder h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.workspace-placeholder p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.placeholder-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.placeholder-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.placeholder-button:hover {
  opacity: 0.9;
}

.placeholder-button--secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.placeholder-button--secondary:hover {
  background: var(--bg-primary);
}

/* Sheet Reservation */
.sheet-reservation {
  height: 60px;
  flex-shrink: 0;
}

/* Sheet Placeholders */
.sheet-placeholder {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sheet-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sheet-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.sheet-close:hover {
  color: var(--text-primary);
}

.sheet-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Responsive Design */
@media (min-width: 768px) {
  .header-content {
    padding: 0.75rem 1.5rem;
  }
  
  .workspace-content {
    padding: 2rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-content {
    padding: 1rem 2rem;
  }
  
  .workspace-content {
    padding: 2rem;
  }
  
  .title-text {
    font-size: 1.5rem;
  }
  
  .header-actions {
    gap: 0.75rem;
  }
}

/* Mobile Optimizations */
@media (max-width: 767px) {
  .header-content {
    padding: 0.5rem 0.75rem;
    height: 56px;
  }
  
  .title-text {
    font-size: 1.125rem;
  }
  
  .title-subtitle {
    display: none;
  }
  
  .workspace-content {
    padding: 1rem;
  }
  
  .workspace-placeholder {
    padding: 2rem 1rem;
    min-height: 300px;
  }
  
  .placeholder-icon {
    font-size: 3rem;
  }
  
  .placeholder-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .placeholder-button {
    width: 100%;
  }
}

/* Touch optimizations */
@media (hover: none) and (pointer: coarse) {
  .menu-button,
  .fab-button,
  .settings-button,
  .tab,
  .placeholder-button,
  .sheet-close {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  .fab-button,
  .settings-button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>