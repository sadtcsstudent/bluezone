import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { loadI18nOverrides } from './i18n'
import './assets/main.css'

const init = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  await loadI18nOverrides()
  watch(
    () => i18n.global.locale.value,
    (locale) => {
      loadI18nOverrides(locale)
    }
  )

  app.mount('#app')
}

init()
