import { createI18n } from 'vue-i18n'
import api from '../services/api'
import en from '../locales/en.json'
import nl from '../locales/nl.json'
import { unflattenMessages } from '../utils/i18n'
import { setOverrideFormats } from './overrides'

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

const baseMessages = { en, nl }
const MAX_I18N_RETRIES = 2
const I18N_RETRY_DELAY_MS = 1500

const scheduleI18nRetry = (locale, attempt) => {
  if (attempt >= MAX_I18N_RETRIES) return
  const delay = I18N_RETRY_DELAY_MS * Math.pow(2, attempt)
  setTimeout(() => {
    loadI18nOverrides(locale, attempt + 1)
  }, delay)
}

export const loadI18nOverrides = async (locale = i18n.global.locale.value, attempt = 0) => {
  try {
    const currentLocale = locale || 'en'
    const data = await api.get(`/i18n/overrides?locale=${currentLocale}`)

    i18n.global.setLocaleMessage(currentLocale, baseMessages[currentLocale] || {})
    if (data?.overrides) {
      const merged = unflattenMessages(data.overrides)
      i18n.global.mergeLocaleMessage(currentLocale, merged)
    }

    if (data?.formats) {
      setOverrideFormats(data.formats)
    }
  } catch (err) {
    console.warn('Failed to load i18n overrides', err)
    scheduleI18nRetry(locale, attempt)
  }
}

export default i18n
