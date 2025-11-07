/**
 * Composable for UI state management with high-level actions
 */

import { useUIStore } from './stores/ui';

export function useUI() {
  const store = useUIStore();

  return {
    // State
    theme: store.theme,
    isChatSheetOpen: store.isChatSheetOpen,
    isResultSheetOpen: store.isResultSheetOpen,
    isDrawerOpen: store.isDrawerOpen,
    isSettingsOpen: store.isSettingsOpen,
    keyboardInset: store.keyboardInset,
    sheetDragState: store.sheetDragState,
    sheetSnapHeight: store.sheetSnapHeight,

    // Computed
    isDarkMode: store.isDarkMode,

    // Chat sheet
    openChatSheet: store.openChatSheet,
    closeChatSheet: store.closeChatSheet,
    toggleChatSheet: store.toggleChatSheet,

    // Result sheet
    openResultSheet: store.openResultSheet,
    closeResultSheet: store.closeResultSheet,
    toggleResultSheet: store.toggleResultSheet,

    // Drawer
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
    toggleDrawer: store.toggleDrawer,

    // Settings
    openSettings: store.openSettings,
    closeSettings: store.closeSettings,
    toggleSettings: store.toggleSettings,

    // Theme
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme,
    initializeTheme: store.initializeTheme,

    // Keyboard
    updateKeyboardInset: store.updateKeyboardInset,

    // Sheet drag
    setSheetDragState: store.setSheetDragState,
    setSheetSnapHeight: store.setSheetSnapHeight,

    // Utilities
    closeAllSheets: store.closeAllSheets,
    getState: store.getState,
  };
}
