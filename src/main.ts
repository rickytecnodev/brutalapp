import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initThemeEarly } from './composables/useTheme'
import { registerSW } from 'virtual:pwa-register'
import './styles/main.css'

initThemeEarly()

registerSW({
  immediate: true,
})

createApp(App).use(router).mount('#app')

// Precarga el worker de PDF.js en idle para abrir partituras más rápido
const warmPdf = (): void => {
  void import('./services/pdfEngine').then((m) => m.ensurePdfWorker())
}
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(warmPdf, { timeout: 2500 })
} else {
  window.setTimeout(warmPdf, 1200)
}
