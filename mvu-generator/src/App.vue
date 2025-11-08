<template>
  <div id="app">
    <Layout />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { initializeAllStores } from '../../src/composables/initializeStores'
import Layout from './components/Layout.vue'

onMounted(async () => {
  // Initialize all stores including UI store with proper theme handling
  await initializeAllStores()
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>