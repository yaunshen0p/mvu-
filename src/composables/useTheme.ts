/**
 * Composable for theme management with high-level actions
 */

import { useUIStore } from './stores/ui';

export function useTheme() {
  const store = useUIStore();

  return {
    // State
    theme: store.theme,

    // Computed
    isDarkMode: store.isDarkMode,

    // Actions
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme,
    applyTheme: store.applyTheme,
    initializeTheme: store.initializeTheme,
  };
}
