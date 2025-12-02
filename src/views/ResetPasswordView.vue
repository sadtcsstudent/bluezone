<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="icon-wrapper">
        <LockKeyhole :size="32" />
      </div>
      
      <h1>Reset Password</h1>
      <p class="subtitle">Enter your new password below.</p>

      <form @submit.prevent="submit" class="auth-form">
        <div class="form-group">
          <label>New Password</label>
          <div class="input-wrapper">
            <Lock :size="20" class="input-icon" />
            <input 
              type="password" 
              v-model="password" 
              placeholder="Min. 8 characters" 
              required 
              minlength="8"
            />
          </div>
        </div>

        <button type="submit" class="btn btn--primary" :disabled="loading || done">
          <span v-if="!loading && !done">Reset Password</span>
          <span v-else-if="loading">Updating...</span>
          <span v-else>Password Updated</span>
        </button>

        <div v-if="done" class="success-message">
          <CheckCircle2 :size="20" />
          <span>Your password has been reset successfully.</span>
        </div>

        <router-link v-if="done" :to="{ name: 'login' }" class="btn btn--outline">
          Log In Now
        </router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { LockKeyhole, Lock, CheckCircle2 } from 'lucide-vue-next'
import api from '@/services/api'

const route = useRoute()
const password = ref('')
const done = ref(false)
const loading = ref(false)
const token = ref('')

onMounted(async () => {
  token.value = route.query.token
  if (token.value) {
    try {
      await api.get(`/auth/verify-reset-token/${token.value}`)
    } catch (error) {
      console.error('Invalid token', error)
      // Handle invalid token UI state if needed
    }
  }
})

const submit = async () => {
  loading.value = true
  try {
    await api.post('/auth/reset-password', { token: token.value, newPassword: password.value })
    done.value = true
  } catch (error) {
    console.error('Reset password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-background));
  padding: 1rem;
}

.auth-card {
  background: white;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.icon-wrapper {
  width: 4rem;
  height: 4rem;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgb(var(--color-text-secondary));
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
}

.btn--outline {
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
}

.btn--outline:hover {
  border-color: rgb(var(--color-text));
  background: rgb(var(--color-background));
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  text-align: left;
}
</style>
