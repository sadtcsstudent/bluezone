import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import nl from '../locales/nl.json'

// Get saved locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    nl
  }
})

export default i18n
