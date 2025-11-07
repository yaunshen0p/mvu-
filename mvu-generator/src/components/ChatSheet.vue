<template>
  <Teleport to="body">
    <Transition
      name="sheet"
      @enter="handleEnter"
      @leave="handleLeave"
    >
      <div v-if="isOpen" class="chat-sheet-overlay">
        <div
          class="chat-sheet"
          :class="[sheetClass, { 'dragging': isDragging, 'keyboard-visible': keyboardInset > 0 }]"
          :style="sheetStyles"
          @pointerdown.self="startDrag"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-sheet-title"
        >
          <ChatHeader
            id="chat-sheet-title"
            :onClose="handleClose"
            :onDragStart="handleDragStart"
            :onDragEnd="handleDragEnd"
            :subtitle="`${messages.length} message${messages.length !== 1 ? 's' : ''}`"
          />

          <ChatMessageList
            :messages="messages"
            :is-loading="isLoading"
          />

          <ChatComposer
            :key="`composer-${keyboardInset}`"
            @send="handleSendMessage"
            @stop="handleStop"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUI, useChat, useKeyboardInset } from '@@/composables'
import ChatHeader from './ChatHeader.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatComposer from './ChatComposer.vue'

const ui = useUI()
const chat = useChat()
const { keyboardInset } = useKeyboardInset()

const isOpen = computed(() => ui.isChatSheetOpen)
const messages = computed(() => chat.messages)
const isLoading = computed(() => chat.isLoading)

const isDragging = ref(false)
const dragStartY = ref(0)
const dragOffset = ref(0)
const sheetHeight = ref(0)

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

  if (isMobile.value && keyboardInset.value > 0) {
    baseStyles.paddingBottom = `${Math.min(keyboardInset.value, 200)}px`
  }

  return baseStyles
})

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
  ui.closeChatSheet()
}

function handleSendMessage(message: string) {
  chat.sendMessage(message).catch(err => {
    console.error('Failed to send message:', err)
  })
}

function handleStop() {
  chat.abortCurrentRequest()
}

// Initialize on mount
onMounted(() => {
  chat.loadChatHistory()

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
watch(isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
})
</script>

<style scoped>
.chat-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  pointer-events: none;
}

.chat-sheet {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.dark .chat-sheet {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Mobile: Bottom Sheet */
.sheet-bottom-modal {
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  border-radius: 1rem 1rem 0 0;
  z-index: 40;
}

/* Desktop: Side Overlay */
.sheet-side-overlay {
  top: 0;
  right: 0;
  width: 100%;
  max-width: 480px;
  height: 100vh;
  border-radius: 0;
  z-index: 40;
}

.chat-sheet.keyboard-visible {
  transition: padding-bottom 0.3s ease-out;
}

.chat-sheet.dragging {
  transition: none;
}

/* Enter/Leave Transitions */
.sheet-enter-active {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet-leave-active {
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
  .sheet-enter-active {
    animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sheet-leave-active {
    animation: slideOutToRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 640px) {
  .sheet-bottom-modal {
    max-height: 90vh;
  }
}

/* Prevent body scroll when sheet is open */
:global(body.chat-sheet-open) {
  overflow: hidden;
}
</style>
