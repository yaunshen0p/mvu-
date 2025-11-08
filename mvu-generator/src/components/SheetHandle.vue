<template>
  <div
    class="sheet-handle"
    @pointerdown="handlePointerDown"
    role="button"
    aria-label="Drag to close or minimize"
    tabindex="0"
    @keydown.space.prevent="toggleDragMode"
    @keydown.enter.prevent="toggleDragMode"
    :class="{ 'dragging': dragging }"
  >
    <div class="drag-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
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

  if (props.onDragStart) {
    props.onDragStart(event)
  }
}

function toggleDragMode() {
  // Handle keyboard activation
  if (props.onDragStart && !dragging.value) {
    dragging.value = true
  }
}
</script>

<style scoped>
.sheet-handle {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  cursor: grab;
  user-select: none;
  width: 100%;
}

.sheet-handle:active {
  cursor: grabbing;
}

.sheet-handle.dragging {
  opacity: 0.7;
}

.drag-indicator {
  width: 40px;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  transition: background-color 0.2s;
}

.sheet-handle:hover .drag-indicator {
  background-color: var(--text-secondary);
}

.sheet-handle:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
