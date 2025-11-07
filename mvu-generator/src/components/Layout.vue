<template>
  <div class="layout">
    <header class="layout-header">
      <h1>MVU Generator</h1>
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </header>
    
    <main class="layout-main">
      <div class="placeholder-content">
        <h2>Vue 3 + Vite Scaffold</h2>
        <p>This is a placeholder layout component.</p>
        <p>Current theme: {{ isDark ? 'Dark' : 'Light' }}</p>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>Monaco Editor</h3>
            <MonacoEditor />
          </div>
          <div class="feature-card">
            <h3>Chat Interface</h3>
            <p>Ready for integration</p>
          </div>
          <div class="feature-card">
            <h3>Code Workspace</h3>
            <p>Ready for integration</p>
          </div>
          <div class="feature-card">
            <h3>Variable Editor</h3>
            <p>Ready for integration</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import MonacoEditor from './MonacoEditor.vue'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const toggleTheme = () => {
  appStore.toggleTheme()
}

onMounted(() => {
  console.log('Vue 3 + Vite scaffold successfully mounted')
})
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
  overflow: auto;
  padding: 2rem;
}

.placeholder-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.placeholder-content h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.placeholder-content p {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.feature-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.feature-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>