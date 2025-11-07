/**
 * Unit tests for UI store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUIStore } from '../ui';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default UI state', () => {
    const store = useUIStore();
    store.initializeTheme();

    expect(store.theme).toBe('light');
    expect(store.isChatSheetOpen).toBe(false);
    expect(store.isResultSheetOpen).toBe(false);
    expect(store.isDrawerOpen).toBe(false);
    expect(store.isDarkMode).toBe(false);
  });

  it('should toggle theme', () => {
    const store = useUIStore();
    store.initializeTheme();

    expect(store.theme).toBe('light');

    store.toggleTheme();
    expect(store.theme).toBe('dark');

    store.toggleTheme();
    expect(store.theme).toBe('light');
  });

  it('should set theme', () => {
    const store = useUIStore();

    store.setTheme('dark');
    expect(store.theme).toBe('dark');

    store.setTheme('light');
    expect(store.theme).toBe('light');
  });

  it('should persist theme to localStorage', () => {
    const store = useUIStore();

    store.setTheme('dark');

    const stored = localStorage.getItem('mvuChat:theme');
    expect(stored).toBe('"dark"');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('mvuChat:theme', '"dark"');

    const store = useUIStore();
    store.initializeTheme();

    expect(store.theme).toBe('dark');
  });

  it('should toggle chat sheet', () => {
    const store = useUIStore();

    expect(store.isChatSheetOpen).toBe(false);

    store.openChatSheet();
    expect(store.isChatSheetOpen).toBe(true);

    store.closeChatSheet();
    expect(store.isChatSheetOpen).toBe(false);

    store.toggleChatSheet();
    expect(store.isChatSheetOpen).toBe(true);
  });

  it('should toggle result sheet', () => {
    const store = useUIStore();

    expect(store.isResultSheetOpen).toBe(false);

    store.openResultSheet();
    expect(store.isResultSheetOpen).toBe(true);

    store.closeResultSheet();
    expect(store.isResultSheetOpen).toBe(false);

    store.toggleResultSheet();
    expect(store.isResultSheetOpen).toBe(true);
  });

  it('should toggle drawer', () => {
    const store = useUIStore();

    expect(store.isDrawerOpen).toBe(false);

    store.openDrawer();
    expect(store.isDrawerOpen).toBe(true);

    store.closeDrawer();
    expect(store.isDrawerOpen).toBe(false);

    store.toggleDrawer();
    expect(store.isDrawerOpen).toBe(true);
  });

  it('should toggle settings', () => {
    const store = useUIStore();

    expect(store.isSettingsOpen).toBe(false);

    store.openSettings();
    expect(store.isSettingsOpen).toBe(true);

    store.closeSettings();
    expect(store.isSettingsOpen).toBe(false);

    store.toggleSettings();
    expect(store.isSettingsOpen).toBe(true);
  });

  it('should update keyboard inset', () => {
    const store = useUIStore();

    expect(store.keyboardInset).toBe(0);

    store.updateKeyboardInset(200);
    expect(store.keyboardInset).toBe(200);

    store.updateKeyboardInset(-50);
    expect(store.keyboardInset).toBe(0); // Should not go negative
  });

  it('should set sheet drag state', () => {
    const store = useUIStore();

    store.setSheetDragState('dragging');
    expect(store.sheetDragState).toBe('dragging');

    store.setSheetDragState('settling');
    expect(store.sheetDragState).toBe('settling');

    store.setSheetDragState('idle');
    expect(store.sheetDragState).toBe('idle');
  });

  it('should set sheet snap height', () => {
    const store = useUIStore();

    store.setSheetSnapHeight('peek');
    expect(store.sheetSnapHeight).toBe('peek');

    store.setSheetSnapHeight('half');
    expect(store.sheetSnapHeight).toBe('half');

    store.setSheetSnapHeight('full');
    expect(store.sheetSnapHeight).toBe('full');
  });

  it('should close all sheets', () => {
    const store = useUIStore();

    store.openChatSheet();
    store.openResultSheet();
    store.openSettings();

    expect(store.isChatSheetOpen).toBe(true);
    expect(store.isResultSheetOpen).toBe(true);
    expect(store.isSettingsOpen).toBe(true);

    store.closeAllSheets();

    expect(store.isChatSheetOpen).toBe(false);
    expect(store.isResultSheetOpen).toBe(false);
    expect(store.isSettingsOpen).toBe(false);
  });

  it('should return state object', () => {
    const store = useUIStore();

    store.setTheme('dark');
    store.openChatSheet();
    store.updateKeyboardInset(150);

    const state = store.getState();

    expect(state.theme).toBe('dark');
    expect(state.isChatSheetOpen).toBe(true);
    expect(state.keyboardInset).toBe(150);
    expect(state.isResultSheetOpen).toBe(false);
  });

  it('should compute isDarkMode correctly', () => {
    const store = useUIStore();

    store.setTheme('light');
    expect(store.isDarkMode).toBe(false);

    store.setTheme('dark');
    expect(store.isDarkMode).toBe(true);
  });
});
