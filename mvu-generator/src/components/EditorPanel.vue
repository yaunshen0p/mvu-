<template>
  <div class="editor-panel">
    <!-- Tab chips for different file types -->
    <div class="editor-tabs">
      <div class="tab-list">
        <button
          v-for="tab in workspaceTabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="[
            'tab-chip',
            { active: activeTab === tab.id },
            { 'has-unsaved': unsavedChanges[tab.id] }
          ]"
          :title="tab.label"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="unsavedChanges[tab.id]" class="unsaved-indicator">●</span>
        </button>
      </div>
    </div>

    <!-- Editor content -->
    <div class="editor-content">
      <div v-if="currentArtifact === null" class="editor-skeleton">
        <div class="skeleton-header">
          <div class="skeleton-tab"></div>
        </div>
        <div class="skeleton-editor">
          <div class="skeleton-line" v-for="i in 8" :key="i"></div>
        </div>
      </div>
      
      <MonacoEditor
        v-else
        v-model="currentArtifact"
        :language="currentTabConfig.language"
        :theme="isDark ? 'dark' : 'light'"
        :font-size="fontSize"
        :file-name="currentTabConfig.fileName"
        :show-actions="true"
        class="monaco-editor-wrapper"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useWorkspace } from '../composables/useWorkspace'
import { useAppStore } from '../stores/app'
import MonacoEditor from './MonacoEditor.vue'
import { WORKSPACE_TABS } from '../utils/workspace'

const workspace = useWorkspace()
const appStore = useAppStore()

// Computed properties
const activeTab = computed(() => workspace.activeTab)
const artifacts = computed(() => workspace.artifacts)
const unsavedChanges = computed(() => workspace.unsavedChanges)
const workspaceTabs = computed(() => WORKSPACE_TABS)
const isDark = computed(() => appStore.isDark)
const fontSize = computed(() => 14)

const currentArtifact = computed({
  get: () => artifacts.value[activeTab.value] || '',
  set: (value: string) => {
    workspace.updateArtifact(activeTab.value, value)
  }
})

const currentTabConfig = computed(() => {
  return WORKSPACE_TABS.find(tab => tab.id === activeTab.value) || WORKSPACE_TABS[0]
})

// Methods
function setActiveTab(tabId: string) {
  workspace.setActiveTab(tabId)
}

// Auto-scale font size based on container width
function updateFontSize() {
  const container = document.querySelector('.editor-panel')
  if (container) {
    const width = container.clientWidth
    // Responsive font sizing: 12px on mobile, 14px on tablet, 16px on desktop
    let newSize = 14
    if (width < 640) newSize = 12
    else if (width < 1024) newSize = 14
    else newSize = 16
    
    // Update font size if different
    if (newSize !== fontSize.value) {
      // This would need to be reactive in a real implementation
      // For now, we'll keep it at 14px
    }
  }
}

// Initialize
onMounted(() => {
  workspace.loadTemplates()
  updateFontSize()
  window.addEventListener('resize', updateFontSize)
})

// Watch for tab changes to ensure content is loaded
watch(activeTab, (newTab) => {
  // Ensure we have content for the new tab
  if (!artifacts.value[newTab]) {
    workspace.updateArtifact(newTab, '')
  }
}, { immediate: true })
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.editor-tabs {
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  padding: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab-list {
  display: flex;
  gap: 0.25rem;
  min-width: min-content;
}

.tab-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem 0.375rem 0 0;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.tab-chip:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.tab-chip.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom-color: var(--bg-primary);
  box-shadow: 0 -1px 0 var(--bg-primary);
}

.tab-chip.has-unsaved .unsaved-indicator {
  color: #f59e0b;
  font-size: 0.75rem;
  animation: pulse 2s infinite;
}

.tab-label {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.editor-content {
  flex: 1;
  position: relative;
  min-height: 0;
}

.monaco-editor-wrapper {
  height: 100%;
}

/* Skeleton loader */
.editor-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.skeleton-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.skeleton-tab {
  width: 80px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 0.25rem;
  animation: shimmer 2s infinite;
}

.skeleton-editor {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: 0.25rem;
  animation: shimmer 2s infinite;
}

.skeleton-line:nth-child(odd) {
  width: 100%;
}

.skeleton-line:nth-child(even) {
  width: 85%;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .editor-tabs {
    padding: 0.25rem;
  }
  
  .tab-chip {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .tab-chip .unsaved-indicator {
    font-size: 0.625rem;
  }
}

/* Ensure proper scrolling on mobile */
@media (max-width: 640px) {
  .tab-list {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
}
</style>