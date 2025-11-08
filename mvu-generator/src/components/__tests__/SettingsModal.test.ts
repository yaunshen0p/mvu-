import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsModal from '../SettingsModal.vue'
import { useSettingsStore } from '@shared/composables/stores/settings'
import { useUIStore } from '@shared/composables/stores/ui'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('SettingsModal', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    localStorage.clear()
  })

  it('should render when isSettingsOpen is true', async () => {
    const uiStore = useUIStore()
    uiStore.openSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(document.body.textContent).toContain('API Settings')
  })

  it('should not render dialog when isSettingsOpen is false', async () => {
    const uiStore = useUIStore()
    uiStore.closeSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeFalsy()
  })

  it('should display error for invalid headers JSON', async () => {
    const uiStore = useUIStore()
    const settingsStore = useSettingsStore()
    settingsStore.updateApiKey('test-key')
    uiStore.openSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const headersTextarea = document.querySelector('#headers') as HTMLTextAreaElement
    expect(headersTextarea).toBeTruthy()
    
    headersTextarea.value = '{invalid json}'
    headersTextarea.dispatchEvent(new Event('input'))

    await flushPromises()

    const form = document.querySelector('form')
    form?.dispatchEvent(new Event('submit', { cancelable: true }))

    await flushPromises()

    expect(document.body.textContent).toContain('Custom headers must be valid JSON object')
  })

  it('should close modal on successful submit', async () => {
    const settingsStore = useSettingsStore()
    const uiStore = useUIStore()

    settingsStore.updateSettings({
      providerType: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'existing-key',
      defaultModel: 'gpt-3.5-turbo',
      headers: {},
    })

    uiStore.openSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const apiKeyInput = document.querySelector('#apiKey') as HTMLInputElement
    expect(apiKeyInput).toBeTruthy()
    
    apiKeyInput.value = 'new-test-key-123'
    apiKeyInput.dispatchEvent(new Event('input'))

    await flushPromises()

    const form = document.querySelector('form')
    form?.dispatchEvent(new Event('submit', { cancelable: true }))

    await flushPromises()

    expect(uiStore.isSettingsOpen).toBe(false)
    expect(settingsStore.apiKey).toBe('new-test-key-123')
  })

  it('should update baseUrl when provider changes', async () => {
    const uiStore = useUIStore()
    uiStore.openSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const providerSelect = document.querySelector('#provider') as HTMLSelectElement
    expect(providerSelect).toBeTruthy()
    
    providerSelect.value = 'openrouter'
    providerSelect.dispatchEvent(new Event('change'))

    await flushPromises()

    const baseUrlInput = document.querySelector('#baseUrl') as HTMLInputElement
    expect(baseUrlInput.value).toBe('https://openrouter.ai/api/v1')
  })

  it('should parse valid headers JSON', async () => {
    const settingsStore = useSettingsStore()
    const uiStore = useUIStore()

    uiStore.openSettings()

    wrapper = mount(SettingsModal, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: false,
        },
      },
    })

    await flushPromises()

    const headersTextarea = document.querySelector('#headers') as HTMLTextAreaElement
    expect(headersTextarea).toBeTruthy()
    
    headersTextarea.value = '{"Authorization": "Bearer token", "X-Custom": "value"}'
    headersTextarea.dispatchEvent(new Event('input'))

    const apiKeyInput = document.querySelector('#apiKey') as HTMLInputElement
    apiKeyInput.value = 'test-key-12345678'
    apiKeyInput.dispatchEvent(new Event('input'))

    await flushPromises()

    const form = document.querySelector('form')
    form?.dispatchEvent(new Event('submit', { cancelable: true }))

    await flushPromises()

    expect(settingsStore.headers).toEqual({
      Authorization: 'Bearer token',
      'X-Custom': 'value',
    })
  })
})
