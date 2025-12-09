import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false
  }),
  actions: {
    async login(email, password, rememberMe) {
      this.loading = true
      try {
        const data = await api.post('/auth/login', { email, password, rememberMe })
        this.user = data.user
        this.isLoggedIn = true
        return data
      } finally {
        this.loading = false
      }
    },
    async signup(formData) {
      this.loading = true
      try {
        const data = await api.post('/auth/signup', formData)
        this.user = data.user
        this.isLoggedIn = true
        return data
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
      } finally {
        this.user = null
        this.isLoggedIn = false
      }
    },
    async fetchUser() {
      try {
        const data = await api.get('/auth/me')
        this.user = data.user
        this.isLoggedIn = true
      } catch (err) {
        console.warn('Auth fetch failed', err)
        this.user = null
        this.isLoggedIn = false
      }
    }
  }
})
