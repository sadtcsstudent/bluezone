<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>
    <div v-else class="profile-container">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-info">
          <div class="profile-avatar" @click="triggerAvatarUpload">
            <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar" class="avatar-img" />
            <User v-else :size="48" />
            <div class="avatar-overlay">
              <Camera :size="24" />
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            class="hidden-input"
            accept="image/*"
            @change="handleAvatarUpload"
          />
          <div class="profile-details">
            <h1>{{ profile.name }}</h1>
            <p class="profile-meta">Member since {{ memberSince }}</p>
            <p class="profile-location">{{ profile.location }}</p>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn--outline-primary" @click="openEditModal">
            <Edit :size="16" />
            <span>Edit Profile</span>
          </button>
          <button v-if="profile.role === 'admin'" class="btn btn--primary" @click="navigate('admin')">
            <LayoutDashboard :size="16" />
            <span>Admin Panel</span>
          </button>
          <button v-if="profile.role === 'company'" class="btn btn--primary" @click="navigate('company-dashboard')">
            <LayoutDashboard :size="16" />
            <span>Company Dashboard</span>
          </button>
          <button class="btn btn--icon" @click="navigate('settings')">
            <Settings :size="20" />
          </button>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <!-- Quick Stats -->
          <div class="sidebar-card">
            <h3>Quick Stats</h3>
            <div class="stats-list">
              <div class="stat-item">
                <span class="stat-label">Events Attended</span>
                <span class="stat-value">{{ stats.eventsAttended }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Groups Joined</span>
                <span class="stat-value">{{ stats.groupsJoined }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Forum Posts</span>
                <span class="stat-value">{{ stats.forumPosts }}</span>
              </div>
            </div>
          </div>

          <!-- Interests -->
          <div class="sidebar-card">
            <div class="card-header">
              <h3>My Interests</h3>
              <button class="icon-btn" @click="openEditModal">
                <Edit :size="16" />
              </button>
            </div>
            <div class="interests-list">
              <span
                v-for="interest in interests"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="sidebar-card">
            <button class="action-btn" @click="navigate('settings')">
              <Settings :size="20" />
              <span>Account Settings</span>
            </button>
            <button @click="handleLogout" class="action-btn action-btn--danger">
              <LogOut :size="20" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="profile-main">
          <!-- Upcoming Events -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <Calendar :size="20" class="title-icon" />
                <h3>My Upcoming Events</h3>
              </div>
              <button @click="navigate('events')" class="link-btn">
                View All
              </button>
            </div>
            <div class="event-list">
              <div
                v-for="(event, index) in upcomingEvents"
                :key="index"
                class="event-item"
              >
                <div class="event-content">
                  <h4>{{ event.title }}</h4>
                  <p class="event-meta">{{ event.date }} • {{ event.time }}</p>
                </div>
                <span :class="['event-status', event.status === 'Registered' ? 'event-status--registered' : 'event-status--interested']">
                  {{ event.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- My Groups -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <MessageCircle :size="20" class="title-icon" />
                <h3>My Groups</h3>
              </div>
              <button @click="navigate('forum')" class="link-btn">
                Browse More
              </button>
            </div>
            <div class="group-list">
              <div
                v-for="(group, index) in myGroups"
                :key="index"
                class="group-item"
              >
                <div class="group-content">
                  <h4>{{ group.name }}</h4>
                  <p class="group-meta">{{ group.category }} • {{ group.members }} members</p>
                </div>
                <span class="group-role">{{ group.role }}</span>
              </div>
            </div>
          </div>

          <!-- Saved Initiatives -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <Heart :size="20" class="title-icon" />
                <h3>Saved Initiatives</h3>
              </div>
              <button @click="navigate('map')" class="link-btn">
                View Map
              </button>
            </div>
            <div class="initiative-grid">
              <div
                v-for="initiative in savedInitiatives"
                :key="initiative.id"
                class="initiative-item"
              >
                <h5>{{ initiative.name }}</h5>
                <p class="initiative-location">{{ initiative.location }}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfile" class="modal-overlay" @click.self="showEditProfile = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Profile</h2>
          <button class="close-btn" @click="showEditProfile = false">
            <X :size="24" />
          </button>
        </div>
        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="form-group">
            <label>Display Name</label>
            <input v-model="editForm.name" required />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input v-model="editForm.location" placeholder="e.g. Enschede, NL" />
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="editForm.bio" rows="3" placeholder="Tell us about yourself"></textarea>
          </div>
          <div class="form-group">
            <label>Interests (comma separated)</label>
            <input v-model="editForm.interests" placeholder="Gardening, Cooking, Yoga" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showEditProfile = false">Cancel</button>
            <button type="submit" class="btn btn--primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Calendar, MessageCircle, Heart, Settings, LogOut, Edit, Camera, X, LayoutDashboard } from 'lucide-vue-next'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'

export default {
  name: 'ProfileView',
  components: { User, Calendar, MessageCircle, Heart, Settings, LogOut, Edit, Camera, X, LayoutDashboard },
  data() {
    return {
      profile: {},
      memberSince: '',
      interests: [],
      stats: { eventsAttended: 0, groupsJoined: 0, forumPosts: 0 },
      upcomingEvents: [],
      myGroups: [],
      savedInitiatives: [],
      showEditProfile: false,
      editForm: { name: '', location: '', bio: '', interests: '' },
      saving: false,
      loading: true
    }
  },
  async created() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      this.loading = true
      try {
        const profile = await api.get('/users/me')
        const events = await api.get('/users/me/events')
        const groups = await api.get('/users/me/groups')
        const saved = await api.get('/users/me/saved-initiatives')

        this.profile = profile.user || {}
        this.memberSince = this.profile.memberSince ? new Date(this.profile.memberSince).toLocaleDateString() : ''
        this.interests = this.profile.interests || []
        this.stats = profile.stats || this.stats
        this.upcomingEvents = (events.upcoming || []).map(e => ({
          title: e.title,
          date: new Date(e.date).toLocaleDateString(),
          time: e.time,
          status: 'Registered'
        }))
        this.myGroups = (groups.groups || []).map(g => ({
          name: g.name,
          category: g.category,
          members: g.members?.length || 0,
          role: 'Member'
        }))
        this.savedInitiatives = saved.initiatives || []
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        this.loading = false
      }
    },
    navigate(page) {
      this.$router.push({ name: page })
    },
    handleLogout() {
      // Clear token logic here if needed, or just redirect
      localStorage.removeItem('token') // Assuming token is stored here
      this.$router.push({ name: 'login' })
    },
    triggerAvatarUpload() {
      this.$refs.fileInput.click()
    },
    async handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const toast = useToastStore()
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await api.post('/upload/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        this.profile.avatar = response.url
        toast.success('Avatar uploaded successfully')
      } catch (error) {
        console.error('Avatar upload failed:', error)
        toast.error('Failed to upload avatar')
      }
    },
    openEditModal() {
      this.editForm = {
        name: this.profile.name || '',
        location: this.profile.location || '',
        bio: this.profile.bio || '',
        interests: (this.profile.interests || []).join(', ')
      }
      this.showEditProfile = true
    },
    async updateProfile() {
      this.saving = true
      const toast = useToastStore()
      try {
        const interestsArray = this.editForm.interests.split(',').map(i => i.trim()).filter(i => i)
        const updates = {
          ...this.editForm,
          interests: interestsArray
        }
        await api.put('/users/me', updates)
        await this.loadProfile()
        this.showEditProfile = false
        toast.success('Profile updated!')
      } catch (err) {
        console.error('Failed to update profile', err)
        toast.error('Failed to update profile')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.profile-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .profile-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .profile-container {
    padding: 0 2rem;
  }
}

/* Header */
.profile-header {
  background: linear-gradient(135deg,
    rgba(var(--color-primary), 0.1) 0%,
    rgba(var(--color-accent), 0.1) 100%
  );
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  background: linear-gradient(135deg,
    rgb(var(--color-primary)) 0%,
    rgb(var(--color-primary-dark)) 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.profile-details h1 {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.profile-meta,
.profile-location {
  color: rgb(var(--color-text-secondary));
  margin: 0.25rem 0;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

/* Grid Layout */
.profile-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr 2fr;
  }
}

/* Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-primary));
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.icon-btn:hover {
  background: rgb(var(--color-background));
}

/* Stats */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  color: rgb(var(--color-text-secondary));
}

.stat-value {
  font-weight: 600;
  color: rgb(var(--color-text));
}

/* Interests */
.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  font-size: 0.875rem;
}

/* Action Buttons */
.action-btn {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgb(var(--color-text));
}

.action-btn:hover {
  background: rgb(var(--color-background));
}

.action-btn--danger {
  color: rgb(196, 113, 102);
}

.action-btn--danger:hover {
  background: rgba(196, 113, 102, 0.1);
}

/* Main Content */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
}

.content-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.content-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: rgb(var(--color-primary));
}

.content-card-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.link-btn {
  background: transparent;
  border: none;
  color: rgb(var(--color-primary));
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: rgb(var(--color-primary-dark));
}

/* Events */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: start;
  justify-content: space-between;
  transition: border-color 0.2s ease;
}

.event-item:hover {
  border-color: rgb(var(--color-primary));
}

.event-content {
  flex: 1;
}

.event-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.event-meta {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  white-space: nowrap;
}

.event-status--registered {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.event-status--interested {
  background: rgba(var(--color-accent), 0.2);
  color: rgb(var(--color-primary-dark));
}

/* Groups */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: start;
  justify-content: space-between;
  transition: border-color 0.2s ease;
}

.group-item:hover {
  border-color: rgb(var(--color-primary));
}

.group-content {
  flex: 1;
}

.group-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.group-meta {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

.group-role {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

/* Initiatives */
.initiative-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .initiative-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.initiative-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.initiative-item h5 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.initiative-location {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn--outline-primary {
  border: 1px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
}

.btn--outline-primary:hover {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--icon {
  padding: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  background: transparent;
  color: rgb(var(--color-text));
}

.btn--icon:hover {
  background: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

/* Loading State */
.loading-state {
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary), 0.1);
  border-top-color: rgb(var(--color-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: rgb(var(--color-text));
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--ghost:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
