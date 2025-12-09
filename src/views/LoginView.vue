<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-grid">
        <!-- Left Side - Form -->
        <div class="login-form-wrapper">
          <div class="login-header">
            <h1>{{ $t('login.title') }}</h1>
            <p class="login-subtitle">
              {{ $t('login.subtitle') }}
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">
                {{ $t('login.emailLabel') }}
              </label>
              <div class="input-wrapper">
                <Mail class="input-icon" :size="20" />
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  :placeholder="$t('login.emailPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="password-header">
                <label for="password" class="form-label">
                  {{ $t('login.passwordLabel') }}
                </label>
                <RouterLink :to="{ name: 'forgot-password' }" class="forgot-link">
                  {{ $t('login.forgotPassword') }}
                </RouterLink>
              </div>
              <div class="input-wrapper password-wrapper">
                <Lock class="input-icon" :size="20" />
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  :placeholder="$t('login.passwordPlaceholder')"
                  required
                  class="form-input"
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  @click="showPassword = !showPassword"
                  :aria-pressed="showPassword"
                  :aria-label="showPassword ? $t('login.hide') : $t('login.show')"
                >
                  {{ showPassword ? $t('login.hide') : $t('login.show') }}
                </button>
              </div>
            </div>

            <div class="remember-me">
              <input
                id="remember"
                type="checkbox"
                v-model="rememberMe"
                class="checkbox-input"
              />
              <label for="remember" class="checkbox-label">
                {{ $t('login.rememberMe') }}
              </label>
            </div>

            <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
              <span>{{ loading ? $t('common.loading') : $t('login.loginButton') }}</span>
              <ArrowRight v-if="!loading" :size="20" />
              <div v-else class="spinner"></div>
            </button>

            <div class="signup-link">
              <p>
                {{ $t('login.noAccount') }}
                <button
                  type="button"
                  @click="handleNavigate('signup')"
                  class="link-button"
                >
                  {{ $t('login.signupLink') }}
                </button>
              </p>
            </div>
          </form>

          <!-- Divider -->
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">{{ $t('login.orContinueWith') }}</span>
          </div>

          <!-- Social Login -->
          <div class="social-login">
            <button class="social-button" @click="handleSocialLogin('google')">Google</button>
            <button class="social-button" @click="handleSocialLogin('facebook')">Facebook</button>
          </div>
        </div>

        <!-- Right Side - Image -->
        <div class="login-image-wrapper">
          <div class="login-image-container">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1625246433906-6cfa33544b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzY0NDU5MDg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Community gathering"
              class-name="login-image"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Mail, Lock, ArrowRight } from 'lucide-vue-next'
import ImageWithFallback from '../components/ImageWithFallback.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

export default {
  name: 'LoginView',
  components: {
    ImageWithFallback,
    Mail,
    Lock,
    ArrowRight
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false
    }
  },
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return { authStore, toastStore }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      try {
        await this.authStore.login(this.email, this.password, this.rememberMe)
        this.toastStore.success(this.$t('login.welcomeToast'))
        this.$router.push({ name: 'home' })
      } catch (e) {
        const message = e.message || this.$t('login.errorToast')
        this.toastStore.error(message)
      } finally {
        this.loading = false
      }
    },
    handleNavigate(page) {
      this.$router.push({ name: page })
    },
    handleSocialLogin(provider) {
      window.location.href = `http://localhost:3000/api/auth/${provider}`
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.login-container {
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .login-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .login-container {
    padding: 0 2rem;
  }
}

.login-grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .login-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Form Section */
.login-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: rgb(var(--color-text));
}

.login-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: block;
  color: rgb(var(--color-text));
  font-weight: 500;
}

.password-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  color: rgb(var(--color-primary));
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: rgb(var(--color-primary-dark));
}

.input-wrapper {
  position: relative;
}

.password-wrapper .toggle-visibility {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: rgb(var(--color-text-secondary));
  font-weight: 600;
  cursor: pointer;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: rgb(var(--color-text));
}

.form-input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.form-input::placeholder {
  color: rgb(var(--color-text-secondary));
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(var(--color-border));
  cursor: pointer;
}

.checkbox-input:checked {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
}

.checkbox-label {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  cursor: pointer;
}

.signup-link {
  text-align: center;
}

.signup-link p {
  color: rgb(var(--color-text-secondary));
  margin: 0;
}

.link-button {
  background: transparent;
  border: none;
  color: rgb(var(--color-primary));
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.link-button:hover {
  color: rgb(var(--color-primary-dark));
  text-decoration: underline;
}

/* Divider */
.divider {
  position: relative;
  margin: 1rem 0;
}

.divider-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.divider-line::before {
  content: '';
  width: 100%;
  height: 1px;
  background: rgb(var(--color-border));
}

.divider-text {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

/* Social Login */
.social-login {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.social-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  color: rgb(var(--color-text));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-button:hover {
  background: rgb(var(--color-background));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Image Section */
.login-image-wrapper {
  display: none;
}

@media (min-width: 1024px) {
  .login-image-wrapper {
    display: block;
  }
}

.login-image-container {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-image {
  width: 100%;
  height: 700px;
  object-fit: cover;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover {
  background: rgb(var(--color-primary-dark));
}

.btn--full {
  width: 100%;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
