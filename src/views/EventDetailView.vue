<template>
  <div class="event-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="event" class="event-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <ImageWithFallback 
            :src="event.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80'" 
            class-name="hero-img"
            alt="Event cover"
          />
          <div class="hero-overlay"></div>
        </div>
        
        <div class="hero-content container">
          <div class="hero-badges">
            <span class="badge category">{{ event.category || 'Community' }}</span>
            <span v-if="event.status === 'registered'" class="badge status-registered">
              <Check :size="14" /> Registered
            </span>
          </div>
          
          <h1 class="hero-title">{{ event.title }}</h1>
          
          <div class="hero-meta">
            <div class="meta-item">
              <Calendar :size="20" />
              <span>{{ formatDate(event.date) }}</span>
            </div>
            <div class="meta-item">
              <Clock :size="20" />
              <span>{{ event.time }}</span>
            </div>
            <div class="meta-item">
              <MapPin :size="20" />
              <span>{{ event.location }}</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn btn--white-outline" @click="shareEvent">
              <Share2 :size="18" /> Share
            </button>
            <button class="btn btn--white-outline" @click="downloadICS">
              <Download :size="18" /> Add to Calendar
            </button>
          </div>
        </div>
      </div>

      <div class="main-container container">
        <div class="grid-layout">
          <!-- Left Column -->
          <div class="main-column">
            <section class="section">
              <h2>About this event</h2>
              <p class="description">{{ event.description }}</p>
            </section>

            <section class="section">
              <div class="section-header">
                <h2>Attendees</h2>
                <span class="attendee-count">{{ attendees.length }} going</span>
              </div>
              
              <div class="attendees-grid">
                <div v-for="a in attendees.slice(0, 8)" :key="a.id" class="attendee-card">
                  <div class="attendee-avatar">
                    <img v-if="a.avatar" :src="a.avatar" :alt="a.name" />
                    <div v-else class="avatar-placeholder">
                      {{ (a.name || a.email || '?')[0].toUpperCase() }}
                    </div>
                  </div>
                  <span class="attendee-name">{{ a.name || a.email.split('@')[0] }}</span>
                </div>
                <div v-if="attendees.length > 8" class="attendee-more">
                  <span>+{{ attendees.length - 8 }}</span>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column (Sidebar) -->
          <aside class="sidebar-column">
            <div class="registration-card">
              <h3>Registration</h3>
              <div class="capacity-info" v-if="event.maxAttendees">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${(attendees.length / event.maxAttendees) * 100}%` }"
                  ></div>
                </div>
                <div class="capacity-text">
                  <span>{{ attendees.length }} spots taken</span>
                  <span>{{ event.maxAttendees }} total</span>
                </div>
              </div>

              <div class="action-buttons">
                <button 
                  v-if="event.status !== 'registered'"
                  @click="register('registered')" 
                  class="btn btn--primary btn--full"
                  :disabled="event.maxAttendees && attendees.length >= event.maxAttendees"
                >
                  {{ (event.maxAttendees && attendees.length >= event.maxAttendees) ? 'Full' : 'Register Now' }}
                </button>
                
                <button 
                  v-else
                  @click="unregister" 
                  class="btn btn--danger-outline btn--full"
                >
                  Unregister
                </button>

                <button 
                  @click="register('interested')" 
                  class="btn btn--outline btn--full"
                  :class="{ 'active': event.status === 'interested' }"
                >
                  <Star :size="18" />
                  <span>{{ event.status === 'interested' ? 'Interested' : 'Mark as Interested' }}</span>
                </button>
              </div>
            </div>

            <div class="host-card">
              <h3>Hosted by</h3>
              <div class="host-info">
                <div class="host-avatar">
                  <User :size="24" />
                </div>
                <div class="host-details">
                  <span class="host-name">Community Leader</span>
                  <span class="host-role">Organizer</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Clock, MapPin, Check, Star, User, Share2, Download } from 'lucide-vue-next'
import api from '@/services/api'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const event = ref(null)
const attendees = ref([])
const loading = ref(true)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const load = async () => {
  loading.value = true
  try {
    const data = await api.get(`/events/${route.params.id}`)
    const isRegistered = data.isRegistered ?? ((data.event?.registrations || []).some((r) => r.userId === authStore.user?.id))
    event.value = { ...data.event, status: isRegistered ? 'registered' : null }
    attendees.value = data.attendees || data.event?.registrations?.map((r) => r.user).filter(Boolean) || []
  } catch (error) {
    console.error('Failed to load event:', error)
  } finally {
    loading.value = false
  }
}

const register = async (status) => {
  try {
    await api.post(`/events/${route.params.id}/register`, { status })
    await load()
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

const unregister = async () => {
  if (!confirm('Are you sure you want to unregister?')) return
  try {
    await api.delete(`/events/${route.params.id}/register`)
    await load()
  } catch (error) {
    console.error('Unregistration failed:', error)
  }
}

const shareEvent = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: event.value.title,
        text: `Check out this event: ${event.value.title}`,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
}

const downloadICS = () => {
  const e = event.value
  const startDate = new Date(e.date).toISOString().replace(/-|:|\.\d+/g, '')
  const endDate = new Date(new Date(e.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '') // Assume 2 hours
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${e.title}
DESCRIPTION:${e.description}
LOCATION:${e.location}
END:VEVENT
END:VCALENDAR`

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', `${e.title}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(load)
</script>

<style scoped>
.event-page {
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
  height: 400px;
  color: white;
  margin-bottom: 3rem;
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

.hero-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.badge.category {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.badge.status-registered {
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn--white-outline {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(4px);
}

.btn--white-outline:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

/* Main Column */
.section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 1.5rem;
}

.description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: rgb(var(--color-text-secondary));
  white-space: pre-line;
}

/* Attendees */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.attendee-count {
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
}

.attendees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1.5rem;
}

.attendee-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.attendee-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: rgb(var(--color-background));
}

.attendee-avatar img {
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
  font-size: 1.25rem;
}

.attendee-name {
  font-size: 0.875rem;
  color: rgb(var(--color-text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* Sidebar */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.registration-card, .host-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgb(var(--color-border));
}

.registration-card h3, .host-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: rgb(var(--color-text));
}

.capacity-info {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 0.5rem;
  background: rgb(var(--color-background));
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: rgb(var(--color-primary));
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.capacity-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn--full {
  width: 100%;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
}

.btn--primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
}

.btn--outline:hover {
  border-color: rgb(var(--color-text));
}

.btn--outline.active {
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #ffc107;
}

.btn--danger-outline {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn--danger-outline:hover {
  background: #fee2e2;
}

.host-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.host-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgb(var(--color-background));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-text-secondary));
}

.host-details {
  display: flex;
  flex-direction: column;
}

.host-name {
  font-weight: 600;
  color: rgb(var(--color-text));
}

.host-role {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}
</style>
