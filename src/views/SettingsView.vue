<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <div class="sidebar-header">
          <h2>Settings</h2>
        </div>
        <nav class="settings-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="20" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- Content -->
      <main class="settings-content">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'" class="settings-panel">
          <div class="panel-header">
            <h2>Public Profile</h2>
            <p>Manage how others see you on the platform</p>
          </div>

          <form @submit.prevent="updateProfile" class="settings-form">
            <div class="avatar-section">
              <div class="avatar-preview">
                <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar" />
                <div v-else class="avatar-placeholder">
                  {{ (profile.name || profile.email || '?')[0].toUpperCase() }}
                </div>
                <div class="avatar-overlay" @click="triggerAvatarUpload">
                  <Camera :size="24" />
                </div>
              </div>
              <div class="avatar-info">
                <h3>Profile Picture</h3>
                <p>PNG, JPG up to 5MB</p>
                <input 
                  type="file" 
                  ref="fileInput" 
                  class="hidden" 
                  accept="image/*"
                  @change="handleAvatarUpload"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Display Name</label>
              <input v-model="profile.name" type="text" placeholder="Your full name" />
            </div>

            <div class="form-group">
              <label>Bio</label>
              <textarea v-model="profile.bio" rows="3" placeholder="Tell us about yourself"></textarea>
            </div>

            <div class="form-group">
              <label>Location</label>
              <div class="input-icon">
                <MapPin :size="18" />
                <input v-model="profile.location" type="text" placeholder="City, Country" />
              </div>
            </div>

            <div class="form-group">
              <label>Interests</label>
              <input 
                v-model="interestsInput" 
                type="text" 
                placeholder="Coding, Design, Music (comma separated)" 
              />
              <p class="help-text">Separate tags with commas</p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Account Settings -->
        <div v-if="activeTab === 'account'" class="settings-panel">
          <div class="panel-header">
            <h2>Account Security</h2>
            <p>Manage your login credentials and security</p>
          </div>

          <div class="settings-section">
            <h3>Email Address</h3>
            <div class="email-display">
              <Mail :size="20" />
              <input v-if="editingEmail" v-model="newEmail" type="email" class="email-input" />
              <span v-else>{{ profile.email }}</span>
              <span v-if="!editingEmail" class="badge">Verified</span>
              <button v-if="!editingEmail" class="btn btn--sm btn--outline" @click="editingEmail = true">Change</button>
              <div v-else class="email-actions">
                <button class="btn btn--sm btn--primary" @click="updateEmail">Save</button>
                <button class="btn btn--sm btn--ghost" @click="editingEmail = false">Cancel</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Social Accounts</h3>
            <div class="social-accounts">
              <div class="social-item">
                <div class="social-info">
                  <span class="social-name">Google</span>
                  <span class="social-status" :class="{ connected: profile.googleId }">
                    {{ profile.googleId ? 'Connected' : 'Not connected' }}
                  </span>
                </div>
                <button class="btn btn--sm btn--outline" @click="toggleSocial('google')">
                  {{ profile.googleId ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
              <div class="social-item">
                <div class="social-info">
                  <span class="social-name">Facebook</span>
                  <span class="social-status" :class="{ connected: profile.facebookId }">
                    {{ profile.facebookId ? 'Connected' : 'Not connected' }}
                  </span>
                </div>
                <button class="btn btn--sm btn--outline" @click="toggleSocial('facebook')">
                  {{ profile.facebookId ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Change Password</h3>
            <form @submit.prevent="changePassword" class="password-form">
              <div class="form-group">
                <label>Current Password</label>
                <input 
                  v-model="passwords.currentPassword" 
                  type="password" 
                  required 
                />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input 
                  v-model="passwords.newPassword" 
                  type="password" 
                  required 
                />
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input 
                  v-model="passwords.confirmPassword" 
                  type="password" 
                  required 
                />
              </div>
              <button type="submit" class="btn btn--outline" :disabled="saving">
                Update Password
              </button>
            </form>
          </div>

          <div class="settings-section danger-zone">
            <h3>Delete Account</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button class="btn btn--danger" @click="deleteAccount">Delete Account</button>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div v-if="activeTab === 'privacy'" class="settings-panel">
          <div class="panel-header">
            <h2>Privacy</h2>
            <p>Control who can see your profile and activity</p>
          </div>

          <div class="notification-group">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Profile Visibility</span>
                <span class="toggle-desc">Allow others to find your profile</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="privacy.publicProfile" @change="updatePrivacy">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Show Email</span>
                <span class="toggle-desc">Display your email on your public profile</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="privacy.showEmail" @change="updatePrivacy">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeTab === 'notifications'" class="settings-panel">
          <div class="panel-header">
            <h2>Notifications</h2>
            <p>Choose what you want to be notified about</p>
          </div>

          <div class="notification-group">
            <h3>Email Notifications</h3>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Marketing emails</span>
                <span class="toggle-desc">Receive news about product updates</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="notifications.marketing" @change="updatePreferences">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Social activity</span>
                <span class="toggle-desc">When someone mentions you or replies</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="notifications.social" @change="updatePreferences">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Bell, Camera, MapPin, Mail, Shield } from 'lucide-vue-next'
import api from '@/services/api'

const router = useRouter()
const activeTab = ref('profile')
const profile = ref({})
const interestsInput = ref('')
const passwords = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const notifications = ref({ marketing: true, social: true })
const privacy = ref({ publicProfile: true, showEmail: false })
const saving = ref(false)
const fileInput = ref(null)
const editingEmail = ref(false)
const newEmail = ref('')

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell }
]

const load = async () => {
  try {
    const data = await api.get('/users/me')
    profile.value = data.user
    interestsInput.value = (data.user.interests || []).join(', ')
    if (data.user.preferences) {
      const prefs = typeof data.user.preferences === 'string' 
        ? JSON.parse(data.user.preferences) 
        : data.user.preferences
      notifications.value = { ...notifications.value, ...prefs.notifications }
      privacy.value = { ...privacy.value, ...prefs.privacy }
    }
  } catch (err) {
    console.error('Failed to load profile', err)
  }
}

const updateProfile = async () => {
  saving.value = true
  try {
    await api.put('/users/me', {
      name: profile.value.name,
      bio: profile.value.bio,
      location: profile.value.location,
      interests: interestsInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    })
    alert('Profile updated successfully')
  } catch (err) {
    console.error('Failed to update profile', err)
    alert('Failed to update profile')
  } finally {
    saving.value = false
  }
}

const updateEmail = async () => {
  if (!newEmail.value) return
  try {
    await api.put('/users/me/email', { email: newEmail.value })
    profile.value.email = newEmail.value
    editingEmail.value = false
    alert('Email updated. Please verify your new email.')
  } catch (err) {
    console.error('Failed to update email', err)
    alert('Failed to update email')
  }
}

const changePassword = async () => {
  if (passwords.value.newPassword !== passwords.value.confirmPassword) {
    alert('Passwords do not match')
    return
  }
  
  saving.value = true
  try {
    await api.put('/users/me/password', {
      currentPassword: passwords.value.currentPassword,
      newPassword: passwords.value.newPassword
    })
    alert('Password updated successfully')
    passwords.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    console.error('Failed to update password', err)
    alert('Failed to update password')
  } finally {
    saving.value = false
  }
}

const updatePreferences = async () => {
  try {
    await api.put('/users/me/preferences', {
      preferences: {
        notifications: notifications.value,
        privacy: privacy.value
      }
    })
  } catch (err) {
    console.error('Failed to update preferences', err)
  }
}

const updatePrivacy = async () => {
  await updatePreferences()
}

const toggleSocial = (provider) => {
  // Mock implementation
  alert(`${provider} integration is currently in development mode.`)
}

const deleteAccount = async () => {
  if (!confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.')) return
  
  try {
    await api.delete('/users/me')
    alert('Account deleted.')
    router.push('/login')
  } catch (err) {
    console.error('Failed to delete account', err)
    alert('Failed to delete account')
  }
}

const triggerAvatarUpload = () => {
  fileInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    profile.value.avatar = response.url
  } catch (error) {
    console.error('Avatar upload failed:', error)
    alert('Failed to upload avatar')
  }
}

onMounted(load)
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding: 2rem 0;
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 0 1.5rem;
}

/* Sidebar */
.settings-sidebar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: rgb(var(--color-text));
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.nav-item.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

/* Content */
.settings-content {
  background: white;
  border-radius: 1rem;
  min-height: 500px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.settings-panel {
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.panel-header p {
  color: rgb(var(--color-text-secondary));
}

/* Forms */
.settings-form {
  max-width: 600px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-preview {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgb(var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-info h3 {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.avatar-info p {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.hidden {
  display: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgb(var(--color-text));
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  font-family: inherit;
}

.input-icon {
  position: relative;
}

.input-icon svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
}

.input-icon input {
  padding-left: 2.5rem;
}

.help-text {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  margin-top: 0.5rem;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgb(var(--color-border));
  display: flex;
  justify-content: flex-end;
}

/* Account Settings */
.settings-section {
  margin-bottom: 2.5rem;
}

.settings-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.email-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgb(var(--color-background));
  border-radius: 0.5rem;
  color: rgb(var(--color-text));
}

.email-input {
  padding: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.25rem;
}

.email-actions {
  display: flex;
  gap: 0.5rem;
}

.badge {
  background: #22c55e;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

.social-accounts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
}

.social-info {
  display: flex;
  flex-direction: column;
}

.social-name {
  font-weight: 500;
}

.social-status {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.social-status.connected {
  color: #22c55e;
}

.danger-zone {
  padding-top: 2rem;
  border-top: 1px solid rgb(var(--color-border));
}

.danger-zone h3 {
  color: #ef4444;
}

.danger-zone p {
  color: rgb(var(--color-text-secondary));
  margin-bottom: 1rem;
}

/* Notifications */
.notification-group {
  margin-bottom: 2rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgb(var(--color-border));
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-label {
  font-weight: 500;
  color: rgb(var(--color-text));
}

.toggle-desc {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

/* Switch Toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: rgb(var(--color-primary));
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
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

.btn--outline {
  background: transparent;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
}

.btn--outline:hover {
  border-color: rgb(var(--color-text));
}

.btn--danger {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn--danger:hover {
  background: #ef4444;
  color: white;
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .nav-item {
    white-space: nowrap;
  }
}
</style>
