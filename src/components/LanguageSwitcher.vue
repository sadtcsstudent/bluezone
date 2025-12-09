<template>
  <div class="language-switcher">
    <button
      @click="toggleDropdown"
      class="language-button"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <Globe :size="18" />
      <span class="language-code">{{ currentLocale.toUpperCase() }}</span>
      <ChevronDown :size="14" :class="['chevron', { 'chevron--open': isOpen }]" />
    </button>
    <div v-if="isOpen" class="language-dropdown" role="listbox">
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        :class="['language-option', { 'language-option--active': currentLocale === lang.code }]"
        role="option"
        :aria-selected="currentLocale === lang.code"
      >
        <span class="language-flag">{{ lang.flag }}</span>
        <span class="language-name">{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { Globe, ChevronDown } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',
  components: {
    Globe,
    ChevronDown
  },
  data() {
    return {
      isOpen: false,
      languages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
      ]
    }
  },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  computed: {
    currentLocale() {
      return this.locale
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    changeLanguage(code) {
      this.locale = code
      localStorage.setItem('locale', code)
      this.isOpen = false
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: transparent;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.language-button:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-primary));
  border-color: rgb(var(--color-primary));
}

.language-code {
  font-weight: 600;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron--open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 140px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  text-align: left;
}

.language-option:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-primary));
}

.language-option--active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  font-weight: 500;
}

.language-flag {
  font-size: 1rem;
}

.language-name {
  flex: 1;
}
</style>
