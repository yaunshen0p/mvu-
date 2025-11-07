<template>
  <div class="chat-header" :class="{ dragging }">
    <div
      class="drag-handle"
      @pointerdown="handlePointerDown"
      role="button"
      aria-label="Drag to close or minimize"
      tabindex="0"
      @keydown.space.prevent="toggleDragMode"
      @keydown.enter.prevent="toggleDragMode"
    >
      <div class="drag-indicator"></div>
    </div>

    <div class="header-content">
      <h2 class="header-title">Chat</h2>
      <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
    </div>

    <button
      class="close-button"
      @click="handleClose"
      aria-label="Close chat sheet"
      title="Close"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  subtitle?: string
  onClose?: () => void
  onDragStart?: (event: PointerEvent) => void
  onDragEnd?: (event: PointerEvent) => void
}

const props = withDefaults(defineProps<Props>(), {})

const dragging = ref(false)
let dragStartY = 0
let dragStartX = 0

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
    return
  }

  dragging.value = true
  dragStartY = event.clientY
  dragStartX = event.clientX

  const target = event.target as HTMLElement
  target.setPointerCapture(event.pointerId)

  props.onDragStart?.(event)

  const handlePointerMove = (moveEvent: PointerEvent) => {
    const deltaY = moveEvent.clientY - dragStartY
    const deltaX = moveEvent.clientX - dragStartX

    if (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10) {
      // Start drag - can be handled by parent
    }
  }

  const handlePointerUp = (upEvent: PointerEvent) => {
    dragging.value = false
    target.releasePointerCapture(upEvent.pointerId)

    const deltaY = upEvent.clientY - dragStartY
    const threshold = 50

    if (deltaY > threshold) {
      handleClose()
    }

    props.onDragEnd?.(upEvent)

    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  }

  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
}

function toggleDragMode() {
  dragging.value = !dragging.value
}

function handleClose() {
  props.onClose?.()
}
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.chat-header.dragging {
  background: var(--bg-tertiary);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  cursor: grab;
  user-select: none;
  transition: all 0.2s;
  touch-action: none;
}

.drag-handle:hover,
.drag-handle:focus {
  background: var(--border-color);
  outline: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-indicator {
  width: 1.25rem;
  height: 0.25rem;
  background: var(--text-secondary);
  border-radius: 0.125rem;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.close-button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-button:hover,
.close-button:focus {
  background: var(--border-color);
  outline: none;
}

.close-button:active {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .chat-header {
    padding: 0.75rem;
  }

  .drag-handle {
    width: 1.75rem;
    height: 1.75rem;
  }

  .header-title {
    font-size: 1.1rem;
  }

  .close-button {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }
}
</style>
