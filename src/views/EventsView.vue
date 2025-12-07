<template>
  <div class="events-page">
    <div class="events-container">
      <!-- Header -->
      <div class="events-header">
        <div>
          <div class="events-badge">
            <Calendar :size="16" class="events-badge-icon" />
            <span class="events-badge-text">Events Calendar</span>
          </div>
          <h1 class="events-title">Upcoming Events</h1>
          <p class="events-subtitle">
            Join us for community gatherings, workshops, and activities that bring
            people together and promote wellbeing.
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="events-controls">
          <div class="search-wrapper">
            <Search class="search-icon" :size="20" />
            <input
              type="text"
              placeholder="Search events..."
              v-model="searchQuery"
              class="search-input"
            />
          </div>
          <div class="view-mode-buttons">
            <button
              @click="viewMode = 'grid'"
              :class="['view-mode-btn', { 'view-mode-btn--active': viewMode === 'grid' }]"
            >
              <Grid :size="20" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="['view-mode-btn', { 'view-mode-btn--active': viewMode === 'list' }]"
            >
              <List :size="20" />
            </button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="category-filter">
          <Filter :size="20" class="filter-icon" />
          <button
            v-for="category in categories"
            :key="category"
            @click="selectCategory(category)"
            :class="['category-btn', { 'category-btn--active': isActiveCategory(category) }]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="filteredEvents.length > 0">
        <div :class="viewMode === 'grid' ? 'events-grid' : 'events-list'">
          <EventCard
            v-for="(event, index) in filteredEvents"
            :key="index"
            v-bind="event"
            :on-view-details="() => handleViewDetails(event)"
            :on-register="() => handleRegister(event)"
            :status="event.status"
          />
        </div>
        
        <div v-if="hasMore && !searchQuery" class="load-more-container">
          <button class="btn-load-more" @click="loadEvents(false)" :disabled="loadingMore">
            {{ loadingMore ? 'Loading...' : 'Load More Events' }}
          </button>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="no-results">
        <Calendar :size="64" class="no-results-icon" />
        <h3>No events found</h3>
        <p class="no-results-text">
          Try adjusting your filters or search query
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Calendar, Grid, List, Search, Filter } from 'lucide-vue-next'
import EventCard from '../components/EventCard.vue'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'EventsView',
  components: {
    EventCard,
    Calendar,
    Grid,
    List,
    Search,
    Filter
  },
  data() {
    return {
      authStore: useAuthStore(),
      viewMode: 'grid',
      selectedCategory: 'all',
      searchQuery: '',
      categories: [
        'All Events',
        'Gardening',
        'Food & Nutrition',
        'Wellbeing',
        'Social',
        'Sustainability',
      ],
      events: [],
      loading: false,
      page: 1,
      limit: 9,
      hasMore: true,
      loadingMore: false
    }
  },
  async created() {
    await this.loadEvents()
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => {
        const categoryMatch = this.selectedCategory === 'all' || event.category === this.selectedCategory
        const searchMatch = this.searchQuery === '' ||
          event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        return categoryMatch && searchMatch
      })
    }
  },
  methods: {
    async loadEvents(reset = false) {
      if (reset) {
        this.page = 1
        this.events = []
        this.hasMore = true
        this.loading = true
      } else {
        this.loadingMore = true
      }

      try {
        const offset = (this.page - 1) * this.limit
        const data = await api.get(`/events?limit=${this.limit}&offset=${offset}`)
        const normalizeEvent = (event) => {
          const attendeeCount = event.attendees ?? event.attendeeCount ?? (
            event.registrations ? event.registrations.filter((r) => r.status === 'registered').length : 0
          )
          return {
            ...event,
            attendees: attendeeCount,
            attendeeCount,
            status: event.status || null
          }
        }
        const incoming = (data.events || []).map(normalizeEvent)

        if (reset) {
          this.events = incoming
        } else {
          this.events = [...this.events, ...incoming]
        }

        this.hasMore = (data.events || []).length === this.limit
        if (this.hasMore) this.page++
      } catch (err) {
        console.error('Failed to load events', err)
        const toast = useToastStore()
        toast.error('Failed to load events')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    selectCategory(category) {
      this.selectedCategory = category === 'All Events' ? 'all' : category
    },
    isActiveCategory(category) {
      return (this.selectedCategory === 'all' && category === 'All Events') ||
        this.selectedCategory === category
    },
    requireLogin() {
      if (this.authStore?.isLoggedIn && this.authStore?.user) return true
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
      return false
    },
    handleViewDetails(event) {
      this.$router.push({ name: 'event-detail', params: { id: event.id } })
    },
    async handleRegister(event) {
      if (!this.requireLogin()) return

      // Logic for toggling Interest
      if (event.status === 'interested') {
        if (!confirm(`Remove interest for ${event.title}?`)) return
        await this.performUnregister(event, 'Interest removed')
        return
      }

      // Logic for Unregistering (if already registered)
      if (event.status === 'registered') {
        if (!confirm(`Unregister from ${event.title}?`)) return
        await this.performUnregister(event, 'Successfully unregistered')
        return
      }

      // Logic for Registering (default is 'registered', card handles 'interested' case via viewing details usually, but if we want to support direct interest toggle we'd need two buttons. 
      // Assuming this button is the primary 'Register' action. 
      // However, the card *also* sets status to 'interested' visually? 
      // The EventCard emits `register` which calls this.
      // If we want to support marking interested from main page, we need UI for it.
      // For now, let's assume the button action is primarily 'Register'.
      
      if (!confirm(`Register for ${event.title}?`)) return
      
      const toast = useToastStore()
      try {
        await api.post(`/events/${event.id}/register`, {})
        toast.success('Successfully registered!')
        this.updateEventStatus(event, 'registered')
      } catch (err) {
        console.error('Registration failed', err)
        toast.error('Registration failed')
      }
    },
    async performUnregister(event, successMsg) {
       const toast = useToastStore()
       try {
         await api.delete(`/events/${event.id}/register`)
         toast.success(successMsg)
         this.updateEventStatus(event, null)
       } catch (err) {
         console.error('Unregister failed', err)
         toast.error('Could not update status')
       }
    },
    updateEventStatus(event, newStatus) {
        const index = this.events.findIndex((e) => e.id === event.id)
        if (index !== -1) {
          const current = this.events[index]
          // Adjust attendee count: 
          // If moving TO registered: +1
          // If moving FROM registered: -1
          // If moving between interested/null: 0
          
          let increment = 0
          if (newStatus === 'registered' && current.status !== 'registered') increment = 1
          if (newStatus !== 'registered' && current.status === 'registered') increment = -1
          
          const updated = {
            ...current,
            status: newStatus,
            attendees: (current.attendees || 0) + increment,
            attendeeCount: (current.attendeeCount || current.attendees || 0) + increment
          }
          this.events.splice(index, 1, updated)
        }
    }
  }
}
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.events-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .events-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .events-container {
    padding: 0 2rem;
  }
}

.events-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.events-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  width: fit-content;
}

.events-badge-icon {
  color: rgb(var(--color-primary));
}

.events-badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.events-title {
  margin-top: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.events-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.6;
}

/* Search and Controls */
.events-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .events-controls {
    flex-direction: row;
  }
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: rgb(var(--color-text));
}

.search-input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.search-input::placeholder {
  color: rgb(var(--color-text-secondary));
}

.view-mode-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-mode-btn {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-mode-btn:hover {
  background: rgb(var(--color-background));
}

.view-mode-btn--active {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

/* Category Filter */
.category-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-icon {
  color: rgb(var(--color-text-secondary));
  flex-shrink: 0;
}

.category-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  white-space: nowrap;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.category-btn:hover {
  background: rgb(var(--color-background));
}

.category-btn--active {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

/* Events Grid/List */
.events-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 5rem 0;
}

.no-results-icon {
  color: rgb(var(--color-text-secondary));
  margin: 0 auto 1rem;
}

.no-results h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.no-results-text {
  margin-top: 0.5rem;
  color: rgb(var(--color-text-secondary));
}

/* Loading State */
.loading-state {
  padding: 4rem 0;
  display: flex;
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

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.btn-load-more {
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-more:hover:not(:disabled) {
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

.btn-load-more:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
