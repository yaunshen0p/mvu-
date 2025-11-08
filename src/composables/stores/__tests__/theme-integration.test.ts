/**
 * Integration tests for theme switching and CSS variable updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUIStore } from '../ui';

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

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('should apply dark class to document root when theme is set to dark', () => {
    const store = useUIStore();
    
    store.setTheme('dark');
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should remove dark class from document root when theme is set to light', () => {
    const store = useUIStore();
    
    store.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    store.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle theme and apply CSS classes correctly', () => {
    const store = useUIStore();
    
    store.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    store.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    store.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should persist theme changes to localStorage', () => {
    const store = useUIStore();
    
    store.setTheme('dark');
    let stored = localStorage.getItem('mvuChat:theme');
    expect(stored).toBe('"dark"');
    
    store.setTheme('light');
    stored = localStorage.getItem('mvuChat:theme');
    expect(stored).toBe('"light"');
  });

  it('should restore theme from localStorage on initialization', () => {
    localStorage.setItem('mvuChat:theme', '"dark"');
    
    const store = useUIStore();
    store.initializeTheme();
    
    expect(store.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should handle system preference when no stored theme exists', () => {
    const mockMatchMedia = vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const store = useUIStore();
    store.initializeTheme();
    
    expect(store.theme).toBe('dark');
  });

  it('should update computed isDarkMode when theme changes', () => {
    const store = useUIStore();
    
    store.setTheme('light');
    expect(store.isDarkMode).toBe(false);
    
    store.setTheme('dark');
    expect(store.isDarkMode).toBe(true);
  });

  it('should apply theme on applyTheme() call', () => {
    const store = useUIStore();
    
    store.setTheme('dark');
    store.applyTheme();
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should maintain color-scheme CSS property with theme', () => {
    const store = useUIStore();
    
    store.setTheme('light');
    const lightScheme = getComputedStyle(document.documentElement).colorScheme;
    
    store.setTheme('dark');
    const darkScheme = getComputedStyle(document.documentElement).colorScheme;
    
    // CSS variables should be updated
    expect(store.isDarkMode).toBe(true);
  });

  it('should handle multiple rapid theme toggles correctly', () => {
    const store = useUIStore();
    
    for (let i = 0; i < 5; i++) {
      store.toggleTheme();
    }
    
    // After 5 toggles, should be dark (started at light)
    expect(store.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    store.toggleTheme();
    expect(store.theme).toBe('light');
  });

  it('should sync theme state across multiple store instances', () => {
    const store1 = useUIStore();
    const store2 = useUIStore();
    
    store1.setTheme('dark');
    
    expect(store2.theme).toBe('dark');
    expect(store2.isDarkMode).toBe(true);
  });

  it('should apply theme immediately when initialized', () => {
    const store = useUIStore();
    
    store.setTheme('dark');
    store.initializeTheme();
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
