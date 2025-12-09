<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-grid">
        <!-- Left Side - Form -->
        <div class="signup-form-wrapper">
          <div class="signup-header">
            <h1>{{ $t('signup.title') }}</h1>
            <p class="signup-subtitle">
              {{ $t('signup.subtitle') }}
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="signup-form">
            <!-- Name -->
            <div class="form-group">
              <label for="name" class="form-label">
                {{ $t('signup.fullName') }}
              </label>
              <div class="input-wrapper">
                <User class="input-icon" :size="20" />
                <input
                  id="name"
                  type="text"
                  v-model="formData.name"
                  :placeholder="$t('signup.fullNamePlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                {{ $t('signup.emailLabel') }}
              </label>
              <div class="input-wrapper">
                <Mail class="input-icon" :size="20" />
                <input
                  id="email"
                  type="email"
                  v-model="formData.email"
                  :placeholder="$t('signup.emailPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <!-- Location -->
            <div class="form-group">
              <label for="location" class="form-label">
                {{ $t('signup.locationLabel') }}
              </label>
              <div class="input-wrapper">
                <MapPin class="input-icon" :size="20" />
                <input
                  id="location"
                  type="text"
                  v-model="formData.location"
                  :placeholder="$t('signup.locationPlaceholder')"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">
                {{ $t('signup.passwordLabel') }}
              </label>
              <div class="input-wrapper">
                <Lock class="input-icon" :size="20" />
                <input
                  id="password"
                  type="password"
                  v-model="formData.password"
                  :placeholder="$t('signup.passwordPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                {{ $t('signup.confirmPasswordLabel') }}
              </label>
              <div class="input-wrapper">
                <Lock class="input-icon" :size="20" />
                <input
                  id="confirmPassword"
                  type="password"
                  v-model="formData.confirmPassword"
                  :placeholder="$t('signup.confirmPasswordPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <!-- Interests -->
            <div class="form-group">
              <label class="form-label">
                {{ $t('signup.interestsLabel') }}
              </label>
              <div class="interests-wrapper">
                <button
                  v-for="interest in interestOptions"
                  :key="interest.key"
                  type="button"
                  @click="toggleInterest(interest.key)"
                  :class="[
                    'interest-button',
                    formData.interests.includes(interest.key) ? 'interest-button--active' : ''
                  ]"
                >
                  {{ interest.label }}
                </button>
              </div>
            </div>

            <!-- Newsletter -->
            <div class="checkbox-group">
              <input
                id="newsletter"
                type="checkbox"
                v-model="formData.newsletter"
                class="checkbox-input"
              />
              <label for="newsletter" class="checkbox-label">
                {{ $t('signup.newsletterLabel') }}
              </label>
            </div>

            <!-- Terms -->
            <div class="checkbox-group">
              <input
                id="terms"
                type="checkbox"
                v-model="formData.termsAccepted"
                required
                class="checkbox-input"
              />
              <label for="terms" class="checkbox-label">
                {{ $t('signup.termsLabel') }}
                <a href="#" class="link">{{ $t('signup.termsOfService') }}</a>
                {{ $t('signup.and') }}
                <a href="#" class="link">{{ $t('signup.privacyPolicy') }}</a>
              </label>
            </div>

            <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
              <span>{{ loading ? $t('signup.loading') : $t('signup.createAccountButton') }}</span>
              <ArrowRight v-if="!loading" :size="20" />
              <div v-else class="spinner"></div>
            </button>

            <div class="login-link">
              <p>
                {{ $t('signup.hasAccount') }}
                <button
                  type="button"
                  @click="handleNavigate('login')"
                  class="link-button"
                >
                  {{ $t('signup.loginLink') }}
                </button>
              </p>
            </div>
          </form>
        </div>

        <!-- Right Side - Benefits -->
        <div class="signup-benefits-wrapper">
          <div class="benefits-image-container">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1513906029980-32d13afe6d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwZW9wbGV8ZW58MXx8fHwxNzY0NDMzODQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Community garden"
              class-name="benefits-image"
            />
          </div>
          <div class="benefits-card">
            <h3>{{ $t('signup.whatYouGet') }}</h3>
            <ul class="benefits-list">
              <li class="benefit-item">
                <div class="benefit-icon">
                  <div class="benefit-dot"></div>
                </div>
                <span class="benefit-text">
                  {{ $t('signup.benefit1') }}
                </span>
              </li>
              <li class="benefit-item">
                <div class="benefit-icon">
                  <div class="benefit-dot"></div>
                </div>
                <span class="benefit-text">
                  {{ $t('signup.benefit2') }}
                </span>
              </li>
              <li class="benefit-item">
                <div class="benefit-icon">
                  <div class="benefit-dot"></div>
                </div>
                <span class="benefit-text">
                  {{ $t('signup.benefit3') }}
                </span>
              </li>
              <li class="benefit-item">
                <div class="benefit-icon">
                  <div class="benefit-dot"></div>
                </div>
                <span class="benefit-text">
                  {{ $t('signup.benefit4') }}
                </span>
              </li>
              <li class="benefit-item">
                <div class="benefit-icon">
                  <div class="benefit-dot"></div>
                </div>
                <span class="benefit-text">
                  {{ $t('signup.benefit5') }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Mail, Lock, ArrowRight, MapPin } from 'lucide-vue-next'
import ImageWithFallback from '../components/ImageWithFallback.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

export default {
  name: 'SignupView',
  components: {
    ImageWithFallback,
    User,
    Mail,
    Lock,
    ArrowRight,
    MapPin
  },
  data() {
    return {
      formData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        interests: [],
        newsletter: true,
        termsAccepted: false
      },
      interestKeys: [
        'gardening',
        'healthyCooking',
        'walkingGroups',
        'yogaMeditation',
        'sustainability',
        'localFood',
        'communityEvents',
        'volunteering',
      ],
      authStore: useAuthStore(),
      toastStore: useToastStore(),
      loading: false
    }
  },
  computed: {
    interestOptions() {
      return this.interestKeys.map(key => ({
        key,
        label: this.$t(`interests.${key}`)
      }))
    }
  },
  methods: {
    validatePassword(password) {
      const minLength = 8
      const hasNumber = /\d/
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/
      
      if (password.length < minLength) return this.$t('signup.validation.minLength')
      if (!hasNumber.test(password)) return this.$t('signup.validation.number')
      if (!hasSpecial.test(password)) return this.$t('signup.validation.special')
      return null
    },

    async handleSubmit() {
      // 1. Validate Password Match
      if (this.formData.password !== this.formData.confirmPassword) {
        this.toastStore.error('Passwords do not match!')
        return
      }

      // 2. Validate Password Strength
      const passwordError = this.validatePassword(this.formData.password)
      if (passwordError) {
        this.toastStore.error(passwordError)
        return
      }

      this.loading = true
      try {
        await this.authStore.signup({
          name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password,
          location: this.formData.location,
          interests: this.formData.interests,
          newsletter: this.formData.newsletter
        })
        
        this.toastStore.success(this.$t('signup.successToast'))
        this.$router.push({ name: 'home' })
      } catch (error) {
        // API errors (e.g. "Email already in use")
        const message = error.message || this.$t('signup.errorToast')
        this.toastStore.error(message)
      } finally {
        this.loading = false
      }
    },
    handleNavigate(page) {
      this.$router.push({ name: page })
    },
    toggleInterest(interest) {
      const index = this.formData.interests.indexOf(interest)
      if (index > -1) {
        this.formData.interests.splice(index, 1)
      } else {
        this.formData.interests.push(interest)
      }
    }
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.signup-container {
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .signup-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .signup-container {
    padding: 0 2rem;
  }
}

.signup-grid {
  display: grid;
  gap: 3rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .signup-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Form Section */
.signup-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.signup-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: rgb(var(--color-text));
}

.signup-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.6;
}

.signup-form {
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

.input-wrapper {
  position: relative;
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

/* Interests */
.interests-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-button {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgb(var(--color-border));
  background: white;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.interest-button:hover {
  background: rgb(var(--color-background));
}

.interest-button--active {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

/* Checkboxes */
.checkbox-group {
  display: flex;
  align-items: start;
  gap: 0.5rem;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  margin-top: 0.25rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(var(--color-border));
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-input:checked {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
}

.checkbox-label {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  line-height: 1.5;
}

.link {
  color: rgb(var(--color-primary));
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: rgb(var(--color-primary-dark));
}

.login-link {
  text-align: center;
}

.login-link p {
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

/* Benefits Section */
.signup-benefits-wrapper {
  display: none;
  position: sticky;
  top: 6rem;
}

@media (min-width: 1024px) {
  .signup-benefits-wrapper {
    display: block;
  }
}

.benefits-image-container {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  margin-bottom: 1.5rem;
}

.benefits-image {
  width: 100%;
  height: 16rem;
  object-fit: cover;
}

.benefits-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.benefits-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.benefit-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.benefit-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgb(var(--color-primary));
}

.benefit-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.5;
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
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



</style>
