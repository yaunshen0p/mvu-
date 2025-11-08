<template>
  <Teleport to="body">
    <Transition
      name="result-sheet"
      @enter="handleEnter"
      @leave="handleLeave"
    >
      <div v-if="isOpen" class="result-sheet-overlay">
        <div 
          class="result-sheet-backdrop"
          @click="handleClose"
        ></div>
        <div
          class="result-sheet"
          :class="[sheetClass, { 'dragging': isDragging, 'keyboard-visible': keyboardInset > 0 }]"
          :style="sheetStyles"
          @pointerdown.self="startDrag"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-sheet-title"
        >
          <SheetHandle
            :onDragStart="handleDragStart"
            :onDragEnd="handleDragEnd"
          />
          
          <div class="result-sheet-header">
            <h2 id="result-sheet-title" class="result-sheet-title">导出结果</h2>
            <button
              class="result-sheet-close"
              @click="handleClose"
              aria-label="Close result sheet"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div v-if="Object.keys(exportPayload).length === 0" class="result-sheet-empty">
            <p>暂无导出数据</p>
          </div>

          <div v-else class="result-sheet-content">
            <div class="result-sheet-tabs">
              <button
                v-for="tab in availableTabs"
                :key="tab.id"
                @click="activeArtifactTab = tab.id"
                :class="['result-sheet-tab', { 'active': activeArtifactTab === tab.id }]"
              >
                {{ tab.label }}
              </button>
            </div>

            <div v-if="currentArtifact" class="result-sheet-artifact">
              <div class="artifact-toolbar">
                <button
                  class="artifact-action-btn"
                  @click="copyToClipboard($event)"
                  :title="`Copy ${currentTabLabel}`"
                >
                  📋 Copy
                </button>
                <button
                  class="artifact-action-btn"
                  @click="downloadCurrent"
                  :title="`Download ${currentTabLabel}`"
                >
                  ⬇️ Download
                </button>
              </div>
              <pre class="artifact-code"><code v-html="highlightedCode"></code></pre>
            </div>

            <div class="result-sheet-footer">
              <button
                class="export-all-btn"
                @click="exportAll"
              >
                📦 Export All
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import SheetHandle from './SheetHandle.vue'

interface ExportPayload {
  html?: string
  css?: string
  javascript?: string
  yaml?: string
  script?: string
  regex?: string
  [key: string]: string | undefined
}

interface ArtifactTab {
  id: string
  label: string
  language: string
  fileName: string
}

const ARTIFACT_TABS: ArtifactTab[] = [
  { id: 'html', label: 'HTML', language: 'html', fileName: 'index.html' },
  { id: 'css', label: 'CSS', language: 'css', fileName: 'styles.css' },
  { id: 'javascript', label: 'JavaScript', language: 'javascript', fileName: 'script.js' },
  { id: 'yaml', label: 'YAML', language: 'yaml', fileName: 'config.yaml' },
  { id: 'script', label: 'MVU Script', language: 'javascript', fileName: 'mvu-script.js' },
  { id: 'regex', label: 'Regex', language: 'plaintext', fileName: 'patterns.txt' },
]

const props = defineProps<{
  isOpen: boolean
  exportPayload: ExportPayload
  keyboardInset?: number
  onClose?: () => void
}>()

const emit = defineEmits<{
  close: []
  exportAll: []
}>()

const isDragging = ref(false)
const dragStartY = ref(0)
const dragOffset = ref(0)
const sheetHeight = ref(0)
const activeArtifactTab = ref<string>('html')

const isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 768)
const isDesktop = computed(() => !isMobile.value)

const sheetClass = computed(() => {
  if (isDesktop.value) {
    return 'sheet-side-overlay'
  }
  return 'sheet-bottom-modal'
})

const sheetStyles = computed(() => {
  const baseStyles: Record<string, any> = {}

  if (isDragging.value) {
    baseStyles.transform = `translateY(${dragOffset.value}px)`
  }

  if (isMobile.value && (props.keyboardInset ?? 0) > 0) {
    baseStyles.paddingBottom = `${Math.min(props.keyboardInset ?? 0, 200)}px`
  }

  return baseStyles
})

const availableTabs = computed(() => {
  return ARTIFACT_TABS.filter(tab => props.exportPayload[tab.id])
})

const currentArtifact = computed(() => {
  return props.exportPayload[activeArtifactTab.value] || ''
})

const currentTabLabel = computed(() => {
  const tab = ARTIFACT_TABS.find(t => t.id === activeArtifactTab.value)
  return tab?.label || 'Artifact'
})

const highlightedCode = computed(() => {
  const code = currentArtifact.value
  if (!code) return ''
  
  // For now, just escape HTML
  // In a real implementation, this would use highlight.js or similar
  return escapeHtml(code)
})

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function handleEnter(el: Element) {
  if (isMobile.value) {
    el.addEventListener('transitionend', () => {
      sheetHeight.value = (el as HTMLElement).offsetHeight
    })
  }
}

function handleLeave(el: Element) {
  dragOffset.value = 0
  sheetHeight.value = 0
}

function startDrag(event: PointerEvent) {
  if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
    return
  }

  isDragging.value = true
  dragStartY.value = event.clientY
  dragOffset.value = 0

  const handlePointerMove = (moveEvent: PointerEvent) => {
    const delta = moveEvent.clientY - dragStartY.value

    if (delta > 0) {
      dragOffset.value = delta
    }
  }

  const handlePointerUp = (upEvent: PointerEvent) => {
    isDragging.value = false

    const delta = upEvent.clientY - dragStartY.value
    const threshold = 100

    if (delta > threshold) {
      handleClose()
    } else {
      dragOffset.value = 0
    }

    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  }

  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
}

function handleDragStart(event: PointerEvent) {
  startDrag(event)
}

function handleDragEnd(event: PointerEvent) {
  // Handle drag end if needed
}

function handleClose() {
  if (props.onClose) {
    props.onClose()
  }
  emit('close')
}

async function copyToClipboard(event?: Event) {
  try {
    const text = currentArtifact.value
    if (!text) return

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    // Show success feedback
    const btn = event?.target as HTMLElement
    if (btn) {
      const originalText = btn.textContent
      btn.textContent = '✓ Copied'
      setTimeout(() => {
        btn.textContent = originalText
      }, 2000)
    }
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

function downloadCurrent() {
  try {
    const tab = ARTIFACT_TABS.find(t => t.id === activeArtifactTab.value)
    if (!tab) return

    const content = currentArtifact.value
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = tab.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download:', error)
  }
}

function exportAll() {
  emit('exportAll')
}

// Initialize on mount
onMounted(() => {
  // Handle window resize to detect mobile/desktop
  const handleResize = () => {
    dragOffset.value = 0
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

// Watch for sheet open/close
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
})

// Reset active tab when payload changes
watch(() => props.exportPayload, () => {
  if (!availableTabs.value.find(tab => tab.id === activeArtifactTab.value)) {
    activeArtifactTab.value = availableTabs.value[0]?.id || 'html'
  }
}, { deep: true })
</script>

<style scoped>
.result-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  pointer-events: none;
}

.result-sheet-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  z-index: 39;
}

.result-sheet {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.dark .result-sheet {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Mobile: Bottom Sheet */
.sheet-bottom-modal {
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  border-radius: 1rem 1rem 0 0;
}

/* Desktop: Side Overlay */
.sheet-side-overlay {
  top: 0;
  right: 0;
  width: 100%;
  max-width: 480px;
  height: 100vh;
  border-radius: 0;
}

.result-sheet.keyboard-visible {
  transition: padding-bottom 0.3s ease-out;
}

.result-sheet.dragging {
  transition: none;
}

/* Header */
.result-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.result-sheet-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.result-sheet-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.result-sheet-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.result-sheet-close:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Empty State */
.result-sheet-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  text-align: center;
  flex: 1;
}

/* Content */
.result-sheet-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* Tabs */
.result-sheet-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  overflow-y: hidden;
}

.result-sheet-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s;
}

.result-sheet-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.result-sheet-tab.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Artifact Display */
.result-sheet-artifact {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
  margin: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.artifact-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.artifact-action-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.artifact-action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
}

.artifact-action-btn:active {
  transform: scale(0.95);
}

.artifact-code {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-primary);
  border-radius: 0;
  white-space: pre;
  word-wrap: break-word;
  word-break: break-all;
}

.artifact-code code {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
}

/* Footer */
.result-sheet-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem 1rem 1rem;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.export-all-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-all-btn:hover {
  opacity: 0.9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.export-all-btn:active {
  transform: scale(0.95);
}

/* Transitions */
.result-sheet-enter-active {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-sheet-leave-active {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@media (min-width: 768px) {
  .result-sheet-enter-active {
    animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .result-sheet-leave-active {
    animation: slideOutToRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 640px) {
  .sheet-bottom-modal {
    max-height: 90vh;
  }

  .result-sheet-tabs {
    padding: 0.5rem 0.5rem;
  }

  .result-sheet-tab {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}

/* Prevent body scroll when sheet is open */
:global(body.result-sheet-open) {
  overflow: hidden;
}
</style>
