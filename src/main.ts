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
