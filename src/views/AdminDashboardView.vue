<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
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
      <main class="admin-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="admin-panel">
          <div class="panel-header">
            <h2>Overview</h2>
            <p>Platform statistics and health</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users">
                <Users :size="24" />
              </div>
              <div class="stat-info">
                <h3>Total Users</h3>
                <p class="stat-value">{{ stats.users || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon events">
                <Calendar :size="24" />
              </div>
              <div class="stat-info">
                <h3>Active Events</h3>
                <p class="stat-value">{{ stats.events || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon groups">
                <Users :size="24" />
              </div>
              <div class="stat-info">
                <h3>Groups</h3>
                <p class="stat-value">{{ stats.groups || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon initiatives">
                <Leaf :size="24" />
              </div>
              <div class="stat-info">
                <h3>Initiatives</h3>
                <p class="stat-value">{{ stats.initiatives || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="admin-panel">
          <div class="panel-header">
            <h2>User Management</h2>
            <div class="search-input">
              <Search :size="16" />
              <input v-model="userSearch" type="text" placeholder="Search users..." />
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="avatar-sm">
                        {{ (user.name || user.email)[0].toUpperCase() }}
                      </div>
                      <div class="user-info">
                        <span class="user-name">{{ user.name || 'Unnamed' }}</span>
                        <span class="user-email">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge role-badge">{{ user.role }}</span>
                  </td>
                  <td>
                    <span class="badge status-badge" :class="user.suspended ? 'suspended' : 'active'">
                      {{ user.suspended ? 'Suspended' : 'Active' }}
                    </span>
                  </td>
                  <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
                  <td>
                    <div class="actions-cell">
                      <button 
                        class="action-btn" 
                        :title="user.suspended ? 'Unsuspend' : 'Suspend'"
                        @click="toggleSuspend(user)"
                      >
                        <Ban :size="16" />
                      </button>
                      <button 
                        class="action-btn delete" 
                        title="Delete"
                        @click="deleteUser(user)"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="admin-panel">
          <div class="panel-header">
            <h2>Event Management</h2>
            <button class="btn btn--primary" @click="showCreateEvent = true">
              <Plus :size="16" />
              Create Event
            </button>
          </div>

          <div class="empty-state" v-if="events.length === 0">
            <Calendar :size="48" />
            <h3>No events found</h3>
          </div>

          <div class="events-list">
             <div v-for="event in events" :key="event.id" class="admin-event-card">
               <div class="event-info">
                 <h3>{{ event.title }}</h3>
                 <p>{{ new Date(event.date).toLocaleDateString() }} • {{ event.location }}</p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline">Edit</button>
                 <button class="btn btn--sm btn--danger" @click="deleteEvent(event.id)">Delete</button>
               </div>
             </div>
          </div>
        </div>

        <!-- Forum Moderation Tab -->
        <div v-if="activeTab === 'moderation'" class="admin-panel">
          <div class="panel-header">
            <h2>Content Moderation</h2>
            <p>Manage forum discussions and replies</p>
          </div>

          <div class="moderation-list">
            <div v-for="discussion in discussions" :key="discussion.id" class="moderation-card">
              <div class="mod-content">
                <h3>{{ discussion.title }}</h3>
                <p class="mod-preview">{{ discussion.content.substring(0, 100) }}...</p>
                <div class="mod-meta">
                  <span>By {{ discussion.author?.name || 'Unknown' }}</span>
                  <span>{{ new Date(discussion.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="mod-actions">
                <button class="btn btn--sm btn--danger" @click="deleteDiscussion(discussion.id)">
                  <Trash2 :size="16" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Newsletter Tab -->
        <div v-if="activeTab === 'newsletter'" class="admin-panel">
          <div class="panel-header">
            <h2>Send Newsletter</h2>
            <p>Compose and send updates to all subscribers</p>
          </div>

          <form @submit.prevent="sendNewsletter" class="newsletter-form">
            <div class="form-group">
              <label>Subject Line</label>
              <input v-model="newsletter.subject" type="text" required placeholder="e.g. Weekly Community Updates" />
            </div>

            <div class="form-group">
              <label>Content</label>
              <textarea 
                v-model="newsletter.content" 
                rows="10" 
                required 
                placeholder="Write your newsletter content here..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline">Preview</button>
              <button type="submit" class="btn btn--primary" :disabled="sending">
                {{ sending ? 'Sending...' : 'Send Newsletter' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>

    <!-- Create Event Modal (Simplified) -->
    <div v-if="showCreateEvent" class="modal-overlay" @click.self="showCreateEvent = false">
      <div class="modal-content">
        <h2>Create Event</h2>
        <form @submit.prevent="createEvent" class="create-form">
          <input v-model="newEvent.title" placeholder="Title" required />
          <input v-model="newEvent.date" type="datetime-local" required />
          <input v-model="newEvent.location" placeholder="Location" required />
          <textarea v-model="newEvent.description" placeholder="Description" required></textarea>
          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showCreateEvent = false">Cancel</button>
            <button type="submit" class="btn btn--primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { 
  LayoutDashboard, Users, Calendar, Mail, Leaf, 
  Search, Ban, Trash2, Plus, MessageSquare 
} from 'lucide-vue-next'
import api from '@/services/api'

const activeTab = ref('overview')
const stats = ref({})
const users = ref([])
const events = ref([])
const discussions = ref([])
const userSearch = ref('')
const showCreateEvent = ref(false)
const sending = ref(false)

const newsletter = ref({ subject: '', content: '' })
const newEvent = ref({ title: '', date: '', location: '', description: '' })

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'moderation', label: 'Moderation', icon: MessageSquare },
  { id: 'newsletter', label: 'Newsletter', icon: Mail }
]

const load = async () => {
  try {
    const statsData = await api.get('/admin/stats')
    stats.value = statsData.stats || {}
    
    const usersData = await api.get('/admin/users')
    users.value = usersData.users || []

    // Load events if endpoint exists
    try {
      const eventsData = await api.get('/events') 
      events.value = eventsData.events || []
    } catch (e) { console.warn('Events load failed', e) }

  } catch (err) {
    console.error('Failed to load admin data', err)
  }
}

const loadDiscussions = async () => {
  try {
    const data = await api.get('/forum/discussions?limit=50')
    discussions.value = data.discussions || []
  } catch (err) {
    console.error('Failed to load discussions', err)
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'moderation') {
    loadDiscussions()
  }
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.email.toLowerCase().includes(q) || 
    (u.name && u.name.toLowerCase().includes(q))
  )
})

const toggleSuspend = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}/suspend`, { suspended: !user.suspended })
    user.suspended = !user.suspended
  } catch (err) {
    console.error('Failed to suspend user', err)
    alert('Failed to update user status')
  }
}

const deleteUser = async (user) => {
  if (!confirm('Are you sure? This cannot be undone.')) return
  try {
    await api.delete(`/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (err) {
    console.error('Failed to delete user', err)
    alert('Failed to delete user')
  }
}

const createEvent = async () => {
  try {
    await api.post('/admin/events', newEvent.value)
    showCreateEvent.value = false
    newEvent.value = { title: '', date: '', location: '', description: '' }
    alert('Event created')
    const eventsData = await api.get('/events') 
    events.value = eventsData.events || []
  } catch (err) {
    console.error('Failed to create event', err)
    alert('Failed to create event')
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete this event?')) return
  try {
    await api.delete(`/admin/events/${id}`)
    events.value = events.value.filter(e => e.id !== id)
  } catch (err) {
    console.error('Failed to delete event', err)
  }
}

const deleteDiscussion = async (id) => {
  if (!confirm('Delete this discussion?')) return
  try {
    await api.delete(`/forum/discussions/${id}`)
    discussions.value = discussions.value.filter(d => d.id !== id)
  } catch (err) {
    console.error('Failed to delete discussion', err)
    alert('Failed to delete discussion')
  }
}

const sendNewsletter = async () => {
  sending.value = true
  // Simulate sending
  setTimeout(() => {
    alert(`Newsletter "${newsletter.value.subject}" sent to all subscribers!`)
    newsletter.value = { subject: '', content: '' }
    sending.value = false
  }, 1500)
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding: 2rem 0;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 0 1.5rem;
}

/* Sidebar */
.admin-sidebar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: rgb(var(--color-text));
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
  width: 100%;
  text-align: left;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

/* Content */
.admin-content {
  background: white;
  border-radius: 1rem;
  min-height: 600px;
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.panel-header p {
  color: rgb(var(--color-text-secondary));
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgb(var(--color-background));
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users { background: #3b82f6; }
.stat-icon.events { background: #f59e0b; }
.stat-icon.groups { background: #8b5cf6; }
.stat-icon.initiatives { background: #10b981; }

.stat-info h3 {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text-secondary));
  border-bottom: 1px solid rgb(var(--color-border));
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgb(var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.status-badge.suspended {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
}

.action-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fee2e2;
}

/* Forms */
.newsletter-form, .create-form {
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-family: inherit;
}

.form-actions, .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--outline {
  background: transparent;
  border: 1px solid rgb(var(--color-border));
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--danger {
  background: #ef4444;
  color: white;
}

.btn--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.admin-event-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.moderation-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: white;
}

.mod-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.mod-preview {
  color: rgb(var(--color-text-secondary));
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.mod-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

@media (max-width: 768px) {
  .admin-container {
    grid-template-columns: 1fr;
  }
  
  .admin-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .nav-item {
    white-space: nowrap;
    width: auto;
  }
  
  .admin-event-card, .moderation-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .event-actions, .mod-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
