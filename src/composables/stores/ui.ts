/**
 * UI store for managing UI state like theme, drawer visibility, sheet state, and keyboard handling.
 * Handles light/dark mode, bottom sheet visibility, and keyboard inset for mobile.
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useStorageNamespace } from '../utils/storage';

export interface UIState {
  theme: 'light' | 'dark';
  isChatSheetOpen: boolean;
  isResultSheetOpen: boolean;
  isDrawerOpen: boolean;
  isSettingsOpen: boolean;
  keyboardInset: number;
  sheetDragState: 'idle' | 'dragging' | 'settling';
  sheetSnapHeight: 'peek' | 'half' | 'full';
}

const STORAGE_NAMESPACE = 'mvuChat';
const THEME_KEY = 'theme';

export const useUIStore = defineStore('ui', () => {
  const storage = useStorageNamespace(STORAGE_NAMESPACE);

  // State
  const theme = ref<'light' | 'dark'>('light');
  const isChatSheetOpen = ref(false);
  const isResultSheetOpen = ref(false);
  const isDrawerOpen = ref(false);
  const isSettingsOpen = ref(false);
  const keyboardInset = ref(0);
  const sheetDragState = ref<'idle' | 'dragging' | 'settling'>('idle');
  const sheetSnapHeight = ref<'peek' | 'half' | 'full'>('half');

  // Initialize theme from storage or system preference
  function initializeTheme() {
    const stored = storage.read<string>(THEME_KEY, '');

    if (stored === 'light' || stored === 'dark') {
      theme.value = stored;
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      // Check system preference
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      theme.value = 'light';
    }

    applyTheme();
  }

  // Computed
  const isDarkMode = computed(() => theme.value === 'dark');

  // Watch theme changes and persist
  watch(theme, (newTheme) => {
    storage.write(THEME_KEY, newTheme);
    applyTheme();
  });

  // Actions
  function applyTheme() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme.value === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
  }

  function openChatSheet() {
    isChatSheetOpen.value = true;
  }

  function closeChatSheet() {
    isChatSheetOpen.value = false;
  }

  function toggleChatSheet() {
    isChatSheetOpen.value = !isChatSheetOpen.value;
  }

  function openResultSheet() {
    isResultSheetOpen.value = true;
  }

  function closeResultSheet() {
    isResultSheetOpen.value = false;
  }

  function toggleResultSheet() {
    isResultSheetOpen.value = !isResultSheetOpen.value;
  }

  function openDrawer() {
    isDrawerOpen.value = true;
  }

  function closeDrawer() {
    isDrawerOpen.value = false;
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value;
  }

  function openSettings() {
    isSettingsOpen.value = true;
  }

  function closeSettings() {
    isSettingsOpen.value = false;
  }

  function toggleSettings() {
    isSettingsOpen.value = !isSettingsOpen.value;
  }

  function updateKeyboardInset(inset: number) {
    keyboardInset.value = Math.max(0, inset);
  }

  function setSheetDragState(state: 'idle' | 'dragging' | 'settling') {
    sheetDragState.value = state;
  }

  function setSheetSnapHeight(height: 'peek' | 'half' | 'full') {
    sheetSnapHeight.value = height;
  }

  function closeAllSheets() {
    isChatSheetOpen.value = false;
    isResultSheetOpen.value = false;
    isSettingsOpen.value = false;
  }

  function getState(): UIState {
    return {
      theme: theme.value,
      isChatSheetOpen: isChatSheetOpen.value,
      isResultSheetOpen: isResultSheetOpen.value,
      isDrawerOpen: isDrawerOpen.value,
      isSettingsOpen: isSettingsOpen.value,
      keyboardInset: keyboardInset.value,
      sheetDragState: sheetDragState.value,
      sheetSnapHeight: sheetSnapHeight.value,
    };
  }

  return {
    // State
    theme,
    isChatSheetOpen,
    isResultSheetOpen,
    isDrawerOpen,
    isSettingsOpen,
    keyboardInset,
    sheetDragState,
    sheetSnapHeight,

    // Computed
    isDarkMode,

    // Actions
    initializeTheme,
    applyTheme,
    toggleTheme,
    setTheme,
    openChatSheet,
    closeChatSheet,
    toggleChatSheet,
    openResultSheet,
    closeResultSheet,
    toggleResultSheet,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    openSettings,
    closeSettings,
    toggleSettings,
    updateKeyboardInset,
    setSheetDragState,
    setSheetSnapHeight,
    closeAllSheets,
    getState,
  };
});
