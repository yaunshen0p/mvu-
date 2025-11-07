<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUI } from '../../../src/composables/useUI'
import AppLayout from './layout/AppLayout.vue'

const { initializeTheme } = useUI()

onMounted(() => {
  // Initialize theme and UI state
  initializeTheme()
  console.log('AppLayout with navigation shell mounted successfully')
})
</script>

<style scoped>
/* Layout component is now just a wrapper for AppLayout */
</style>