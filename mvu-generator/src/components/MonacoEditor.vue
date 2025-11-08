<template>
  <div class="monaco-editor-container">
    <div ref="editorContainer" class="editor-wrapper"></div>
    <div v-if="showActions" class="editor-actions">
      <button @click="copyContent" class="action-btn" title="Copy content">
        📋
      </button>
      <button @click="downloadContent" class="action-btn" title="Download file">
        💾
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { configureMonacoYaml } from 'monaco-yaml'
import { WORKSPACE_TABS } from '../utils/workspace'

interface Props {
  modelValue?: string
  language?: string
  theme?: 'light' | 'dark'
  readOnly?: boolean
  fontSize?: number
  showActions?: boolean
  fileName?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'light',
  readOnly: false,
  fontSize: 14,
  showActions: true,
  fileName: 'code.txt'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

// Initialize Monaco Editor
function initializeEditor() {
  if (!editorContainer.value) return

  try {
    // Configure YAML language support
    if (props.language === 'yaml') {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        validate: true,
        format: true,
      })
    }

    // Create editor instance
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme === 'dark' ? 'vs-dark' : 'vs',
      readOnly: props.readOnly,
      fontSize: props.fontSize,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
    })

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || ''
      emit('update:modelValue', value)
    })

    // Auto-resize editor
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        editor?.layout()
      })
    })
    resizeObserver.observe(editorContainer.value)
  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error)
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs')
  }
})

watch(() => props.fontSize, (newFontSize) => {
  if (editor) {
    editor.updateOptions({ fontSize: newFontSize })
  }
})

// Action handlers
function copyContent() {
  const content = editor?.getValue() || props.modelValue
  navigator.clipboard.writeText(content).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = content
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  })
}

function downloadContent() {
  const content = editor?.getValue() || props.modelValue
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(() => {
  initializeEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.monaco-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
}

.editor-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.25rem;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
}

.monaco-editor-container:hover .editor-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
}

.action-btn:hover {
  background: var(--bg-tertiary);
}

.action-btn:active {
  transform: scale(0.95);
}

/* Ensure Monaco editor takes full height */
:deep(.monaco-editor) {
  height: 100% !important;
}

:deep(.monaco-editor .margin) {
  background-color: var(--bg-secondary);
}

:deep(.monaco-editor .monaco-editor-background) {
  background-color: var(--bg-primary);
}
</style>