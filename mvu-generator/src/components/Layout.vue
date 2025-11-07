<template>
  <div class="layout">
    <header class="layout-header">
      <h1>MVU Generator</h1>
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </header>
    
    <main class="layout-main">
      <WorkspaceTabs />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import WorkspaceTabs from './WorkspaceTabs.vue'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const toggleTheme = () => {
  appStore.toggleTheme()
}
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.layout-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
}

.layout-main {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>