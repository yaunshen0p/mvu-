<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        @click="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
      >
        <div
          class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        ></div>

        <div
          ref="modalRef"
          class="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all dark:bg-slate-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          @click.stop
        >
          <form @submit.prevent="handleSubmit">
            <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 id="settings-title" class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                API Settings
              </h2>
              <button
                type="button"
                class="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Close settings"
                @click="handleClose"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto px-6 py-5">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Your credentials are stored locally in your browser and only sent to the configured API endpoint.
              </p>

              <div class="space-y-1.5">
                <label for="provider" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Provider
                </label>
                <select
                  id="provider"
                  v-model="draft.providerType"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-400"
                  @change="handleProviderChange"
                >
                  <option v-for="(preset, key) in providerPresets" :key="key" :value="key">
                    {{ preset.label }}
                  </option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="baseUrl" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Base URL
                </label>
                <input
                  id="baseUrl"
                  v-model="draft.baseUrl"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
                  placeholder="https://api.openai.com/v1"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label for="apiKey" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  API Key
                </label>
                <input
                  id="apiKey"
                  v-model="draft.apiKey"
                  type="password"
                  class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
                  placeholder="sk-..."
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label for="model" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Default Model
                </label>
                <input
                  id="model"
                  v-model="draft.defaultModel"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
                  placeholder="gpt-4o-mini"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label for="headers" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Custom Headers (JSON)
                </label>
                <textarea
                  id="headers"
                  v-model="headersInput"
                  rows="4"
                  class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
                  placeholder='{"Custom-Header": "value"}'
                  @input="clearError"
                ></textarea>
              </div>

              <Transition name="fade">
                <div v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {{ error }}
                </div>
              </Transition>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button
                type="button"
                class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                @click="handleReset"
              >
                Reset to Defaults
              </button>
              <div class="flex gap-3">
                <button
                  v-if="canCancel"
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  @click="handleClose"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSettingsStore } from '@shared/composables/stores/settings'
import { useUIStore } from '@shared/composables/stores/ui'
import { normalizeHeadersDraft } from '@shared/composables/utils/validation'

interface ProviderPreset {
  label: string
  baseUrl: string
}

const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  openai: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
  },
  azure: {
    label: 'Azure OpenAI',
    baseUrl: '',
  },
  openrouter: {
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
  },
  custom: {
    label: 'Custom',
    baseUrl: '',
  },
}

const settingsStore = useSettingsStore()
const uiStore = useUIStore()

const modalRef = ref<HTMLElement | null>(null)
const draft = ref({
  providerType: '',
  baseUrl: '',
  apiKey: '',
  defaultModel: '',
})
const headersInput = ref('')
const error = ref('')
const isSubmitting = ref(false)

const isOpen = computed(() => uiStore.isSettingsOpen)
const canCancel = computed(() => settingsStore.hasApiCredentials)
const providerPresets = PROVIDER_PRESETS

function initializeDraft() {
  const state = settingsStore.getState()
  draft.value = {
    providerType: state.providerType || 'openai',
    baseUrl: state.baseUrl || PROVIDER_PRESETS.openai.baseUrl,
    apiKey: state.apiKey || '',
    defaultModel: state.defaultModel || 'gpt-3.5-turbo',
  }
  
  if (state.headers && Object.keys(state.headers).length > 0) {
    headersInput.value = JSON.stringify(state.headers, null, 2)
  } else {
    headersInput.value = ''
  }
  
  error.value = ''
}

function handleProviderChange() {
  const preset = PROVIDER_PRESETS[draft.value.providerType]
  if (preset?.baseUrl) {
    draft.value.baseUrl = preset.baseUrl
  }
}

function handleSubmit() {
  if (isSubmitting.value) return
  
  error.value = ''
  isSubmitting.value = true
  
  try {
    const headers = normalizeHeadersDraft(headersInput.value)
    
    const sanitized = {
      providerType: draft.value.providerType.trim() || 'openai',
      baseUrl: draft.value.baseUrl.trim(),
      apiKey: draft.value.apiKey.trim(),
      defaultModel: draft.value.defaultModel.trim(),
      headers,
    }
    
    settingsStore.updateSettings(sanitized)
    
    uiStore.closeSettings()
  } catch (validationError: any) {
    error.value = validationError.message || 'Invalid settings'
  } finally {
    isSubmitting.value = false
  }
}

function handleReset() {
  if (confirm('Are you sure you want to reset all settings to defaults? This will clear your API key.')) {
    settingsStore.clearSettings()
    uiStore.openSettings()
    initializeDraft()
  }
}

function handleClose() {
  if (canCancel.value) {
    uiStore.closeSettings()
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget && canCancel.value) {
    handleClose()
  }
}

function handleEscapeKey() {
  if (canCancel.value) {
    handleClose()
  }
}

function clearError() {
  error.value = ''
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !modalRef.value) return
  
  const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(isOpen, async (newValue) => {
  if (newValue) {
    initializeDraft()
    await nextTick()
    
    if (modalRef.value) {
      const firstInput = modalRef.value.querySelector<HTMLElement>('input, select, textarea')
      firstInput?.focus()
    }
    
    document.addEventListener('keydown', trapFocus)
  } else {
    document.removeEventListener('keydown', trapFocus)
  }
})

onMounted(() => {
  if (isOpen.value) {
    initializeDraft()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 360px) {
  .relative {
    max-height: 90vh;
  }
}
</style>
