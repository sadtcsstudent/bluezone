<template>
  <div class="company-page">
    <div class="company-container">
      <!-- Sidebar -->
      <aside class="company-sidebar">
        <div class="sidebar-header">
          <h2>Company Dashboard</h2>
        </div>
        <nav class="company-nav">
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
      <main class="company-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="company-panel">
          <div class="panel-header">
            <h2>Overview</h2>
            <p>Your company statistics</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon events">
                <Calendar :size="24" />
              </div>
              <div class="stat-info">
                <h3>My Events</h3>
                <p class="stat-value">{{ stats.events || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon initiatives">
                <Leaf :size="24" />
              </div>
              <div class="stat-info">
                <h3>My Initiatives</h3>
                <p class="stat-value">{{ stats.initiatives || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="company-panel">
          <div class="panel-header">
            <h2>My Events</h2>
            <button class="btn btn--primary" @click="openCreateEvent">
              <Plus :size="16" />
              Create Event
            </button>
          </div>

          <div class="empty-state" v-if="events.length === 0">
            <Calendar :size="48" />
            <h3>No events created yet</h3>
          </div>

          <div class="events-list">
             <div v-for="event in visibleEvents" :key="event.id" class="company-event-card">
               <div class="event-info">
                 <h3>{{ event.title }}</h3>
                 <p>{{ new Date(event.date).toLocaleDateString() }} • {{ event.location }}</p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditEvent(event)">Edit</button>
                 <button class="btn btn--sm btn--danger" @click="deleteEvent(event.id)">Delete</button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="visibleEvents.length < events.length">
            <button class="btn btn--outline" @click="eventsShown += 10">Load more events</button>
          </div>
        </div>

        <!-- Initiatives Tab -->
        <div v-if="activeTab === 'initiatives'" class="company-panel">
          <div class="panel-header">
            <h2>My Initiatives</h2>
             <button class="btn btn--primary" @click="openCreateInitiative">
              <Plus :size="16" />
              Add Initiative
            </button>
          </div>

          <div class="empty-state" v-if="initiatives.length === 0">
            <Leaf :size="48" />
            <h3>No initiatives created yet</h3>
          </div>

          <div class="events-list">
             <div v-for="initiative in visibleInitiatives" :key="initiative.id" class="company-event-card">
               <div class="event-info">
                 <h3>{{ initiative.name }}</h3>
                 <p class="meta-info">
                   <span :class="['type-badge', `type-badge--${initiative.type}`]">{{ initiative.type }}</span>
                   <span>• {{ initiative.location }}</span>
                 </p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditInitiative(initiative)">
                    <Edit :size="16" /> Edit
                 </button>
                 <button class="btn btn--sm btn--danger" @click="deleteInitiative(initiative.id)">
                    <Trash2 :size="16" /> Delete
                 </button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="visibleInitiatives.length < initiatives.length">
            <button class="btn btn--outline" @click="initiativesShown += 10">Load more initiatives</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Event Modal -->
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
          <div class="form-group">
             <label>Title</label>
             <input v-model="newEvent.title" placeholder="Title" required />
          </div>
          <div class="form-group">
             <label>Date & Time</label>
             <input v-model="newEvent.date" type="datetime-local" required />
          </div>
          <div class="form-group">
             <label>Location</label>
             <input v-model="newEvent.location" placeholder="Location" required />
          </div>
          <div class="form-group">
             <label>Category</label>
             <input v-model="newEvent.category" placeholder="Category (e.g. Sports)" required />
          </div>
          <div class="form-group">
             <label>Description</label>
             <textarea v-model="newEvent.description" placeholder="Description" required></textarea>
          </div>
          
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
        <h2>{{ isEditingInitiative ? 'Edit Initiative' : 'Add Company Initiative' }}</h2>
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
            <div id="company-picker-map" class="picker-map"></div>
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
import { onMounted, ref, computed } from 'vue'
import { LayoutDashboard, Calendar, Leaf, Plus, Trash2, Edit, Search, Upload, X } from 'lucide-vue-next'
import api from '@/services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const activeTab = ref('overview')
const stats = ref({})
const events = ref([])
const eventsShown = ref(10)
const visibleEvents = computed(() => events.value.slice(0, eventsShown.value))
const initiativesShown = ref(10)
const visibleInitiatives = computed(() => initiatives.value.slice(0, initiativesShown.value))
const initiatives = ref([])

const showCreateEvent = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const newEvent = ref({ title: '', date: '', location: '', description: '', category: 'General', imageUrl: '' })
const selectedImage = ref(null)
const imagePreview = ref(null)

const showCreateInitiative = ref(false)
const isEditingInitiative = ref(false)
const editingInitiativeId = ref(null)
const newInitiative = ref({ 
  name: '', type: 'garden', description: '', contact: '', website: '', coordinateX: 50, coordinateY: 50 
})
const map = ref(null)
const mapMarker = ref(null)
const addressQuery = ref('')
const searchingAddress = ref(false)

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'My Events', icon: Calendar },
  { id: 'initiatives', label: 'My Initiatives', icon: Leaf }
]

const loadData = async () => {
    try {
        const statsRes = await api.get('/company/stats')
        stats.value = statsRes.stats || {}
        
        const eventsRes = await api.get('/company/events')
        events.value = eventsRes.events || []
        eventsShown.value = 10

        const initRes = await api.get('/company/initiatives')
        initiatives.value = initRes.initiatives || []
        initiativesShown.value = 10
    } catch (err) {
        console.error('Failed to load company data', err)
    }
}

onMounted(() => {
    loadData()
})

// --- Events Logic ---
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
  try {
    const payload = { ...newEvent.value }
    if (selectedImage.value) {
      payload.imageUrl = await uploadEventImage()
    }

    if (isEditing.value && editingId.value) {
      await api.put(`/events/${editingId.value}`, payload)
      alert('Event updated')
    } else {
      await api.post('/events', payload)
      alert('Event created')
    }
    showCreateEvent.value = false
    selectedImage.value = null
    imagePreview.value = null
    loadData()
  } catch (err) {
    console.error('Failed to save event', err)
    alert('Failed to save event: ' + (err.response?.data?.message || err.message))
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete this event?')) return
  try {
    await api.delete(`/events/${id}`)
    loadData()
  } catch (err) {
    console.error('Failed to delete event', err)
    alert('Failed to delete event')
  }
}

// --- Initiatives Logic ---
const openCreateInitiative = () => {
  isEditingInitiative.value = false
  editingInitiativeId.value = null
  newInitiative.value = { 
    name: '', type: 'garden', description: '', contact: '', website: '', coordinateX: 50, coordinateY: 50, location: '' 
  }
  addressQuery.value = ''
  showCreateInitiative.value = true
  setTimeout(() => initMap(), 100)
}

const openEditInitiative = (initiative) => {
  isEditingInitiative.value = true
  editingInitiativeId.value = initiative.id
  newInitiative.value = { ...initiative }
  addressQuery.value = initiative.location || ''
  showCreateInitiative.value = true
  setTimeout(() => initMap(), 100)
}

const closeCreateInitiative = () => {
  showCreateInitiative.value = false
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

const saveInitiative = async () => {
    try {
        newInitiative.value.location = addressQuery.value
        if (isEditingInitiative.value) {
            await api.put(`/company/initiatives/${editingInitiativeId.value}`, newInitiative.value)
            alert('Initiative updated')
        } else {
            await api.post('/company/initiatives', newInitiative.value)
            alert('Initiative created')
        }
        closeCreateInitiative()
        loadData()
    } catch (err) {
        console.error('Failed to save initiative', err)
        alert('Failed: ' + (err.response?.data?.message || err.message))
    }
}

const deleteInitiative = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
        await api.delete(`/company/initiatives/${id}`)
        loadData()
    } catch (err) {
        console.error('Failed to delete initiative', err)
        alert('Failed')
    }
}

// Map Logic (Reused)
const initMap = () => {
  let lat = 52.22153
  let lng = 6.89366
  
  if (isEditingInitiative.value || (newInitiative.value.coordinateX !== 50 || newInitiative.value.coordinateY !== 50)) {
     const y = newInitiative.value.coordinateY
     const x = newInitiative.value.coordinateX
     lat = 52.24 - (y / 100) * 0.04
     lng = 6.87 + (x / 100) * 0.05
  }

  if (map.value) map.value.remove()

  map.value = L.map('company-picker-map').setView([lat, lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  
  if (isEditingInitiative.value || (newInitiative.value.coordinateX !== 50 || newInitiative.value.coordinateY !== 50)) {
     mapMarker.value = L.marker([lat, lng]).addTo(map.value)
  }

  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    const y = Math.max(0, Math.min(100, ((52.24 - lat) / 0.04) * 100))
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
      
      if (map.value) {
        map.value.setView([latitude, longitude], 16)
        if (mapMarker.value) {
          mapMarker.value.setLatLng([latitude, longitude]).bindPopup(display_name).openPopup()
        } else {
          mapMarker.value = L.marker([latitude, longitude]).addTo(map.value).bindPopup(display_name).openPopup()
        }
      }
      const y = Math.max(0, Math.min(100, ((52.24 - latitude) / 0.04) * 100))
      const x = Math.max(0, Math.min(100, ((longitude - 6.87) / 0.05) * 100))
      newInitiative.value.coordinateX = x
      newInitiative.value.coordinateY = y
      addressQuery.value = display_name
    } else {
      alert('Address not found')
    }
  } catch (err) {
    console.error(err)
    alert('Search failed')
  } finally {
    searchingAddress.value = false
  }
}
</script>

<style scoped>
.company-page {
  min-height: 100vh;
  background: white;
  padding-top: 1rem;
}
.company-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 0 2rem;
}
.company-sidebar {
  background: rgb(var(--color-surface));
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  border: 1px solid rgb(var(--color-border));
}
.sidebar-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}
.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  text-align: left;
}
.nav-item:hover {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}
.nav-item.active {
  background: rgb(var(--color-primary));
  color: white;
}
.company-content {
  background: white;
  min-height: 500px;
}
.company-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-background));
}
.stat-icon.events { color: rgb(var(--color-primary)); background: rgba(var(--color-primary), 0.1); }
.stat-icon.initiatives { color: #10B981; background: rgba(16, 185, 129, 0.1); }
.stat-info h3 { font-size: 0.875rem; color: rgb(var(--color-text-secondary)); margin-bottom: 0.25rem; }
.stat-value { font-size: 1.5rem; font-weight: 700; }
.events-list { display: flex; flex-direction: column; gap: 1rem; }
.company-event-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}
.btn--primary { background: rgb(var(--color-primary)); color: white; border: none; }
.btn--primary:hover { background: rgb(var(--color-primary-dark)); }
.btn--outline { background: transparent; border: 1px solid rgb(var(--color-border)); }
.btn--danger { background: rgba(239, 68, 68, 0.1); color: rgb(239, 68, 68); border: none; }
.btn--danger:hover { background: rgba(239, 68, 68, 0.2); }
.btn--ghost { background: transparent; border: none; }
.load-more-row { display: flex; justify-content: center; margin-top: 0.75rem; }
.empty-state {
  text-align: center;
  padding: 4rem;
  color: rgb(var(--color-text-secondary));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
/* Modal & form styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content--lg { max-width: 800px; }
.create-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.875rem; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select {
  padding: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
}
.file-upload-label {
  display: block;
  border: 1px dashed rgb(var(--color-border));
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
  background: rgb(var(--color-background));
}
.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
}
.file-input { display: none; }
.image-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
}
.remove-image { margin-top: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.picker-map { width: 100%; height: 300px; border-radius: 0.5rem; }
.type-badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; background: #eee; }
.type-badge--garden { color: #059669; background: #D1FAE5; }
.type-badge--market { color: #D97706; background: #FEF3C7; }
.type-badge--event { color: #2563EB; background: #DBEAFE; }
</style>
