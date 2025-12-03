<template>
  <div class="map-page">
    <div class="map-container">
      <!-- Header -->
      <div class="map-header">
        <div>
          <div class="map-badge">
            <MapPin :size="16" class="badge-icon" />
            <span class="badge-text">Local Map</span>
          </div>
          <h1>Community Initiatives Map</h1>
          <p class="map-subtitle">
            Discover community gardens, farmers markets, walking groups, and other
            local initiatives near you.
          </p>
        </div>

        <!-- Search & Filter -->
        <div class="map-controls">
          <div class="search-bar">
            <Search :size="18" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Search initiatives..." />
          </div>

          <div class="filter-buttons">
            <button
              @click="filterType = 'all'"
              :class="['filter-btn', { 'filter-btn--active': filterType === 'all' }]"
            >
              All Initiatives
            </button>
            <button
              @click="filterType = 'garden'"
              :class="['filter-btn', { 'filter-btn--garden': filterType === 'garden' }]"
            >
              <Leaf :size="16" />
              <span>Gardens</span>
            </button>
            <button
              @click="filterType = 'market'"
              :class="['filter-btn', { 'filter-btn--market': filterType === 'market' }]"
            >
              <ShoppingBasket :size="16" />
              <span>Markets</span>
            </button>
            <button
              @click="filterType = 'event'"
              :class="['filter-btn', { 'filter-btn--event': filterType === 'event' }]"
            >
              <Calendar :size="16" />
              <span>Events</span>
            </button>
            <button
              @click="filterType = 'group'"
              :class="['filter-btn', { 'filter-btn--group': filterType === 'group' }]"
            >
              <Users :size="16" />
              <span>Groups</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-canvas">
        <div class="map-background">
          <svg class="map-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(var(--color-primary), 0.1)" stroke-width="0.1" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <!-- Map Pins -->
        <button
          v-for="initiative in filteredInitiatives"
          :key="initiative.id"
          @click="selectedInitiative = initiative"
          class="map-pin"
          :style="{
            left: initiative.coordinates.x + '%',
            top: initiative.coordinates.y + '%'
          }"
        >
          <div :class="['pin-icon', `pin-icon--${initiative.type}`]">
            <component :is="typeIcons[initiative.type]" :size="24" />
          </div>
          <div class="pin-tooltip">
            <span>{{ initiative.name }}</span>
          </div>
        </button>

        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-item">
            <div class="legend-dot legend-dot--garden"></div>
            <span>Gardens</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--market"></div>
            <span>Markets</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--event"></div>
            <span>Events</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--group"></div>
            <span>Groups</span>
          </div>
        </div>
      </div>

      <!-- Initiative Detail Modal -->
      <div v-if="selectedInitiative" class="modal-overlay" @click="selectedInitiative = null">
        <div class="modal-content" @click.stop>
          <div class="modal-body">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-info">
                <div :class="['modal-icon', `modal-icon--${selectedInitiative.type}`]">
                  <component :is="typeIcons[selectedInitiative.type]" :size="24" />
                </div>
                <div>
                  <h3>{{ selectedInitiative.name }}</h3>
                  <p class="modal-location">
                    <MapPin :size="16" />
                    <span>{{ selectedInitiative.location }}</span>
                  </p>
                </div>
              </div>
              <button @click="selectedInitiative = null" class="close-btn">
                <X :size="20" />
              </button>
            </div>

            <!-- Description -->
            <p class="modal-description">
              {{ selectedInitiative.description }}
            </p>

            <!-- Contact Info -->
            <div v-if="selectedInitiative.contact || selectedInitiative.website" class="modal-contact">
              <p v-if="selectedInitiative.contact" class="contact-item">
                <strong>Contact:</strong> {{ selectedInitiative.contact }}
              </p>
              <a
                v-if="selectedInitiative.website"
                :href="`https://${selectedInitiative.website}`"
                target="_blank"
                rel="noopener noreferrer"
                class="website-link"
              >
                <span>{{ selectedInitiative.website }}</span>
                <ExternalLink :size="16" />
              </a>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button class="action-btn action-btn--primary">
                Get Directions
              </button>
              <button 
                class="action-btn action-btn--icon" 
                :class="{ 'action-btn--active': selectedInitiative.isSaved }"
                @click="toggleSave"
              >
                <Heart :size="20" :fill="selectedInitiative.isSaved ? 'currentColor' : 'none'" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MapPin, X, ExternalLink, Calendar, Users, Leaf, ShoppingBasket, Heart, Search } from 'lucide-vue-next'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MapView',
  components: {
    MapPin,
    X,
    ExternalLink,
    Calendar,
    Users,
    Leaf,
    ShoppingBasket,
    Heart,
    Search
  },
  data() {
    return {
      selectedInitiative: null,
      filterType: 'all',
      searchQuery: '',
      typeIcons: {
        garden: Leaf,
        market: ShoppingBasket,
        event: Calendar,
        group: Users,
      },
      initiatives: [],
      loading: false
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  async created() {
    await this.loadInitiatives()
  },
  computed: {
    filteredInitiatives() {
      let filtered = this.initiatives
      
      if (this.filterType !== 'all') {
        filtered = filtered.filter(i => i.type === this.filterType)
      }
      
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase()
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
        )
      }
      
      return filtered
    },
    isSaved() {
      if (!this.selectedInitiative || !this.authStore.user) return false
      return this.selectedInitiative.isSaved
    }
  },
  methods: {
    async loadInitiatives() {
      try {
        const data = await api.get('/initiatives')
        const initiatives = (data.initiatives || []).map((i) => ({
          ...i,
          isSaved: !!i.isSaved,
          coordinates: { x: i.coordinateX, y: i.coordinateY }
        }))

        this.initiatives = initiatives.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      } catch (error) {
        console.error('Failed to load initiatives', error)
      }
    },
    async toggleSave() {
      if (!this.selectedInitiative) return
      
      const initiative = this.selectedInitiative
      const action = initiative.isSaved ? 'unsave' : 'save'
      
      try {
        if (action === 'save') {
          await api.post(`/initiatives/${initiative.id}/save`)
          initiative.isSaved = true
        } else {
          await api.delete(`/initiatives/${initiative.id}/save`)
          initiative.isSaved = false
        }
      } catch (error) {
        console.error(`Failed to ${action} initiative`, error)
        alert(`Failed to ${action} initiative`)
      }
    }
  }
}
</script>

<style scoped>
.map-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.map-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .map-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .map-container {
    padding: 0 2rem;
  }
}

/* Header */
.map-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.map-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  width: fit-content;
}

.badge-icon {
  color: rgb(var(--color-primary));
}

.badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.map-header h1 {
  margin-top: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.map-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
}

.map-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 9999px;
  border: 1px solid rgb(var(--color-border));
  background: white;
  transition: all 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

/* Filter Buttons */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-btn:hover {
  background: rgb(var(--color-background));
}

.filter-btn--active {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

.filter-btn--garden {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

.filter-btn--market {
  background: rgb(var(--color-secondary));
  color: white;
  border-color: rgb(var(--color-secondary));
}

.filter-btn--event {
  background: rgb(var(--color-accent));
  color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-accent));
}

.filter-btn--group {
  background: rgb(var(--color-primary-dark));
  color: white;
  border-color: rgb(var(--color-primary-dark));
}

/* Map Canvas */
.map-canvas {
  position: relative;
  background: rgb(var(--color-background));
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  overflow: hidden;
  height: 600px;
}

.map-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(var(--color-primary), 0.05) 0%,
    transparent 50%,
    rgba(var(--color-accent), 0.05) 100%
  );
}

.map-grid {
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

/* Map Pins */
.map-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.pin-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s ease;
}

.map-pin:hover .pin-icon {
  transform: scale(1.1);
}

.pin-icon--garden {
  background: rgb(var(--color-primary));
}

.pin-icon--market {
  background: rgb(var(--color-secondary));
}

.pin-icon--event {
  background: rgb(var(--color-accent));
}

.pin-icon--group {
  background: rgb(var(--color-primary-dark));
}

.pin-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  font-size: 0.875rem;
}

.map-pin:hover .pin-tooltip {
  opacity: 1;
}

/* Legend */
.map-legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
}

.legend-dot--garden {
  background: rgb(var(--color-primary));
}

.legend-dot--market {
  background: rgb(var(--color-secondary));
}

.legend-dot--event {
  background: rgb(var(--color-accent));
}

.legend-dot--group {
  background: rgb(var(--color-primary-dark));
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 42rem;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.modal-info {
  display: flex;
  align-items: start;
  gap: 1rem;
}

.modal-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.modal-icon--garden {
  background: rgb(var(--color-primary));
}

.modal-icon--market {
  background: rgb(var(--color-secondary));
}

.modal-icon--event {
  background: rgb(var(--color-accent));
}

.modal-icon--group {
  background: rgb(var(--color-primary-dark));
}

.modal-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.modal-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text));
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgb(var(--color-background));
}

.modal-description {
  color: rgb(var(--color-text-secondary));
  line-height: 1.7;
}

.modal-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  color: rgb(var(--color-text-secondary));
  margin: 0;
}

.website-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-primary));
  text-decoration: none;
  transition: color 0.2s ease;
}

.website-link:hover {
  color: rgb(var(--color-primary-dark));
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-border));
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn--primary {
  flex: 1;
  background: rgb(var(--color-primary));
  color: white;
}

.action-btn--primary:hover {
  background: rgb(var(--color-primary-dark));
}

.action-btn--icon {
  padding: 0.75rem;
  border: 1px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
}

.action-btn--icon:hover {
  background: rgb(var(--color-primary));
  color: white;
}

.action-btn--active {
  background: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}
</style>
