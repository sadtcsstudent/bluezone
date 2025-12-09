<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>{{ $t('admin.panel') }}</h2>
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
            <h2>{{ $t('admin.overview') }}</h2>
            <p>{{ $t('admin.stats.platformHealth') }}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users">
                <Users :size="24" />
              </div>
              <div class="stat-info">
                <h3>{{ $t('admin.stats.totalUsers') }}</h3>
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
              <input v-model="userSearch" type="text" :placeholder="$t('admin.usersTab.searchPlaceholder')" />
            </div>
            <button 
              v-if="selectedUsers.length > 0" 
              class="btn btn--danger btn--sm" 
              style="margin-left: 1rem;"
              @click="deleteSelectedUsers"
            >
              <Trash2 :size="16" />
              Delete Selected ({{ selectedUsers.length }})
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      :checked="selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length"
                      @change="toggleAllUsers"
                    />
                  </th>
                  <th>{{ $t('admin.usersTab.table.user') }}</th>
                  <th>{{ $t('admin.usersTab.table.role') }}</th>
                  <th>{{ $t('admin.usersTab.table.status') }}</th>
                  <th>{{ $t('admin.usersTab.table.joined') }}</th>
                  <th>{{ $t('admin.usersTab.table.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <input 
                      type="checkbox" 
                      :checked="selectedUsers.includes(user.id)"
                      @change="toggleUserSelection(user.id)"
                    />
                  </td>
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
                    <select 
                      :value="user.role" 
                      @change="updateUserRole(user, $event.target.value)"
                      class="role-select"
                    >
                      <option value="user">User</option>
                      <option value="company">Company</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge status-badge" :class="user.suspended ? 'suspended' : (user.lockoutUntil && new Date(user.lockoutUntil) > new Date() ? 'locked' : 'active')">
                      {{ user.suspended ? 'Suspended' : (user.lockoutUntil && new Date(user.lockoutUntil) > new Date() ? 'Locked' : 'Active') }}
                    </span>
                  </td>
                  <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
                  <td>
                    <div class="actions-cell">
                      <button
                        v-if="user.lockoutUntil && new Date(user.lockoutUntil) > new Date()"
                        class="action-btn unlock"
                        title="Unlock Account"
                        @click="unlockAccount(user)"
                      >
                        <Unlock :size="16" />
                      </button>
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
            <h2>{{ $t('admin.eventsTab.manageEvents') }}</h2>
            <button class="btn btn--primary" @click="openCreateEvent">
              <Plus :size="16" />
              {{ $t('admin.eventsTab.createEvent') }}
            </button>
          </div>

          <div class="empty-state" v-if="events.length === 0">
            <Calendar :size="48" />
            <h3>{{ $t('admin.eventsTab.noEvents') }}</h3>
          </div>

          <div class="events-list">
             <div v-for="event in events" :key="event.id" class="admin-event-card">
               <div class="event-info">
                 <h3>{{ event.title }}</h3>
                 <p>{{ new Date(event.date).toLocaleDateString() }} • {{ event.location }}</p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditEvent(event)">{{ $t('common.edit') }}</button>
                 <button class="btn btn--sm btn--danger" @click="deleteEvent(event.id)">{{ $t('common.delete') }}</button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="events.length < eventsTotal">
            <button class="btn btn--outline" @click="fetchEvents()">{{ $t('admin.eventsTab.loadMore') }}</button>
          </div>
        </div>

        <!-- Polls Tab -->
        <div v-if="activeTab === 'polls'" class="admin-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('admin.pollsTab.pollsManager') }}</h2>
              <p>{{ $t('admin.pollsTab.subtitle') }}</p>
            </div>
            <button class="btn btn--primary btn--sm" @click="resetPollForm">
              <Plus :size="16" />
              New Poll
            </button>
          </div>

          <div class="polls-grid">
            <div class="poll-form-card">
              <div class="form-group">
                <label>Question</label>
                <input v-model="pollForm.question" placeholder="What would you like to ask?" />
              </div>

              <div class="form-group">
                <label>Options</label>
                <div
                  v-for="(option, index) in pollForm.options"
                  :key="option.id || index"
                  class="poll-option-input"
                >
                  <input v-model="option.text" placeholder="Option text" />
                  <button
                    v-if="pollForm.options.length > 2"
                    type="button"
                    class="btn btn--ghost btn--sm"
                    @click="removePollOption(index)"
                  >
                    Remove
                  </button>
                </div>
                <button type="button" class="btn btn--outline btn--sm" @click="addPollOption">
                  <Plus :size="14" />
                  Add option
                </button>
              </div>

              <div class="checkbox-group" style="display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0;">
                <label class="checkbox-row" style="display: flex; align-items: center; gap: 0.5rem;">
                  <input type="checkbox" v-model="pollForm.active" />
                  <span>Active</span>
                </label>
                <label class="checkbox-row" style="display: flex; align-items: center; gap: 0.5rem;">
                  <input type="checkbox" v-model="pollForm.allowMultiple" />
                  <span>Multi-Select</span>
                </label>
                <label class="checkbox-row" style="display: flex; align-items: center; gap: 0.5rem;">
                  <input type="checkbox" v-model="pollForm.allowChangeVote" />
                  <span>Allow Vote Change</span>
                </label>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn--ghost" @click="resetPollForm">Clear</button>
                <button
                  type="button"
                  class="btn btn--primary"
                  :disabled="pollSaving"
                  @click="savePoll"
                >
                  {{ pollSaving ? 'Saving...' : (editingPollId ? 'Update Poll' : 'Create Poll') }}
                </button>
              </div>
            </div>

            <div class="poll-list">
              <div v-if="pollsLoading" class="empty-state">
                <MessageSquare :size="32" />
                <p>Loading polls...</p>
              </div>
              <div v-else-if="polls.length === 0" class="empty-state">
                <MessageSquare :size="48" />
                <h3>No polls yet</h3>
                <p>Start a new poll to gather quick feedback.</p>
              </div>
              <div v-else class="poll-card" v-for="poll in polls" :key="poll.id">
                <div class="poll-card__header">
                  <div>
                    <div class="status-pill" :class="poll.active ? 'active' : 'inactive'">
                      {{ poll.active ? 'Active' : 'Paused' }}
                    </div>
                    <h3>{{ poll.question }}</h3>
                    <p class="meta">
                      {{ new Date(poll.createdAt).toLocaleDateString() }} • {{ poll.totalVotes }} vote{{ poll.totalVotes === 1 ? '' : 's' }}
                    </p>
                    <div class="poll-badges" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <span v-if="poll.allowMultiple" class="badge" style="background: #e0f2fe; color: #0284c7; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Multi</span>
                        <span v-if="poll.allowChangeVote" class="badge" style="background: #dcfce7; color: #16a34a; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Changeable</span>
                    </div>
                  </div>
                  <div class="poll-actions">
                    <button class="btn btn--sm btn--outline" @click="editPoll(poll)">Edit</button>
                    <button
                      class="btn btn--sm"
                      :class="poll.active ? 'btn--ghost' : 'btn--primary'"
                      @click="togglePollStatus(poll)"
                    >
                      {{ poll.active ? 'Pause' : 'Activate' }}
                    </button>
                    <button class="btn btn--sm btn--danger" @click="deletePoll(poll)">Delete</button>
                  </div>
                </div>
                <div class="poll-options-list">
                  <div class="poll-option-row" v-for="option in poll.options" :key="option.id">
                    <span>{{ option.text }}</span>
                    <span class="meta">{{ option.voteCount }} votes ({{ option.percentage }}%)</span>
                  </div>
                </div>
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
          <div class="load-more-row" v-if="discussions.length < discussionsTotal">
            <button class="btn btn--outline" @click="fetchDiscussions()">Load more discussions</button>
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

        <!-- Initiatives Tab -->
        <div v-if="activeTab === 'initiatives'" class="admin-panel">
          <div class="panel-header">
            <h2>Initiatives Management</h2>
             <button class="btn btn--primary" @click="openCreateInitiative">
              <Plus :size="16" />
              Add Initiative
            </button>
          </div>

          <div class="empty-state" v-if="initiatives.length === 0">
            <Leaf :size="48" />
            <h3>No initiatives found</h3>
          </div>

          <div class="events-list">
             <div v-for="initiative in visibleInitiatives" :key="initiative.id" class="admin-event-card">
               <div class="event-info">
                 <h3>{{ initiative.name }}</h3>
                 <p class="meta-info">
                   <span :class="['type-badge', `type-badge--${initiative.type}`]">{{ initiative.type }}</span>
                   <span>• {{ initiative.location }}</span>
                 </p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditInitiative(initiative)">Edit</button>
                 <button class="btn btn--sm btn--danger" @click="deleteInitiative(initiative.id)">Delete</button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="visibleInitiatives.length < initiatives.length">
            <button class="btn btn--outline" @click="initiativesShown += 10">Load more initiatives</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Event Modal (Simplified) -->
    <div v-if="showCreateEvent" class="modal-overlay" @click.self="showCreateEvent = false">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Edit Event' : 'Create Event' }}</h2>
        <form @submit.prevent="saveEvent" class="create-form">
          
          <div class="form-group">
            <label class="file-upload-label">
              <div class="upload-placeholder" v-if="!imagePreview">
                <Upload :size="24" />
                <span>Upload Event Photo</span>
              </div>
              <img v-else :src="imagePreview" class="image-preview" />
              <input type="file" accept="image/*" @change="handleImageSelect" class="file-input" />
            </label>
            <button v-if="imagePreview" type="button" class="btn btn--sm btn--ghost remove-image" @click="imagePreview = null; selectedImage = null; newEvent.imageUrl = ''">
              <X :size="16" /> Remove Image
            </button>
          </div>

          <input v-model="newEvent.title" placeholder="Title" required />
          <input v-model="newEvent.date" type="datetime-local" required />
          <input v-model="newEvent.location" placeholder="Location" required />
          <input v-model="newEvent.category" placeholder="Category (e.g. Sports, Music)" required />
          <textarea v-model="newEvent.description" placeholder="Description" required></textarea>
          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showCreateEvent = false">Cancel</button>
            <button type="submit" class="btn btn--primary">{{ isEditing ? 'Save Changes' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Initiative Modal -->
     <div v-if="showCreateInitiative" class="modal-overlay" @click.self="closeCreateInitiative">
      <div class="modal-content modal-content--lg">
        <h2>{{ isEditingInitiative ? 'Edit Initiative' : 'Add Community Initiative' }}</h2>
        <form @submit.prevent="saveInitiative" class="create-form">
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input v-model="newInitiative.name" placeholder="Initiative Name" required />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select v-model="newInitiative.type" required>
                <option value="garden">Community Garden</option>
                <option value="market">Farmers Market</option>
                <option value="event">Local Event</option>
                <option value="group">Walking/Activity Group</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newInitiative.description" placeholder="Describe the initiative..." required rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contact Info (Optional)</label>
              <input v-model="newInitiative.contact" placeholder="Email or Phone" />
            </div>
            <div class="form-group">
              <label>Website (Optional)</label>
              <input v-model="newInitiative.website" placeholder="www.example.com" />
            </div>
          </div>

          <div class="form-group">
            <label>Location (Click on map or search address)</label>
            <div class="form-group" style="margin-bottom: 1rem;">
              <div class="search-row" style="display: flex; gap: 0.5rem;">
                <input 
                  v-model="addressQuery" 
                  placeholder="Type an address to find..." 
                  @keydown.enter.prevent="searchAddress"
                />
                <button type="button" class="btn btn--outline" @click="searchAddress" :disabled="searchingAddress">
                  <Search :size="16" />
                  {{ searchingAddress ? '...' : 'Find' }}
                </button>
              </div>
            </div>
            <div id="picker-map" class="picker-map"></div>
            <p class="help-text">Selected coordinates: {{ newInitiative.coordinateX.toFixed(1) }}, {{ newInitiative.coordinateY.toFixed(1) }}</p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="closeCreateInitiative">Cancel</button>
            <button type="submit" class="btn btn--primary">{{ isEditingInitiative ? 'Save Changes' : 'Create Initiative' }}</button>
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
  Search, Ban, Trash2, Plus, MessageSquare, Unlock, MapPin, PieChart
} from 'lucide-vue-next'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const activeTab = ref('overview')
const stats = ref({})
const users = ref([])
const events = ref([])
const eventsTotal = ref(0)
const eventsOffset = ref(0)
const initiatives = ref([])
const initiativesShown = ref(10)
const discussions = ref([])
const discussionsTotal = ref(0)
const discussionsOffset = ref(0)
const polls = ref([])
const pollsLoading = ref(false)
const pollForm = ref({
  question: '',
  active: true,
  allowMultiple: false,
  allowChangeVote: false,
  options: [{ text: '' }, { text: '' }]
})
const editingPollId = ref(null)
const pollSaving = ref(false)
const userSearch = ref('')
const showCreateEvent = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const sending = ref(false)
const addressQuery = ref('')
const searchingAddress = ref(false)

const newsletter = ref({ subject: '', content: '' })
const newEvent = ref({ title: '', date: '', location: '', description: '', category: 'General', imageUrl: '' })
const selectedImage = ref(null)
const imagePreview = ref(null)
const newInitiative = ref({ 
  name: '', 
  type: 'garden', 
  description: '', 
  contact: '', 
  website: '',
  coordinateX: 50,
  coordinateY: 50
})
const showCreateInitiative = ref(false)
const isEditingInitiative = ref(false)
const editingInitiativeId = ref(null)
const map = ref(null)
const mapMarker = ref(null)

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'polls', label: 'Polls', icon: PieChart },
  { id: 'initiatives', label: 'Initiatives', icon: Leaf },
  { id: 'moderation', label: 'Moderation', icon: MessageSquare },
  { id: 'newsletter', label: 'Newsletter', icon: Mail }
]

const visibleInitiatives = computed(() => initiatives.value.slice(0, initiativesShown.value))

const fetchEvents = async (reset = false) => {
  try {
    if (reset) {
      eventsOffset.value = 0
      events.value = []
    }
    const limit = 10
    const data = await api.get(`/events?limit=${limit}&offset=${eventsOffset.value}`)
    const fetched = data.events || []
    eventsTotal.value = data.total || fetched.length
    events.value = [...events.value, ...fetched]
    eventsOffset.value += limit
  } catch (e) {
    console.warn('Events load failed', e)
  }
}

const load = async () => {
  try {
    const statsData = await api.get('/admin/stats')
    stats.value = statsData.stats || {}
    
    const usersData = await api.get('/admin/users')
    users.value = usersData.users || []

    await fetchEvents(true)

    try {
      const initData = await api.get('/initiatives')
      initiatives.value = initData.initiatives || []
      initiativesShown.value = 10
    } catch (e) { console.warn('Initiatives load failed', e) }

  } catch (err) {
    console.error('Failed to load admin data', err)
  }
}

const fetchDiscussions = async (reset = false) => {
  try {
    if (reset) {
      discussionsOffset.value = 0
      discussions.value = []
    }
    const limit = 20
    const data = await api.get(`/forum/discussions?limit=${limit}&offset=${discussionsOffset.value}`)
    const fetched = data.discussions || []
    discussionsTotal.value = data.total || fetched.length
    discussions.value = [...discussions.value, ...fetched]
    discussionsOffset.value += limit
  } catch (err) {
    console.error('Failed to load discussions', err)
  }
}

const fetchPolls = async () => {
  pollsLoading.value = true
  try {
    const data = await api.get('/polls/manage')
    polls.value = data.polls || []
  } catch (err) {
    console.error('Failed to load polls', err)
    alert('Failed to load polls')
  } finally {
    pollsLoading.value = false
  }
}

const resetPollForm = () => {
  pollForm.value = {
    question: '',
    active: true,
    allowMultiple: false,
    allowChangeVote: false,
    options: [{ text: '' }, { text: '' }]
  }
  editingPollId.value = null
}

const addPollOption = () => {
  pollForm.value.options.push({ text: '' })
}

const removePollOption = (index) => {
  if (pollForm.value.options.length <= 2) {
    alert('Polls need at least two options')
    return
  }
  pollForm.value.options.splice(index, 1)
}

const editPoll = (poll) => {
  editingPollId.value = poll.id
  pollForm.value = {
    question: poll.question,
    active: poll.active,
    allowMultiple: poll.allowMultiple || false,
    allowChangeVote: poll.allowChangeVote || false,
    options: poll.options.map((opt) => ({ id: opt.id, text: opt.text }))
  }
}

const savePoll = async () => {
  const question = (pollForm.value.question || '').trim()
  const options = pollForm.value.options
    .map((opt) => ({ ...opt, text: (opt.text || '').trim() }))
    .filter((opt) => opt.text)

  if (!question) {
    alert('Please add a poll question')
    return
  }

  if (options.length < 2) {
    alert('Add at least two options')
    return
  }

  pollSaving.value = true
  try {
    const payload = { 
      question, 
      active: pollForm.value.active, 
      allowMultiple: pollForm.value.allowMultiple,
      allowChangeVote: pollForm.value.allowChangeVote,
      options 
    }
    if (editingPollId.value) {
      const res = await api.put(`/polls/${editingPollId.value}`, payload)
      const idx = polls.value.findIndex((p) => p.id === editingPollId.value)
      if (idx !== -1 && res.poll) {
        polls.value.splice(idx, 1, res.poll)
      }
    } else {
      const res = await api.post('/polls', payload)
      if (res.poll) {
        polls.value = [res.poll, ...polls.value]
      }
    }
    await fetchPolls()
    resetPollForm()
  } catch (err) {
    console.error('Failed to save poll', err)
    alert('Failed to save poll')
  } finally {
    pollSaving.value = false
  }
}

const togglePollStatus = async (poll) => {
  try {
    const res = await api.put(`/polls/${poll.id}`, { active: !poll.active })
    if (res.poll) {
      const idx = polls.value.findIndex((p) => p.id === poll.id)
      if (idx !== -1) polls.value.splice(idx, 1, res.poll)
    } else {
      poll.active = !poll.active
    }
  } catch (err) {
    console.error('Failed to update poll', err)
    alert('Failed to update poll status')
  }
}

const deletePoll = async (poll) => {
  if (!confirm('Delete this poll?')) return
  try {
    await api.delete(`/polls/${poll.id}`)
    polls.value = polls.value.filter((p) => p.id !== poll.id)
    if (editingPollId.value === poll.id) resetPollForm()
  } catch (err) {
    console.error('Failed to delete poll', err)
    alert('Failed to delete poll')
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'moderation') {
    fetchDiscussions(true)
  }
  if (newTab === 'events') {
    fetchEvents(true)
  }
  if (newTab === 'polls') {
    resetPollForm()
    fetchPolls()
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

const updateUserRole = async (user, newRole) => {
  if (user.role === newRole) return
  if (!confirm(`Change role of ${user.name || user.email} to ${newRole}?`)) {
    // Reset selection (this is tricky with simple select, usually requires forcing update)
    // For simplicity, we assume the user confirms or we'd need to re-render.
    // Ideally we force re-render, but let's just proceed.
    return
  }
  
  try {
    await api.put(`/admin/users/${user.id}/role`, { role: newRole })
    user.role = newRole
    alert('User role updated')
  } catch (err) {
    console.error('Failed to update user role', err)
    alert('Failed to update user role')
  }
}

const unlockAccount = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}/unlock`)
    user.lockoutUntil = null
    user.failedLoginAttempts = 0
    alert('Account unlocked successfully')
  } catch (err) {
    console.error('Failed to unlock user', err)
    alert('Failed to unlock account')
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

const selectedUsers = ref([])

const toggleUserSelection = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  } else {
    selectedUsers.value.push(userId)
  }
}

const toggleAllUsers = () => {
  if (selectedUsers.value.length === filteredUsers.value.length) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = filteredUsers.value.map(u => u.id)
  }
}

const deleteSelectedUsers = async () => {
  if (selectedUsers.value.length === 0) return
  if (!confirm(`Are you sure you want to delete ${selectedUsers.value.length} users? This cannot be undone.`)) return
  
  try {
    await api.post('/admin/users/bulk-delete', { userIds: selectedUsers.value })
    users.value = users.value.filter(u => !selectedUsers.value.includes(u.id))
    selectedUsers.value = []
    alert('Selected users deleted successfully')
  } catch (err) {
    console.error('Failed to delete selected users', err)
    alert('Failed to delete selected users')
  }
}

const openCreateEvent = () => {
  isEditing.value = false
  editingId.value = null
  newEvent.value = { title: '', date: '', location: '', description: '', category: 'General', imageUrl: '' }
  selectedImage.value = null
  imagePreview.value = null
  showCreateEvent.value = true
}

const openEditEvent = (event) => {
  isEditing.value = true
  editingId.value = event.id
  // Format date for datetime-local input
  const dateStr = new Date(event.date).toISOString().slice(0, 16)
  
  newEvent.value = { 
    title: event.title, 
    date: dateStr, 
    location: event.location, 
    description: event.description,
    category: event.category || 'General',
    imageUrl: event.imageUrl || ''
  }
  selectedImage.value = null
  imagePreview.value = event.imageUrl || null
  showCreateEvent.value = true
}

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedImage.value = file
  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadEventImage = async () => {
  if (!selectedImage.value) return newEvent.value.imageUrl || ''
  const formData = new FormData()
  formData.append('file', selectedImage.value)
  const res = await api.post('/upload/event-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.url
}

const saveEvent = async () => {
    // Validation
    if (!newEvent.value.title.trim()) {
      useToastStore().error('Event title is required')
      return
    }
    if (!newEvent.value.date) {
      useToastStore().error('Event date is required')
      return
    }
    if (!newEvent.value.location.trim()) {
      useToastStore().error('Event location is required')
      return
    }

    try {
      const payload = { ...newEvent.value }
      if (selectedImage.value) {
        payload.imageUrl = await uploadEventImage()
      }

      if (isEditing.value && editingId.value) {
        await api.put(`/admin/events/${editingId.value}`, payload)
        useToastStore().success('Event updated successfully')
      } else {
        await api.post('/admin/events', payload)
        useToastStore().success('Event created successfully')
      }
      
      showCreateEvent.value = false
      newEvent.value = { title: '', date: '', location: '', description: '', category: 'General', imageUrl: '' }
      selectedImage.value = null
      imagePreview.value = null
      editingId.value = null
      isEditing.value = false
      
      await fetchEvents(true)
    } catch (err) {
      console.error('Failed to save event', err)
      const message = err.response?.data?.message || err.message || 'Failed to save event'
      useToastStore().error(message)
    }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete this event?')) return
  try {
    await api.delete(`/admin/events/${id}`)
    await fetchEvents(true)
  } catch (err) {
    console.error('Failed to delete event', err)
  }
}

const deleteDiscussion = async (id) => {
  if (!confirm('Delete this discussion?')) return
  try {
    await api.delete(`/forum/discussions/${id}`)
    discussions.value = discussions.value.filter(d => d.id !== id)
    discussionsTotal.value = Math.max(discussionsTotal.value - 1, discussions.value.length)
  } catch (err) {
    console.error('Failed to delete discussion', err)
    alert('Failed to delete discussion')
  }
}

const sendNewsletter = async () => {
  if (!newsletter.value.subject || !newsletter.value.content) {
    alert('Please fill in both subject and content');
    return;
  }
  
  if (!confirm('Are you sure you want to send this newsletter to ALL subscribers?')) return;

  sending.value = true;
  try {
    const response = await api.post('/admin/newsletter/send', {
      subject: newsletter.value.subject,
      content: newsletter.value.content
    });
    
    alert(response.message || `Newsletter sent to ${response.count} subscribers!`);
    newsletter.value = { subject: '', content: '' };
  } catch (err) {
    console.error('Failed to send newsletter', err);
    alert('Failed to send newsletter: ' + (err.response?.data?.message || err.message));
  } finally {
    sending.value = false;
  }
}




const openCreateInitiative = () => {
  isEditingInitiative.value = false
  editingInitiativeId.value = null
  newInitiative.value = { 
    name: '', 
    type: 'garden', 
    description: '', 
    contact: '', 
    website: '', 
    coordinateX: 50, 
    coordinateY: 50 
  }
  addressQuery.value = ''
  
  showCreateInitiative.value = true
  // Wait for DOM
  setTimeout(() => {
    initPickerMap()
  }, 100)
}

const openEditInitiative = (initiative) => {
  isEditingInitiative.value = true
  editingInitiativeId.value = initiative.id
  newInitiative.value = { ...initiative }
  addressQuery.value = initiative.location || ''
  
  showCreateInitiative.value = true
  setTimeout(() => {
    initPickerMap()
  }, 100)
}

const closeCreateInitiative = () => {
  showCreateInitiative.value = false
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

const initPickerMap = () => {
  // Use existing coords if editing, else default
  // Default: Enschede center approx
  // If editing, convert X/Y back to Lat/Lng? 
  // MapView logic:
  // lat = 52.24 - (y / 100) * 0.04
  // lng = 6.87 + (x / 100) * 0.05
  
  let lat = 52.22153
  let lng = 6.89366
  
  if (isEditingInitiative.value || (newInitiative.value.coordinateX !== 50 || newInitiative.value.coordinateY !== 50)) {
     const y = newInitiative.value.coordinateY
     const x = newInitiative.value.coordinateX
     lat = 52.24 - (y / 100) * 0.04
     lng = 6.87 + (x / 100) * 0.05
  }

  const zoom = 13

  if (map.value) {
      map.value.remove() // Clean up existing map instance if any (though usually destroyed on close)
  }

  map.value = L.map('picker-map').setView([lat, lng], zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  
  // Add initial marker if editing or coordinates set
  if (isEditingInitiative.value || (newInitiative.value.coordinateX !== 50 || newInitiative.value.coordinateY !== 50)) {
     mapMarker.value = L.marker([lat, lng]).addTo(map.value)
     if (newInitiative.value.location) {
         mapMarker.value.bindPopup(newInitiative.value.location)
     }
  }

  // Add click handler
  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    
    // Convert to 0-100 scale (matching MapView logic)
    // Y: 0% -> 52.24 (Top), 100% -> 52.20 (Bottom)
    // lat = 52.24 - (y / 100) * 0.04  =>  y = ((52.24 - lat) / 0.04) * 100
    const y = Math.max(0, Math.min(100, ((52.24 - lat) / 0.04) * 100))
    
    // X: 0% -> 6.87 (Left), 100% -> 6.92 (Right)
    // lng = 6.87 + (x / 100) * 0.05  =>  x = ((lng - 6.87) / 0.05) * 100
    const x = Math.max(0, Math.min(100, ((lng - 6.87) / 0.05) * 100))

    newInitiative.value.coordinateX = x
    newInitiative.value.coordinateY = y

    if (mapMarker.value) {
      mapMarker.value.setLatLng([lat, lng])
    } else {
      mapMarker.value = L.marker([lat, lng]).addTo(map.value)
    }
  })
}

const searchAddress = async () => {
  if (!addressQuery.value) return
  
  searchingAddress.value = true
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery.value)}`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)
      
      // Update Map
      if (map.value) {
        map.value.setView([latitude, longitude], 16)
        
        if (mapMarker.value) {
          mapMarker.value.setLatLng([latitude, longitude])
            .bindPopup(display_name).openPopup()
        } else {
          mapMarker.value = L.marker([latitude, longitude]).addTo(map.value)
            .bindPopup(display_name).openPopup()
        }
      }

      // Calculate X/Y
      // Y: 0% -> 52.24 (Top), 100% -> 52.20 (Bottom)
      const y = Math.max(0, Math.min(100, ((52.24 - latitude) / 0.04) * 100))
      // X: 0% -> 6.87 (Left), 100% -> 6.92 (Right)
      const x = Math.max(0, Math.min(100, ((longitude - 6.87) / 0.05) * 100))

      newInitiative.value.coordinateX = x
      newInitiative.value.coordinateY = y
      
      // Update location text
      // We'll use the query or the display name, let's use the short display name or just the query for now
      // and maybe format it a bit given the user request "address should be dispplayed on map"
      newInitiative.value.location = addressQuery.value 
    } else {
      alert('Address not found')
    }
  } catch (err) {
    console.error('Geocoding error', err)
    alert('Failed to search address')
  } finally {
    searchingAddress.value = false
  }
}

const saveInitiative = async () => {
    // Validation
    if (!newInitiative.value.name.trim()) {
      useToastStore().error('Initiative name is required')
      return
    }
    if (!newInitiative.value.description.trim() || newInitiative.value.description.length < 10) {
      useToastStore().error('Description must be at least 10 characters')
      return
    }

    try {
      if (isEditingInitiative.value && editingInitiativeId.value) {
         await api.put(`/initiatives/${editingInitiativeId.value}`, {
          ...newInitiative.value,
          location: 'Enschede Area' // Keeping it simple as per original
         })
         useToastStore().success('Initiative updated successfully')
      } else {
         await api.post('/initiatives', {
          ...newInitiative.value,
          location: 'Enschede Area'
         })
         useToastStore().success('Initiative created successfully')
      }
      showCreateInitiative.value = false
      setTimeout(() => load(), 500) // Refresh data
    } catch (err) {
      console.error('Failed to save initiative', err)
      useToastStore().error('Failed to save initiative')
    }
  }


const deleteInitiative = async (id) => {
  if (!confirm('Are you sure you want to delete this initiative?')) return
  try {
    await api.delete(`/initiatives/${id}`)
    initiatives.value = initiatives.value.filter(i => i.id !== id)
  } catch (err) {
    console.error('Failed to delete initiative', err)
    alert('Failed to delete initiative')
  }
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

.status-badge.locked {
  background: rgba(249, 115, 22, 0.1);
  color: #c2410c;
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

.action-btn.unlock:hover {
  background: #dbeafe;
  color: #2563eb;
  border-color: #dbeafe;
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

.modal-content--lg {
  max-width: 800px;
}

.picker-map {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  margin-top: 0.5rem;
  z-index: 10;
}

.role-select {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  font-size: 0.875rem;
}

.help-text {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  margin-top: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.type-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge--garden { background: #dcfce7; color: #166534; }
.type-badge--market { background: #fef9c3; color: #854d0e; }
.type-badge--event { background: #e0e7ff; color: #3730a3; }
.type-badge--group { background: #fae8ff; color: #86198f; }

.meta-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
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

.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
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

.polls-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 992px) {
  .polls-grid {
    grid-template-columns: 1fr 1.2fr;
  }
}

.poll-form-card {
  border: 1px solid rgb(var(--color-border));
  border-radius: 1rem;
  padding: 1.25rem;
  background: rgb(var(--color-background));
  display: grid;
  gap: 1rem;
}

.poll-option-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.poll-list {
  display: grid;
  gap: 1rem;
}

.poll-card {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 1rem;
  background: white;
}

.poll-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.poll-card__header h3 {
  margin: 0.25rem 0;
}

.poll-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.poll-options-list {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.5rem;
}

.poll-option-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgb(var(--color-border));
}

.poll-option-row:last-child {
  border-bottom: none;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.75rem;
  width: fit-content;
}

.status-pill.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.status-pill.inactive {
  background: #fef2f2;
  color: #b91c1c;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.vote-chip {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: rgb(var(--color-background));
  border-radius: 9999px;
  font-weight: 600;
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
  
  .poll-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .poll-actions {
    justify-content: flex-start;
  }

  .polls-grid {
    grid-template-columns: 1fr;
  }
}

.file-upload-label {
  display: block;
  cursor: pointer;
  border: 2px dashed rgb(var(--color-border));
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.file-upload-label:hover {
  background: rgb(var(--color-background));
  border-color: rgb(var(--color-primary));
}

.upload-placeholder {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
}

.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.file-input {
  display: none;
}

.remove-image {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}
</style>
