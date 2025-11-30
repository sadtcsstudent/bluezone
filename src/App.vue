<template>
  <div id="app" class="app-container">
    <Navigation :current-page="currentPage" :is-logged-in="isLoggedIn" />
    <main class="app-main">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navigation,
    Footer
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  computed: {
    currentPage() {
      return this.$route.name || 'home'
    }
  },
  methods: {
    handleLogin() {
      this.isLoggedIn = true
    },
    handleLogout() {
      this.isLoggedIn = false
    }
  }
}
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
</style>
