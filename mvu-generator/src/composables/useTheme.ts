import { ref, watchEffect } from 'vue'

export function useTheme() {
  const isDark = ref(false)

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem('mvu-generator:theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('mvu-generator:theme', isDark.value ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // Initialize on mount
  if (typeof window !== 'undefined') {
    initTheme()
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('mvu-generator:theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
  }

  // Apply theme whenever isDark changes
  watchEffect(applyTheme)

  return {
    isDark,
    toggleTheme
  }
}