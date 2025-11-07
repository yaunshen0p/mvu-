/**
 * Unit tests for workspace store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorkspaceStore } from '../workspace';

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

describe('Workspace Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('should initialize with empty artifacts', () => {
    const store = useWorkspaceStore();

    expect(store.artifacts).toBeDefined();
    expect(store.artifacts.html).toBe('');
    expect(store.artifacts.css).toBe('');
    expect(store.artifacts.javascript).toBe('');
  });

  it('should set active tab', () => {
    const store = useWorkspaceStore();

    store.setActiveTab('css');
    expect(store.activeTab).toBe('css');

    store.setActiveTab('javascript');
    expect(store.activeTab).toBe('javascript');
  });

  it('should update artifact', () => {
    const store = useWorkspaceStore();

    const htmlCode = '<div>Hello</div>';
    store.updateArtifact('html', htmlCode);

    expect(store.artifacts.html).toBe(htmlCode);
    expect(store.currentArtifact).toBe(htmlCode);
  });

  it('should update multiple artifacts at once', () => {
    const store = useWorkspaceStore();

    const updates = {
      html: '<div>Test</div>',
      css: '.div { color: red; }',
      javascript: 'console.log("test");',
    };

    store.updateArtifacts(updates);

    expect(store.artifacts.html).toBe(updates.html);
    expect(store.artifacts.css).toBe(updates.css);
    expect(store.artifacts.javascript).toBe(updates.javascript);
  });

  it('should track unsaved changes', () => {
    const store = useWorkspaceStore();

    const baseline = {
      html: '<div>Original</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    };

    store.setBaseline(baseline);

    expect(store.hasUnsavedChanges).toBe(false);

    store.updateArtifact('html', '<div>Modified</div>');

    expect(store.hasUnsavedChanges).toBe(true);
    expect(store.unsavedChanges.html).toBe(true);
  });

  it('should reset to baseline', () => {
    const store = useWorkspaceStore();

    const baseline = {
      html: '<div>Original</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    };

    store.setBaseline(baseline);
    store.updateArtifact('html', '<div>Modified</div>');

    expect(store.artifacts.html).toBe('<div>Modified</div>');

    store.resetToBaseline();

    expect(store.artifacts.html).toBe('<div>Original</div>');
  });

  it('should save template', () => {
    const store = useWorkspaceStore();

    store.updateArtifacts({
      html: '<div>Template Content</div>',
      css: '.div { margin: 10px; }',
    });

    const result = store.saveTemplate('My Template', undefined, {
      description: 'A test template',
    });

    expect(result.template.name).toBe('My Template');
    expect(result.template.description).toBe('A test template');
    expect(result.template.artifacts.html).toBe('<div>Template Content</div>');
  });

  it('should load template', () => {
    const store = useWorkspaceStore();

    store.saveTemplate('Template A', {
      html: '<div>Content A</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    });

    const loaded = store.loadTemplate('Template A');

    expect(loaded).toBeTruthy();
    expect(loaded?.name).toBe('Template A');
    expect(loaded?.artifacts.html).toBe('<div>Content A</div>');
  });

  it('should delete template', () => {
    const store = useWorkspaceStore();

    store.saveTemplate('Template To Delete', {
      html: '<div>Delete me</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    });

    expect(store.templates.length).toBe(1);

    const result = store.deleteTemplate('Template To Delete');

    expect(result.removed).toBeTruthy();
    expect(store.templates.length).toBe(0);
  });

  it('should rename template', () => {
    const store = useWorkspaceStore();

    store.saveTemplate('Old Name', {
      html: '<div>Content</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    });

    const result = store.renameTemplate('Old Name', 'New Name');

    expect(result.template.name).toBe('New Name');
    expect(store.loadTemplate('New Name')).toBeTruthy();
    expect(store.loadTemplate('Old Name')).toBe(null);
  });

  it('should persist templates to localStorage', () => {
    const store = useWorkspaceStore();

    store.saveTemplate('Saved Template', {
      html: '<div>Persisted</div>',
      css: '',
      javascript: '',
      yaml: '',
      script: '',
      regex: '',
    });

    const raw = localStorage.getItem('mvuChat:codeTemplates');
    expect(raw).toBeTruthy();

    const persisted = JSON.parse(raw!);
    expect(persisted.length).toBe(1);
    expect(persisted[0].name).toBe('Saved Template');
  });

  it('should generate export payload', () => {
    const store = useWorkspaceStore();

    store.updateArtifacts({
      html: '<html></html>',
      css: 'body {}',
      javascript: 'console.log();',
      yaml: 'key: value',
      script: 'script code',
      regex: 'pattern',
    });

    const exports = store.generateExports();

    expect(exports.html).toBe('<html></html>');
    expect(exports.css).toBe('body {}');
    expect(exports.javascript).toBe('console.log();');
  });

  it('should clear all artifacts', () => {
    const store = useWorkspaceStore();

    store.updateArtifacts({
      html: '<div>Content</div>',
      css: 'body {}',
    });

    store.clearAll();

    expect(store.artifacts.html).toBe('');
    expect(store.artifacts.css).toBe('');
    expect(store.templates.length).toBe(0);
  });

  it('should return state object', () => {
    const store = useWorkspaceStore();

    store.updateArtifacts({
      html: '<div>Test</div>',
      css: 'div {}',
    });

    store.setActiveTab('css');

    const state = store.getState();

    expect(state.artifacts).toBeDefined();
    expect(state.baseline).toBeDefined();
    expect(state.activeTab).toBe('css');
    expect(state.templates).toEqual([]);
  });
});
