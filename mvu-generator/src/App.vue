<template>
  <div id="app">
    <Layout />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Layout from './components/Layout.vue'

const appStore = useAppStore()

onMounted(() => {
  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('mvu-generator:theme') as 'light' | 'dark' | null
  if (savedTheme) {
    appStore.setTheme(savedTheme)
  } else {
    appStore.setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>