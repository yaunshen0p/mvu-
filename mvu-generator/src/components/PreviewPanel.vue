<template>
  <div class="preview-panel">
    <!-- Preview toolbar -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <h3 class="preview-title">Preview</h3>
        <div v-if="hasContent" class="preview-info">
          <span class="content-indicator" :class="{ 'has-content': hasContent }">
            {{ hasContent ? '●' : '○' }}
          </span>
        </div>
      </div>
      <div class="toolbar-right">
        <button 
          v-if="hasContent"
          @click="refreshPreview" 
          class="toolbar-btn"
          title="Refresh preview"
        >
          🔄
        </button>
        <button 
          @click="openInNewTab" 
          class="toolbar-btn"
          title="Open in new tab"
          :disabled="!hasContent"
        >
          🔗
        </button>
      </div>
    </div>

    <!-- Preview content -->
    <div class="preview-content">
      <div v-if="!hasContent" class="preview-empty">
        <div class="empty-icon">📄</div>
        <h3>No content to preview</h3>
        <p>Add HTML, CSS, and JavaScript to see a live preview.</p>
      </div>
      
      <iframe
        v-else
        ref="previewFrame"
        class="preview-frame"
        :srcdoc="previewHtml"
        @load="onFrameLoad"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useWorkspace } from '../composables/useWorkspace'

const workspace = useWorkspace()
const previewFrame = ref<HTMLIFrameElement>()
const isFrameLoaded = ref(false)

// Computed properties
const artifacts = computed(() => workspace.artifacts)
const hasContent = computed(() => {
  return !!(artifacts.value.html?.trim() || artifacts.value.css?.trim() || artifacts.value.javascript?.trim())
})

// Generate preview HTML
const previewHtml = computed(() => {
  const { html = '', css = '', javascript = '' } = artifacts.value
  
  if (!html.trim() && !css.trim() && !javascript.trim()) {
    return ''
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    /* Reset and base styles */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      background: #ffffff;
      color: #1f2937;
    }
    
    /* User CSS */
    ${css}
  </style>
</head>
<body>
  ${html || '<div class="preview-placeholder">No HTML content</div>'}
  
  <script>
    // Error handling for user scripts
    window.addEventListener('error', function(e) {
      console.error('Preview script error:', e.error);
    });
    
    // User JavaScript
    try {
      ${javascript}
    } catch (error) {
      console.error('Preview script error:', error);
    }
  <\/script>
</body>
</html>`
})

// Methods
function refreshPreview() {
  isFrameLoaded.value = false
  nextTick(() => {
    if (previewFrame.value) {
      // Force reload by changing srcdoc
      const currentSrc = previewFrame.value.srcdoc
      previewFrame.value.srcdoc = ''
      nextTick(() => {
        previewFrame.value!.srcdoc = currentSrc
      })
    }
  })
}

function openInNewTab() {
  if (!hasContent.value) return
  
  const newWindow = window.open('', '_blank')
  if (newWindow) {
    newWindow.document.write(previewHtml.value)
    newWindow.document.close()
  }
}

function onFrameLoad() {
  isFrameLoaded.value = true
}

// Watch for content changes and refresh preview
watch(() => [artifacts.value.html, artifacts.value.css, artifacts.value.javascript], () => {
  if (isFrameLoaded.value && hasContent.value) {
    // Debounced refresh could be added here for performance
    refreshPreview()
  }
}, { deep: true })
</script>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 3rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-info {
  display: flex;
  align-items: center;
}

.content-indicator {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.content-indicator.has-content {
  color: #10b981;
}

.toolbar-right {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  color: var(--text-secondary);
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.preview-content {
  flex: 1;
  position: relative;
  min-height: 0;
}

.preview-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.preview-empty h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-empty p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  max-width: 300px;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* Loading state */
.preview-frame:not(.loaded) {
  opacity: 0.8;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .preview-toolbar {
    padding: 0.5rem 0.75rem;
  }
  
  .preview-title {
    font-size: 0.75rem;
  }
  
  .toolbar-btn {
    min-width: 1.75rem;
    height: 1.75rem;
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }
  
  .preview-empty {
    padding: 1rem;
  }
  
  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .preview-empty h3 {
    font-size: 1rem;
  }
  
  .preview-empty p {
    font-size: 0.75rem;
  }
}

/* Dark mode adjustments for iframe content */
@media (prefers-color-scheme: dark) {
  .preview-frame {
    filter: invert(1) hue-rotate(180deg);
  }
  
  .preview-frame img,
  .preview-frame video {
    filter: invert(1) hue-rotate(180deg);
  }
}
</style>