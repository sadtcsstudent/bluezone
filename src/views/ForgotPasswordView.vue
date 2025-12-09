<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="icon-wrapper">
        <KeyRound :size="32" />
      </div>
      
      <h1>{{ $t('forgotPassword.title') }}</h1>
      <p class="subtitle">{{ $t('forgotPassword.subtitle') }}</p>

      <form @submit.prevent="submit" class="auth-form">
        <div class="form-group">
          <label>{{ $t('login.emailLabel') }}</label>
          <div class="input-wrapper">
            <Mail :size="20" class="input-icon" />
            <input 
              type="email" 
              v-model="email" 
              :placeholder="$t('login.emailPlaceholder')" 
              required 
              :disabled="loading"
            />
          </div>
        </div>

        <button type="submit" class="btn btn--primary" :disabled="loading">
          <span v-if="!loading">{{ $t('forgotPassword.sendLink') }}</span>
          <span v-else>{{ $t('common.loading') }}</span>
        </button>

        <div v-if="sent" class="success-message">
          <CheckCircle2 :size="20" />
          <span>{{ $t('forgotPassword.successMessage', { email }) }}</span>
        </div>

        <router-link :to="{ name: 'login' }" class="back-link">
          <ArrowLeft :size="16" />
          <span>{{ $t('forgotPassword.backToLogin') }}</span>
        </router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import api from '@/services/api'

const email = ref('')
const sent = ref(false)
const loading = ref(false)

const submit = async () => {
  loading.value = true
  sent.value = false
  try {
    await api.post('/auth/forgot-password', { email: email.value })
    sent.value = true
  } catch (error) {
    console.error('Forgot password error:', error)
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
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
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

.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  margin-top: 1rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: rgb(var(--color-text));
}
</style>
