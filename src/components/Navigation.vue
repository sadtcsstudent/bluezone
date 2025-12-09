<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-content">
        <!-- Logo -->
        <div class="nav-logo" @click="navigate('home')">
          <img src="../img/logo.png" alt="Blue Zone Twente Logo" class="nav-logo-icon" />
          <span class="nav-logo-text">Blue Zone Twente</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-links">
          <button
            v-for="item in navItems"
            :key="item.page"
            @click="navigate(item.page)"
            :class="['nav-link', { 'nav-link--active': currentPage === item.page }]"
          >
            {{ item.label }}
          </button>
        </div>

        <!-- Desktop Auth Buttons -->
        <div class="nav-auth">
          <LanguageSwitcher />
          <template v-if="!isLoggedIn">
            <button @click="navigate('login')" class="nav-btn nav-btn--ghost">
              {{ $t('nav.login') }}
            </button>
            <button @click="navigate('signup')" class="nav-btn nav-btn--primary">
              {{ $t('nav.signup') }}
            </button>
          </template>
          <template v-else>
            <NotificationBell />
            <button @click="navigate('messages')" class="nav-icon-btn" :title="$t('nav.messages')">
              <MessageCircle :size="20" />
            </button>
            <button @click="navigate('profile')" class="nav-avatar">
              <User :size="20" />
            </button>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="nav-mobile-toggle">
          <Menu v-if="!isMobileMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="nav-mobile-menu">
        <div class="nav-mobile-links">
          <button
            v-for="item in navItems"
            :key="item.page"
            @click="navigateAndClose(item.page)"
            :class="['nav-mobile-link', { 'nav-mobile-link--active': currentPage === item.page }]"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="nav-mobile-auth">
          <div class="nav-mobile-language">
            <LanguageSwitcher />
          </div>
          <template v-if="!isLoggedIn">
            <button @click="navigateAndClose('login')" class="nav-btn nav-btn--ghost nav-btn--full">
              {{ $t('nav.login') }}
            </button>
            <button @click="navigateAndClose('signup')" class="nav-btn nav-btn--primary nav-btn--full">
              {{ $t('nav.signup') }}
            </button>
          </template>
          <template v-else>
            <button @click="navigateAndClose('messages')" class="nav-btn nav-btn--ghost nav-btn--full">
              <MessageCircle :size="20" />
              <span>{{ $t('nav.messages') }}</span>
            </button>
            <button @click="navigateAndClose('profile')" class="nav-btn nav-btn--ghost nav-btn--full">
              <User :size="20" />
              <span>{{ $t('nav.profile') }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { Sprout, Menu, X, MessageCircle, User } from 'lucide-vue-next'
import NotificationBell from './NotificationBell.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

export default {
  name: 'Navigation',
  components: {
    Menu,
    X,
    MessageCircle,
    User,
    NotificationBell,
    LanguageSwitcher
  },
  props: {
    currentPage: {
      type: String,
      default: 'home'
    },
    isLoggedIn: Boolean
  },
  data() {
    return {
      isMobileMenuOpen: false,
      navKeys: ['home', 'story', 'events', 'forum', 'map', 'newsletter']
    }
  },
  computed: {
    navItems() {
      return this.navKeys.map(key => ({
        page: key,
        label: this.$t(`nav.${key}`)
      }))
    }
  },
  methods: {
    navigate(page) {
      this.$router.push({ name: page })
    },
    navigateAndClose(page) {
      this.navigate(page)
      this.isMobileMenuOpen = false
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    }
  },
  watch: {
    $route() {
      this.isMobileMenuOpen = false
    }
  }
}
</script>

<style scoped>
.navigation {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid rgb(var(--color-border));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .nav-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .nav-container {
    padding: 0 2rem;
  }
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.nav-logo:hover {
  opacity: 0.8;
}

.nav-logo-icon {
  height: 48px;
  width: 48px;
  object-fit: contain;
}

.nav-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--color-text-primary));
}

@media (max-width: 640px) {
  .nav-logo-text {
    font-size: 1rem;
  }
}

/* Desktop Navigation Links */
.nav-links {
  display: none;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 1024px) {
  .nav-links {
    display: flex;
  }
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-primary));
}

.nav-link--active {
  color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.1);
}

/* Desktop Auth Buttons */
.nav-auth {
  display: none;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 1024px) {
  .nav-auth {
    display: flex;
  }
}

.nav-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-primary));
}

.nav-btn--ghost:hover {
  background: rgb(var(--color-background));
}

.nav-btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.nav-btn--primary:hover {
  background: rgb(var(--color-primary-dark));
}

.nav-btn--full {
  width: 100%;
}

.nav-icon-btn {
  padding: 0.5rem;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-primary));
}

.nav-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-avatar:hover {
  background: rgba(var(--color-primary), 0.2);
}

/* Mobile Menu Toggle */
.nav-mobile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-primary));
  cursor: pointer;
}

@media (min-width: 1024px) {
  .nav-mobile-toggle {
    display: none;
  }
}

/* Mobile Menu */
.nav-mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgb(var(--color-border));
}

@media (min-width: 1024px) {
  .nav-mobile-menu {
    display: none;
  }
}

.nav-mobile-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-mobile-link {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.nav-mobile-link:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-primary));
}

.nav-mobile-link--active {
  color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.1);
}

.nav-mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-border));
}

.nav-mobile-language {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}
</style>
