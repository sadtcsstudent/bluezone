<template>
  <div class="group-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="group" class="group-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <ImageWithFallback 
            :src="group.image || `https://source.unsplash.com/random/1200x400?${group.category}`" 
            class-name="hero-img"
            alt="Group cover"
          />
          <div class="hero-overlay"></div>
        </div>
        
        <div class="hero-content container">
          <div class="group-header">
            <div class="group-info">
              <span class="category-badge">{{ group.category }}</span>
              <h1 class="group-title">{{ group.name }}</h1>
              <div class="group-meta">
                <div class="meta-item">
                  <Users :size="20" />
                  <span>{{ group.members?.length || 0 }} members</span>
                </div>
                <div class="meta-item">
                  <Calendar :size="20" />
                  <span>Created {{ formatDate(group.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="group-actions">
              <template v-if="isAdmin">
                <button class="btn btn--white-outline" @click="showEditModal = true">
                  <Edit :size="20" />
                  <span>Edit Group</span>
                </button>
                <button class="btn btn--danger" @click="deleteGroup">
                  <Trash2 :size="20" />
                  <span>Delete</span>
                </button>
              </template>
              <button 
                v-if="isMember && !isAdmin" 
                class="btn btn--outline" 
                @click="leaveGroup"
                :disabled="processing"
              >
                <LogOut :size="20" />
                <span>Leave Group</span>
              </button>
              <button 
                v-else-if="!isMember"
                class="btn btn--primary" 
                @click="joinGroup"
                :disabled="processing"
              >
                <UserPlus :size="20" />
                <span>Join Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container main-container">
        <!-- Tabs -->
        <div class="tabs-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="overview-tab">
            <div class="grid-layout">
              <div class="main-column">
                <section class="section">
                  <h2>About this group</h2>
                  <p class="description">{{ group.description }}</p>
                </section>

                <section class="section">
                  <h2>Recent Activity</h2>
                  <div class="empty-state sm">
                    <Activity :size="32" />
                    <p>No recent activity</p>
                  </div>
                </section>
              </div>

              <aside class="sidebar-column">
                <div class="admins-card">
                  <h3>Admins</h3>
                  <div class="admins-list">
                    <div v-for="admin in admins" :key="admin.id" class="admin-item">
                      <div class="admin-avatar">
                        <img v-if="admin.user?.avatar" :src="admin.user.avatar" :alt="admin.user.name" />
                        <div v-else class="avatar-placeholder sm">
                          {{ (admin.user?.name || admin.user?.email || '?')[0].toUpperCase() }}
                        </div>
                      </div>
                      <div class="admin-info">
                        <span class="admin-name">{{ admin.user?.name || admin.user?.email }}</span>
                        <span class="admin-role">{{ admin.role }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          <!-- Discussions Tab -->
          <div v-if="activeTab === 'discussions'" class="discussions-tab">
            <div class="section-header">
              <h2>Discussions</h2>
              <button class="btn btn--sm btn--primary">New Discussion</button>
            </div>
            <div class="empty-state">
              <MessageSquare :size="48" />
              <h3>No discussions yet</h3>
              <p>Start a conversation with the group!</p>
            </div>
          </div>

          <!-- Members Tab -->
          <div v-if="activeTab === 'members'" class="members-tab">
            <div class="section-header">
              <h2>Members ({{ group.members?.length || 0 }})</h2>
              <div class="search-input sm">
                <Search :size="16" />
                <input type="text" placeholder="Find member..." />
              </div>
            </div>
            
            <div class="members-grid">
              <div v-for="member in group.members" :key="member.id" class="member-card">
                <div class="member-avatar">
                  <img v-if="member.user?.avatar" :src="member.user.avatar" :alt="member.user.name" />
                  <div v-else class="avatar-placeholder">
                    {{ (member.user?.name || member.user?.email || '?')[0].toUpperCase() }}
                  </div>
                </div>
                <div class="member-info">
                  <span class="member-name">{{ member.user?.name || member.user?.email }}</span>
                  <span class="member-role">{{ member.role }}</span>
                </div>
                <div v-if="isAdmin && member.userId !== authStore.user.id" class="member-actions">
                  <button class="icon-btn" title="Promote to Admin" @click="updateRole(member.userId, 'admin')">
                    <Shield :size="16" />
                  </button>
                  <button class="icon-btn danger" title="Remove Member" @click="removeMember(member.userId)">
                    <UserMinus :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Events Tab -->
          <div v-if="activeTab === 'events'" class="events-tab">
            <div class="section-header">
              <h2>Upcoming Events</h2>
              <button class="btn btn--sm btn--primary">Create Event</button>
            </div>
            <div class="empty-state">
              <Calendar :size="48" />
              <h3>No upcoming events</h3>
              <p>Check back later for group activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Group</h2>
          <button class="close-btn" @click="showEditModal = false">
            <X :size="24" />
          </button>
        </div>
        
        <form @submit.prevent="updateGroup" class="create-form">
          <div class="form-group">
            <label>Group Name</label>
            <input v-model="editForm.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="editForm.category" required>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description" required rows="4"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn btn--primary" :disabled="processing">
              {{ processing ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Users, Calendar, LogOut, UserPlus, Activity, 
  User, MessageSquare, Search, Edit, Trash2, Shield, UserMinus, X 
} from 'lucide-vue-next'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const group = ref(null)
const loading = ref(true)
const processing = ref(false)
const activeTab = ref('overview')
const showEditModal = ref(false)
const editForm = ref({ name: '', category: '', description: '' })
const categories = ['Community', 'Technology', 'Sports', 'Arts', 'Education', 'Health']

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'members', label: 'Members' },
  { id: 'events', label: 'Events' }
]

const isMember = computed(() => {
  return group.value?.members?.some(m => m.userId === authStore.user.id)
})

const isAdmin = computed(() => {
  if (!group.value || !authStore.user) return false
  const member = group.value.members?.find(m => m.userId === authStore.user.id)
  return member?.role === 'admin' || member?.role === 'owner'
})

const admins = computed(() => {
  return group.value?.members?.filter(m => m.role === 'admin' || m.role === 'owner') || []
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

const load = async () => {
  loading.value = true
  try {
    const data = await api.get(`/groups/${route.params.id}`)
    group.value = data.group
    editForm.value = {
      name: data.group.name,
      category: data.group.category,
      description: data.group.description
    }
  } catch (error) {
    console.error('Failed to load group:', error)
    toast.error('Failed to load group')
  } finally {
    loading.value = false
  }
}

const joinGroup = async () => {
  processing.value = true
  try {
    await api.post(`/groups/${route.params.id}/join`)
    await load()
    toast.success('Joined group successfully')
  } catch (error) {
    console.error('Failed to join group:', error)
    toast.error('Failed to join group')
  } finally {
    processing.value = false
  }
}

const leaveGroup = async () => {
  if (!confirm('Are you sure you want to leave this group?')) return
  
  processing.value = true
  try {
    await api.delete(`/groups/${route.params.id}/leave`)
    await load()
    toast.success('Left group successfully')
  } catch (error) {
    console.error('Failed to leave group:', error)
    toast.error('Failed to leave group')
  } finally {
    processing.value = false
  }
}

const deleteGroup = async () => {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return
  
  processing.value = true
  try {
    await api.delete(`/groups/${route.params.id}`)
    toast.success('Group deleted')
    router.push('/groups')
  } catch (error) {
    console.error('Failed to delete group:', error)
    toast.error('Failed to delete group')
  } finally {
    processing.value = false
  }
}

const updateGroup = async () => {
  processing.value = true
  try {
    await api.put(`/groups/${route.params.id}`, editForm.value)
    showEditModal.value = false
    await load()
    toast.success('Group updated')
  } catch (error) {
    console.error('Failed to update group:', error)
    toast.error('Failed to update group')
  } finally {
    processing.value = false
  }
}

const updateRole = async (userId, role) => {
  if (!confirm(`Promote this member to ${role}?`)) return
  try {
    await api.put(`/groups/${route.params.id}/members/${userId}`, { role })
    await load()
    toast.success('Member role updated')
  } catch (error) {
    console.error('Failed to update role:', error)
    toast.error('Failed to update role')
  }
}

const removeMember = async (userId) => {
  if (!confirm('Remove this member from the group?')) return
  try {
    await api.delete(`/groups/${route.params.id}/members/${userId}`)
    await load()
    toast.success('Member removed')
  } catch (error) {
    console.error('Failed to remove member:', error)
    toast.error('Failed to remove member')
  }
}

onMounted(load)
</script>

<style scoped>
.group-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding-bottom: 4rem;
}

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

/* Hero Section */
.hero-section {
  position: relative;
  height: 350px;
  color: white;
  margin-bottom: 0;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8));
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 3rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
}

.group-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.group-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 500;
}

.group-actions {
  display: flex;
  gap: 1rem;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid rgb(var(--color-border));
  margin-bottom: 2rem;
  background: white;
  padding: 0 1.5rem;
  position: sticky;
  top: 64px; /* Adjust based on navbar */
  z-index: 10;
}

.tab-btn {
  padding: 1rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgb(var(--color-text-secondary));
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: rgb(var(--color-primary));
}

.tab-btn.active {
  color: rgb(var(--color-primary));
  border-bottom-color: rgb(var(--color-primary));
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.main-container {
  background: white;
  min-height: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 2rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 3rem;
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

/* Sections */
.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: rgb(var(--color-text));
}

.description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: rgb(var(--color-text-secondary));
  white-space: pre-line;
}

/* Sidebar */
.admins-card {
  background: rgb(var(--color-background));
  padding: 1.5rem;
  border-radius: 1rem;
}

.admins-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.admin-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.admin-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-text-secondary));
  overflow: hidden;
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.admin-role {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

/* Members Grid */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.member-card {
  background: rgb(var(--color-background));
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.member-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  background: white;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-primary));
  color: white;
  font-weight: 600;
}

.avatar-placeholder.sm {
  font-size: 0.875rem;
}

.member-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.member-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
  text-transform: capitalize;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
  border-radius: 0.25rem;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: rgb(var(--color-primary));
}

.icon-btn.danger:hover {
  color: #ef4444;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border: 1px solid white;
  color: white;
}

.btn--outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.btn--white-outline {
  background: transparent;
  border: 1px solid white;
  color: white;
}

.btn--white-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn--danger {
  background: #ef4444;
  color: white;
}

.btn--danger:hover {
  background: #dc2626;
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  color: rgb(var(--color-text-secondary));
}

.empty-state.sm {
  padding: 2rem 0;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: rgb(var(--color-text));
}

/* Search Input */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-input.sm {
  position: relative;
  width: 250px;
}

.search-input.sm svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
}

.search-input.sm input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .tabs-nav {
    overflow-x: auto;
    padding-bottom: 0;
  }
  
  .tab-btn {
    white-space: nowrap;
  }
}
</style>
