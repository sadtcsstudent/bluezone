<template>
  <div id="app" class="app-container">
    <div v-if="!isOnline" class="offline-banner">
      <WifiOff :size="16" />
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
    <Navigation :current-page="currentPage" :is-logged-in="authStore.isLoggedIn" />
    <main class="app-main">
      <router-view />
    </main>
    <Footer />
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { socketService } from '@/services/socket.service'
import { WifiOff } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const isOnline = ref(navigator.onLine)

const currentPage = computed(() => route.name || 'home')

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

const init = async () => {
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password']
  const currentPath = window.location.pathname

  // Only fetch user if not on a public auth page
  if (!publicPaths.includes(currentPath)) {
    await authStore.fetchUser()
    if (authStore.isLoggedIn && authStore.user) {
      socketService.connect(authStore.user.id)
    }
  }
}

onMounted(() => {
  init()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style>
@import './assets/main.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}

.offline-banner {
  background: #ef4444;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: sticky;
  top: 0;
  z-index: 10000;
}
</style>
