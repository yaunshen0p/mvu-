/**
 * Workspace store for managing code artifacts, templates, and active editor state.
 * Handles HTML, CSS, JavaScript, YAML, MVU Script, and Regex artifacts.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  normaliseArtifacts,
  mergeArtifacts,
  diffArtifacts,
  extractArtifactsFromContent,
  EMPTY_ARTIFACTS,
  WORKSPACE_TABS,
} from '../utils/workspace';

export interface CodeTemplate {
  name: string;
  artifacts: Record<string, string>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceState {
  artifacts: Record<string, string>;
  baseline: Record<string, string>;
  activeTab: string;
  templates: CodeTemplate[];
}

export interface ExportPayload {
  html?: string;
  css?: string;
  javascript?: string;
  yaml?: string;
  script?: string;
  regex?: string;
}

const STORAGE_NAMESPACE = 'mvuChat';
const CODE_TEMPLATES_KEY = 'codeTemplates';

function cloneArtifacts(artifacts: Record<string, string> = {}) {
  return { ...normaliseArtifacts(artifacts) };
}

function readJSON(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(`${STORAGE_NAMESPACE}:${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeJSON(key: string, value: any): void {
  try {
    localStorage.setItem(`${STORAGE_NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    // Silent fail for localStorage errors
  }
}

function sanitiseTemplateEntry(entry: any): CodeTemplate | null {
  if (!entry || typeof entry !== 'object') return null;

  const name = `${entry.name || ''}`.trim();
  if (!name) {
    return null;
  }

  const artifacts = cloneArtifacts(entry.artifacts);

  let createdAt = typeof entry.createdAt === 'string' && entry.createdAt ? entry.createdAt : null;
  let updatedAt = typeof entry.updatedAt === 'string' && entry.updatedAt ? entry.updatedAt : null;

  if (!createdAt && updatedAt) {
    createdAt = updatedAt;
  } else if (!updatedAt && createdAt) {
    updatedAt = createdAt;
  } else if (!createdAt && !updatedAt) {
    const timestamp = new Date().toISOString();
    createdAt = timestamp;
    updatedAt = timestamp;
  }

  const template: CodeTemplate = {
    name,
    artifacts,
    createdAt,
    updatedAt,
  };

  if (typeof entry.description === 'string' && entry.description.trim()) {
    template.description = entry.description.trim();
  }

  return template;
}

function sortTemplates(templates: CodeTemplate[] = []): CodeTemplate[] {
  return [...templates].sort((a, b) => {
    const timeA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const timeB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const artifacts = ref<Record<string, string>>(cloneArtifacts({
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is a sample HTML page.</p>\n</body>\n</html>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n  text-align: center;\n}',
    javascript: 'console.log("Hello from JavaScript!");\n\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Page loaded");\n});',
    yaml: '# Sample YAML Configuration\napp:\n  name: "My App"\n  version: "1.0.0"\n  environment: "development"',
    script: '# MVU Script Example\n\nfunction main() {\n  console.log("MVU Script executed");\n}\n\nmain();',
    regex: '# Sample Regex Patterns\nemail: \\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b\nphone: \\b\\d{3}-\\d{3}-\\d{4}\\b'
  }));
  const baseline = ref<Record<string, string>>(cloneArtifacts());
  const activeTab = ref<string>('html');
  const templates = ref<CodeTemplate[]>([]);

  // Load persisted templates
  function loadTemplates() {
    const stored = readJSON<any[]>(CODE_TEMPLATES_KEY, []);
    if (!Array.isArray(stored)) {
      templates.value = [];
      return;
    }

    templates.value = stored
      .map(sanitiseTemplateEntry)
      .filter((t): t is CodeTemplate => t !== null);
    templates.value = sortTemplates(templates.value);
  }

  // Computed
  const currentArtifact = computed(() => artifacts.value[activeTab.value] || '');

  const unsavedChanges = computed(() => {
    return diffArtifacts(artifacts.value, baseline.value);
  });

  const hasUnsavedChanges = computed(() => {
    return Object.values(unsavedChanges.value).some((changed) => changed);
  });

  // Actions
  function updateArtifacts(patch: Record<string, string>) {
    artifacts.value = mergeArtifacts(artifacts.value, patch);
    persistArtifacts();
  }

  function updateArtifact(tabId: string, content: string) {
    artifacts.value[tabId] = content;
    persistArtifacts();
  }

  function setActiveTab(tabId: string) {
    if (WORKSPACE_TABS.some((tab) => tab.id === tabId)) {
      activeTab.value = tabId;
    }
  }

  function setBaseline(newBaseline: Record<string, string>) {
    baseline.value = normaliseArtifacts(newBaseline);
  }

  function resetToBaseline() {
    artifacts.value = cloneArtifacts(baseline.value);
    persistArtifacts();
  }

  function clearAll() {
    artifacts.value = cloneArtifacts();
    baseline.value = cloneArtifacts();
    activeTab.value = 'html';
  }

  function persistArtifacts() {
    // Note: Artifacts are not persisted in the original code, 
    // but could be added if needed
  }

  function extractArtifacts(content: string) {
    const extracted = extractArtifactsFromContent(content);
    updateArtifacts(extracted);
  }

  function saveTemplate(name: string, templateArtifacts?: Record<string, string>, metadata?: { description?: string }) {
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      throw new Error('Template name is required');
    }

    const timestamp = new Date().toISOString();
    const description = typeof metadata?.description === 'string' && metadata.description.trim() ? metadata.description.trim() : undefined;
    const artifactsToSave = cloneArtifacts(templateArtifacts || artifacts.value);

    const existingIndex = templates.value.findIndex((t) => t.name === trimmedName);

    let target: CodeTemplate;

    if (existingIndex >= 0) {
      const existing = templates.value[existingIndex];
      target = {
        ...existing,
        name: trimmedName,
        artifacts: artifactsToSave,
        updatedAt: timestamp,
      };

      if (!target.createdAt) {
        target.createdAt = existing.createdAt || timestamp;
      }

      if (description !== undefined) {
        target.description = description;
      }

      templates.value[existingIndex] = target;
    } else {
      target = {
        name: trimmedName,
        artifacts: artifactsToSave,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (description !== undefined) {
        target.description = description;
      }

      templates.value.push(target);
    }

    templates.value = sortTemplates(templates.value);
    persistTemplates();

    return {
      template: { ...target, artifacts: cloneArtifacts(target.artifacts) },
      templates: templates.value.map((t) => ({
        ...t,
        artifacts: cloneArtifacts(t.artifacts),
      })),
    };
  }

  function loadTemplate(name: string) {
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      return null;
    }

    const match = templates.value.find((t) => t.name === trimmedName);
    return match
      ? {
          ...match,
          artifacts: cloneArtifacts(match.artifacts),
        }
      : null;
  }

  function deleteTemplate(name: string) {
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      return {
        removed: null,
        templates: templates.value.map((t) => ({
          ...t,
          artifacts: cloneArtifacts(t.artifacts),
        })),
      };
    }

    const index = templates.value.findIndex((t) => t.name === trimmedName);

    if (index === -1) {
      return {
        removed: null,
        templates: templates.value.map((t) => ({
          ...t,
          artifacts: cloneArtifacts(t.artifacts),
        })),
      };
    }

    const [removed] = templates.value.splice(index, 1);
    templates.value = sortTemplates(templates.value);
    persistTemplates();

    return {
      removed: removed ? { ...removed, artifacts: cloneArtifacts(removed.artifacts) } : null,
      templates: templates.value.map((t) => ({
        ...t,
        artifacts: cloneArtifacts(t.artifacts),
      })),
    };
  }

  function renameTemplate(oldName: string, newName: string) {
    const from = typeof oldName === 'string' ? oldName.trim() : '';
    const to = typeof newName === 'string' ? newName.trim() : '';

    if (!from || !to) {
      throw new Error('Both template names are required');
    }

    const index = templates.value.findIndex((t) => t.name === from);

    if (index === -1) {
      throw new Error(`Template "${from}" not found`);
    }

    const timestamp = new Date().toISOString();
    const current = templates.value[index];

    const updatedTemplate: CodeTemplate = {
      ...current,
      name: to,
      artifacts: cloneArtifacts(current.artifacts),
      updatedAt: timestamp,
    };

    if (!updatedTemplate.createdAt) {
      updatedTemplate.createdAt = current.createdAt || timestamp;
    }

    const withoutConflicts = templates.value.filter((t, idx) => idx !== index && t.name !== to);
    withoutConflicts.push(updatedTemplate);

    templates.value = sortTemplates(withoutConflicts);
    persistTemplates();

    return {
      template: { ...updatedTemplate, artifacts: cloneArtifacts(updatedTemplate.artifacts) },
      templates: templates.value.map((t) => ({
        ...t,
        artifacts: cloneArtifacts(t.artifacts),
      })),
    };
  }

  function persistTemplates() {
    const payload = templates.value.map((template) => {
      const base = {
        name: template.name,
        artifacts: cloneArtifacts(template.artifacts),
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };

      if (template.description) {
        (base as any).description = template.description;
      }

      return base;
    });

    writeJSON(CODE_TEMPLATES_KEY, payload);
  }

  function generateExports(): ExportPayload {
    return {
      html: artifacts.value.html,
      css: artifacts.value.css,
      javascript: artifacts.value.javascript,
      yaml: artifacts.value.yaml,
      script: artifacts.value.script,
      regex: artifacts.value.regex,
    };
  }

  function getState(): WorkspaceState {
    return {
      artifacts: cloneArtifacts(artifacts.value),
      baseline: cloneArtifacts(baseline.value),
      activeTab: activeTab.value,
      templates: templates.value.map((t) => ({
        ...t,
        artifacts: cloneArtifacts(t.artifacts),
      })),
    };
  }

  return {
    // State
    artifacts,
    baseline,
    activeTab,
    templates,

    // Computed
    currentArtifact,
    unsavedChanges,
    hasUnsavedChanges,

    // Actions
    updateArtifacts,
    updateArtifact,
    setActiveTab,
    setBaseline,
    resetToBaseline,
    clearAll,
    persistArtifacts,
    extractArtifacts,
    saveTemplate,
    loadTemplate,
    loadTemplates,
    deleteTemplate,
    renameTemplate,
    persistTemplates,
    generateExports,
    getState,
  };
});