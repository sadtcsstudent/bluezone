import { useI18n } from 'vue-i18n'

export function useTranslateCategory() {
  const { t } = useI18n()

  const translateCategory = (category) => {
    if (!category) return ''

    // If category is an object with a name property
    const categoryName = typeof category === 'object' ? category?.name : category

    // Try to translate the category name
    const translationKey = `categories.${categoryName}`
    const translated = t(translationKey)

    // If translation exists (doesn't return the key), return it
    // Otherwise return the original category name
    return translated !== translationKey ? translated : categoryName
  }

  return {
    translateCategory
  }
}
