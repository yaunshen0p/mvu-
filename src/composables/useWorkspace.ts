/**
 * Composable for workspace management with high-level actions
 */

import { useWorkspaceStore } from './stores/workspace';

export function useWorkspace() {
  const store = useWorkspaceStore();

  return {
    // State
    artifacts: store.artifacts,
    baseline: store.baseline,
    activeTab: store.activeTab,
    templates: store.templates,

    // Computed
    currentArtifact: store.currentArtifact,
    unsavedChanges: store.unsavedChanges,
    hasUnsavedChanges: store.hasUnsavedChanges,

    // Actions
    updateArtifact: store.updateArtifact,
    updateArtifacts: store.updateArtifacts,
    setActiveTab: store.setActiveTab,
    setBaseline: store.setBaseline,
    resetToBaseline: store.resetToBaseline,
    clearAll: store.clearAll,
    extractArtifacts: store.extractArtifacts,

    // Template actions
    saveTemplate: store.saveTemplate,
    loadTemplate: store.loadTemplate,
    loadTemplates: store.loadTemplates,
    deleteTemplate: store.deleteTemplate,
    renameTemplate: store.renameTemplate,

    // Export
    generateExports: store.generateExports,
    getState: store.getState,
  };
}
