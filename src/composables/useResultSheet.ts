import { computed } from 'vue'
import { useUIStore } from './stores/ui'
import { useWorkspaceStore } from './stores/workspace'

export function useResultSheet() {
  const ui = useUIStore()
  const workspace = useWorkspaceStore()

  const isOpen = computed(() => ui.isResultSheetOpen)
  
  const exportPayload = computed(() => workspace.generateExports())

  function open() {
    ui.openResultSheet()
  }

  function close() {
    ui.closeResultSheet()
  }

  function toggle() {
    ui.toggleResultSheet()
  }

  function handleExportAll() {
    workspace.exportAsJson()
  }

  return {
    isOpen,
    exportPayload,
    open,
    close,
    toggle,
    handleExportAll,
  }
}
