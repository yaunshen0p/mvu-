<template>
  <div
    ref="drawerRef"
    class="navigation-drawer"
    :class="{ 'navigation-drawer--open': isOpen }"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="drawer-content">
      <!-- Header -->
      <div class="drawer-header">
        <h2 class="drawer-title">
          <span class="app-icon">📱</span>
          MVU Generator
        </h2>
        <button
          @click="closeDrawer"
          class="close-button"
          aria-label="Close navigation drawer"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Actions -->
      <nav class="drawer-nav">
        <!-- Quick Actions Group -->
        <div class="action-group">
          <h3 class="group-title">Quick Actions</h3>
          <button
            @click="handleLoadSample"
            class="nav-button nav-button--primary"
          >
            <span class="button-icon">📋</span>
            Load Sample
          </button>
          <button
            @click="handlePasteInitVar"
            class="nav-button"
          >
            <span class="button-icon">📝</span>
            Paste InitVar
          </button>
          <button
            @click="handleExport"
            class="nav-button"
          >
            <span class="button-icon">💾</span>
            Export Project
          </button>
        </div>

        <!-- Templates Group -->
        <div class="action-group">
          <h3 class="group-title">Templates</h3>
          <button
            @click="handleTemplateManagement"
            class="nav-button"
          >
            <span class="button-icon">📚</span>
            Manage Templates
          </button>
        </div>

        <!-- Results Group -->
        <div class="action-group">
          <h3 class="group-title">Results</h3>
          <button
            @click="handleViewResults"
            class="nav-button nav-button--accent"
          >
            <span class="button-icon">👁️</span>
            查看结果
          </button>
        </div>

        <!-- Help & Support Group -->
        <div class="action-group">
          <h3 class="group-title">Help & Support</h3>
          <button
            @click="handleDocumentation"
            class="nav-button"
          >
            <span class="button-icon">📖</span>
            Documentation
          </button>
          <button
            @click="handleKeyboardShortcuts"
            class="nav-button"
          >
            <span class="button-icon">⌨️</span>
            Keyboard Shortcuts
          </button>
          <button
            @click="handleAbout"
            class="nav-button"
          >
            <span class="button-icon">ℹ️</span>
            About
          </button>
        </div>
      </nav>

      <!-- Footer with Theme Toggle -->
      <div class="drawer-footer">
        <button
          @click="toggleTheme"
          class="theme-button"
          aria-label="Toggle theme"
        >
          <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="theme-text">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useUI } from '../../../../src/composables/useUI'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  loadSample: []
  pasteInitVar: []
  export: []
  templateManagement: []
  viewResults: []
  documentation: []
  keyboardShortcuts: []
  about: []
}>()

const { toggleTheme, isDarkMode } = useUI()
const drawerRef = ref<HTMLElement>()

// Close drawer on ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeDrawer()
  }
}

// Focus trap for accessibility
const previousActiveElement = ref<HTMLElement | null>(null)
const focusableElements = ref<HTMLElement[]>([])

const updateFocusableElements = () => {
  if (!drawerRef.value) return
  const focusable = drawerRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  focusableElements.value = Array.from(focusable)
}

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !props.isOpen || focusableElements.value.length === 0) return

  const firstElement = focusableElements.value[0]
  const lastElement = focusableElements.value[focusableElements.value.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

const closeDrawer = () => {
  emit('close')
}

// Action handlers
const handleLoadSample = () => {
  emit('loadSample')
  closeDrawer()
}

const handlePasteInitVar = () => {
  emit('pasteInitVar')
  closeDrawer()
}

const handleExport = () => {
  emit('export')
  closeDrawer()
}

const handleTemplateManagement = () => {
  emit('templateManagement')
  closeDrawer()
}

const handleViewResults = () => {
  emit('viewResults')
  closeDrawer()
}

const handleDocumentation = () => {
  emit('documentation')
  closeDrawer()
}

const handleKeyboardShortcuts = () => {
  emit('keyboardShortcuts')
  closeDrawer()
}

const handleAbout = () => {
  emit('about')
  closeDrawer()
}

// Watch for drawer open/close to manage focus
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    previousActiveElement.value = document.activeElement as HTMLElement
    updateFocusableElements()
    // Focus first focusable element
    if (focusableElements.value.length > 0) {
      focusableElements.value[0]?.focus()
    }
  } else {
    // Restore focus to previous element
    previousActiveElement.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.navigation-drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 280px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.navigation-drawer--open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .navigation-drawer {
    position: relative;
    transform: translateX(0);
    box-shadow: none;
  }
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.app-icon {
  font-size: 1.5rem;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.close-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (min-width: 1024px) {
  .close-button {
    display: none;
  }
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.drawer-nav::-webkit-scrollbar {
  width: 6px;
}

.drawer-nav::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-nav::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.action-group {
  margin-bottom: 1.5rem;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  padding: 0 0.75rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
  text-align: left;
  font-size: 0.875rem;
}

.nav-button:hover {
  background: var(--bg-tertiary);
}

.nav-button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.nav-button--primary {
  background: var(--color-accent);
  color: white;
}

.nav-button--primary:hover {
  background: var(--color-accent);
  opacity: 0.9;
}

.nav-button--accent {
  background: rgba(var(--color-accent), 0.1);
  color: rgb(var(--color-accent));
}

.nav-button--accent:hover {
  background: rgba(var(--color-accent), 0.2);
}

.button-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.drawer-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.theme-button:hover {
  background: var(--bg-primary);
  border-color: var(--color-accent);
}

.theme-button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.theme-icon {
  font-size: 1.125rem;
}

.theme-text {
  font-weight: 500;
}

/* Touch optimizations for mobile */
@media (hover: none) and (pointer: coarse) {
  .nav-button,
  .theme-button,
  .close-button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>