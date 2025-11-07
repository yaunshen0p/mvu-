import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const generatedArtifacts = ref<Record<string, any>>({})
  const generationMeta = ref<any>(null)

  // Getters
  const isDark = computed(() => theme.value === 'dark')

  // Actions
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setGeneratedArtifacts = (artifacts: Record<string, any>) => {
    generatedArtifacts.value = artifacts
  }

  const setGenerationMeta = (meta: any) => {
    generationMeta.value = meta
  }

  // Watch theme changes and apply to DOM and localStorage
  watchEffect(() => {
    const root = document.documentElement
    if (theme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('mvu-generator:theme', theme.value)
  })

  return {
    // State
    theme,
    generatedArtifacts,
    generationMeta,
    
    // Getters
    isDark,
    
    // Actions
    setTheme,
    toggleTheme,
    setGeneratedArtifacts,
    setGenerationMeta
  }
})