import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistencePlugin } from '@@/composables/plugins/persistencePlugin'
import App from './App.vue'
import './index.css'

const app = createApp(App)
const pinia = createPinia()

// Add persistence plugin
pinia.use(createPersistencePlugin())

app.use(pinia)

// Mount the app
app.mount('#app')