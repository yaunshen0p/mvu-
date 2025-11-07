/**
 * Composable for tracking keyboard inset on mobile devices.
 * Monitors window.visualViewport height changes and updates UI store accordingly.
 */

import { onMounted, onUnmounted } from 'vue';
import { useUIStore } from './stores/ui';

export function useKeyboardInset() {
  const uiStore = useUIStore();

  function handleVisualViewportChange() {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const viewport = window.visualViewport;
      const screenHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const inset = Math.max(0, screenHeight - viewportHeight);
      uiStore.updateKeyboardInset(inset);
    }
  }

  function handleWindowResize() {
    const inset = Math.max(0, window.innerHeight - (window.visualViewport?.height || window.innerHeight));
    uiStore.updateKeyboardInset(inset);
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Listen to visualViewport changes (most reliable for mobile keyboard detection)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      }
      // Fallback for browsers that don't support visualViewport
      window.addEventListener('resize', handleWindowResize);

      // Initial check
      handleVisualViewportChange();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
      window.removeEventListener('resize', handleWindowResize);
    }
  });

  return {
    keyboardInset: uiStore.keyboardInset,
  };
}
