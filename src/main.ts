import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { loadModuleConfig } from '@/modules'
import { createAppRouter } from '@/router'
import { initTheme } from '@/shell'
import '@/shell/tokens.css'
import '@/styles/studio.css'

initTheme()

async function bootstrap() {
  await loadModuleConfig()
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const { useAuthStore } = await import('@mail/features/identity')
  await useAuthStore().initAuth()

  const router = createAppRouter()
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

void bootstrap()
