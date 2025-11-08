<template>
  <div class="workspace-tabs">
    <!-- Toolbar -->
    <div class="workspace-toolbar">
      <div class="toolbar-left">
        <div class="tab-toggle">
          <button
            @click="activeView = 'editor'"
            :class="['tab-btn', { active: activeView === 'editor' }]"
          >
            <span class="tab-icon">📝</span>
            <span class="tab-label">Editor</span>
          </button>
          <button
            @click="activeView = 'preview'"
            :class="['tab-btn', { active: activeView === 'preview' }]"
          >
            <span class="tab-icon">👁️</span>
            <span class="tab-label">Preview</span>
          </button>
        </div>
        
        <div v-if="hasUnsavedChanges" class="unsaved-indicator">
          <span class="unsaved-dot">●</span>
          <span class="unsaved-text">Unsaved changes</span>
        </div>
      </div>
      
      <div class="toolbar-right">
        <!-- Template dropdown -->
        <div class="template-dropdown" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            :class="['dropdown-btn', { active: isDropdownOpen }]"
          >
            <span>📋</span>
            <span>Templates</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <div class="dropdown-header">
              <h4>Code Templates</h4>
              <button @click="showSaveTemplateDialog" class="save-btn">
                ➕ Save Current
              </button>
            </div>
            
            <div class="template-list">
              <div
                v-for="template in templates"
                :key="template.name"
                class="template-item"
              >
                <div class="template-info" @click="loadTemplate(template.name)">
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-meta">
                    {{ formatDate(template.updatedAt) }}
                  </div>
                </div>
                <div class="template-actions">
                  <button
                    @click="loadTemplate(template.name)"
                    class="action-btn"
                    title="Load template"
                  >
                    📂
                  </button>
                  <button
                    @click="deleteTemplate(template.name)"
                    class="action-btn delete"
                    title="Delete template"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div v-if="templates.length === 0" class="no-templates">
                No saved templates
              </div>
            </div>
          </div>
        </div>
        
        <!-- Export button -->
        <button @click="exportArtifacts" class="toolbar-btn" title="Export code">
          <span>📤</span>
          <span>Export</span>
        </button>
      </div>
    </div>
    
    <!-- Content area -->
    <div class="workspace-content">
      <EditorPanel v-show="activeView === 'editor'" />
      <PreviewPanel v-show="activeView === 'preview'" />
    </div>
    
    <!-- Save template dialog (simplified) -->
    <div v-if="showSaveDialog" class="dialog-overlay" @click="closeSaveDialog">
      <div class="dialog" @click.stop>
        <h3>Save Template</h3>
        <input
          v-model="templateName"
          type="text"
          placeholder="Template name..."
          class="template-input"
          @keyup.enter="saveTemplate"
          ref="templateInputRef"
        />
        <div class="dialog-actions">
          <button @click="closeSaveDialog" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="saveTemplate" class="btn btn-primary" :disabled="!templateName.trim()">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useWorkspace } from '../composables/useWorkspace'
import EditorPanel from './EditorPanel.vue'
import PreviewPanel from './PreviewPanel.vue'

const workspace = useWorkspace()

// State
const activeView = ref<'editor' | 'preview'>('editor')
const isDropdownOpen = ref(false)
const showSaveDialog = ref(false)
const templateName = ref('')
const dropdownRef = ref<HTMLElement>()
const templateInputRef = ref<HTMLInputElement>()

// Computed
const hasUnsavedChanges = computed(() => workspace.hasUnsavedChanges)
const templates = computed(() => workspace.templates)

// Methods
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function showSaveTemplateDialog() {
  templateName.value = ''
  showSaveDialog.value = true
  closeDropdown()
  nextTick(() => {
    templateInputRef.value?.focus()
  })
}

function closeSaveDialog() {
  showSaveDialog.value = false
  templateName.value = ''
}

function saveTemplate() {
  if (!templateName.value.trim()) return
  
  try {
    workspace.saveTemplate(templateName.value.trim())
    closeSaveDialog()
  } catch (error) {
    console.error('Failed to save template:', error)
    // Could show error toast here
  }
}

function loadTemplate(name: string) {
  try {
    const template = workspace.loadTemplate(name)
    if (template) {
      workspace.updateArtifacts(template.artifacts)
      workspace.setBaseline(template.artifacts)
      closeDropdown()
    }
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}

function deleteTemplate(name: string) {
  if (confirm(`Delete template "${name}"?`)) {
    try {
      workspace.deleteTemplate(name)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }
}

function exportArtifacts() {
  const exports = workspace.generateExports()
  const content = Object.entries(exports)
    .filter(([_, value]) => value?.trim())
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      return `[${label}]\n${value}`
    })
    .join('\n\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'workspace-export.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  workspace.loadTemplates()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.workspace-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.workspace-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #d97706;
}

.unsaved-dot {
  color: #f59e0b;
  animation: pulse 2s infinite;
}

.unsaved-text {
  font-weight: 500;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.template-dropdown {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown-btn:hover,
.dropdown-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.dropdown-arrow {
  font-size: 0.625rem;
  transition: transform 0.2s;
}

.dropdown-btn.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  min-width: 280px;
  max-width: 320px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-top: 0.25rem;
  max-height: 400px;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.dropdown-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.save-btn {
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.save-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.template-list {
  max-height: 300px;
  overflow-y: auto;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.template-item:hover {
  background: var(--bg-secondary);
}

.template-item:last-child {
  border-bottom: none;
}

.template-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.template-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.template-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  opacity: 0.6;
  transition: all 0.2s;
}

.action-btn:hover {
  opacity: 1;
  background: var(--bg-tertiary);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.no-templates {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.workspace-content {
  flex: 1;
  min-height: 0;
  position: relative;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.template-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.template-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.btn-secondary {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .workspace-toolbar {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }
  
  .toolbar-left {
    gap: 0.5rem;
  }
  
  .tab-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  .tab-icon {
    font-size: 0.875rem;
  }
  
  .unsaved-indicator {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
  }
  
  .dropdown-btn,
  .toolbar-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  .dropdown-menu {
    min-width: 260px;
    max-width: 280px;
  }
  
  .dropdown-header {
    padding: 0.5rem 0.75rem;
  }
  
  .template-item {
    padding: 0.5rem 0.75rem;
  }
  
  .template-name {
    font-size: 0.75rem;
  }
  
  .template-meta {
    font-size: 0.625rem;
  }
  
  .dialog {
    padding: 1rem;
  }
  
  .dialog h3 {
    font-size: 1rem;
  }
}
</style>