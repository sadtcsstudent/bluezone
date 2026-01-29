<template>
  <div class="map-page">
    <div class="map-container">
      <!-- Header -->
      <div class="map-header">
        <div>
          <div class="map-badge">
            <MapPin :size="16" class="badge-icon" />
            <span class="badge-text">{{ $t('map.badge') }}</span>
          </div>
          <h1>{{ $t('map.title') }}</h1>
          <p class="map-subtitle">
            {{ $t('map.subtitle') }}
          </p>
        </div>

        <!-- Search & Filter -->
        <div class="map-controls">
          <div class="search-bar">
            <Search :size="18" class="search-icon" />
            <input v-model="searchQuery" type="text" :placeholder="$t('map.searchPlaceholder')" />
          </div>

          <div class="filter-buttons">
            <button
              @click="filterType = 'all'"
              :class="['filter-btn', { 'filter-btn--active': filterType === 'all' }]"
            >
              {{ $t('map.filters.all') }}
            </button>
            <button
              @click="filterType = 'garden'"
              :class="['filter-btn', { 'filter-btn--garden': filterType === 'garden' }]"
            >
              <Leaf :size="16" />
              <span>{{ $t('map.filters.garden') }}</span>
            </button>
            <button
              @click="filterType = 'market'"
              :class="['filter-btn', { 'filter-btn--market': filterType === 'market' }]"
            >
              <ShoppingBasket :size="16" />
              <span>{{ $t('map.filters.market') }}</span>
            </button>
            <button
              @click="filterType = 'event'"
              :class="['filter-btn', { 'filter-btn--event': filterType === 'event' }]"
            >
              <Calendar :size="16" />
              <span>{{ $t('map.filters.event') }}</span>
            </button>
            <button
              @click="filterType = 'group'"
              :class="['filter-btn', { 'filter-btn--group': filterType === 'group' }]"
            >
              <Users :size="16" />
              <span>{{ $t('map.filters.group') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-canvas">
        <div id="map" class="leaflet-map-container"></div>

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
              <div v-if="selectedInitiative.website" class="website-actions">
                <span class="website-text">{{ selectedInitiative.website }}</span>
                <a
                  :href="normalizeWebsite(selectedInitiative.website)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="website-button"
                >
                  <ExternalLink :size="16" />
                  <span>{{ $t('map.visitWebsite') }}</span>
                </a>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button class="action-btn action-btn--primary" @click="getDirections">
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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { markRaw } from 'vue'

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
      loading: false,
      map: null,
      markers: []
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  async created() {
    await this.loadInitiatives()
  },
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  watch: {
    filteredInitiatives: {
      handler() {
        this.updateMapMarkers();
      },
      deep: true
    }
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
          latitude: i.latitude,
          longitude: i.longitude,
          coordinates: { x: i.coordinateX, y: i.coordinateY } // Keep for backward compatibility
        }))

        this.initiatives = initiatives.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        this.updateMapMarkers();
      } catch (error) {
        console.error('Failed to load initiatives', error)
      }
    },
    initMap() {
      // Overijssel Center Coordinates
      const lat = 52.45;  // Center of Overijssel
      const lng = 6.5;
      const zoom = 10;  // Zoomed out to show entire province

      this.map = markRaw(L.map('map').setView([lat, lng], zoom));

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.updateMapMarkers();
    },
    updateMapMarkers() {
      if (!this.map) return;

      // Clear existing markers
      this.markers.forEach(marker => this.map.removeLayer(marker));
      this.markers = [];

      this.filteredInitiatives.forEach(initiative => {
        // Use real coordinates if available, fallback to old conversion
        let lat, lng

        if (initiative.latitude && initiative.longitude) {
          // New system: use real coordinates
          lat = initiative.latitude
          lng = initiative.longitude
        } else if (initiative.coordinates && initiative.coordinates.x !== undefined && initiative.coordinates.y !== undefined) {
          // Old system: convert using ORIGINAL Enschede formula for backward compatibility
          const ENSCHEDE_LAT_BASE = 52.24
          const ENSCHEDE_LAT_RANGE = 0.04
          const ENSCHEDE_LNG_BASE = 6.87
          const ENSCHEDE_LNG_RANGE = 0.05

          lat = ENSCHEDE_LAT_BASE - (initiative.coordinates.y / 100) * ENSCHEDE_LAT_RANGE
          lng = ENSCHEDE_LNG_BASE + (initiative.coordinates.x / 100) * ENSCHEDE_LNG_RANGE
        } else {
          // Skip if no coordinates
          return
        }

        // Custom Icon using CSS classes
        const iconHtml = `<div class="pin-icon">
          <img src="/images/blue-zone-horse.png" alt="Blue Zone" />
        </div>`;

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: iconHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
          tooltipAnchor: [0, -24]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(this.map)
          .bindTooltip(initiative.name)
          .on('click', () => {
             this.selectedInitiative = initiative;
          });

        this.markers.push(markRaw(marker));
      });
    },
    getDirections() {
      if (!this.selectedInitiative) return

      let lat, lng

      // Use real coordinates if available
      if (this.selectedInitiative.latitude && this.selectedInitiative.longitude) {
        lat = this.selectedInitiative.latitude
        lng = this.selectedInitiative.longitude
      } else if (this.selectedInitiative.coordinates) {
        // Fallback to old system
        const ENSCHEDE_LAT_BASE = 52.24
        const ENSCHEDE_LAT_RANGE = 0.04
        const ENSCHEDE_LNG_BASE = 6.87
        const ENSCHEDE_LNG_RANGE = 0.05

        lat = ENSCHEDE_LAT_BASE - (this.selectedInitiative.coordinates.y / 100) * ENSCHEDE_LAT_RANGE
        lng = ENSCHEDE_LNG_BASE + (this.selectedInitiative.coordinates.x / 100) * ENSCHEDE_LNG_RANGE
      } else {
        return
      }

      const destination = `${lat},${lng}`
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank')
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
    },
    normalizeWebsite(value) {
      if (!value) return ''
      const trimmed = value.trim()
      if (!trimmed) return ''
      return trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    }
  }
}
</script>

<style>
/* Global styles for Leaflet markers - must NOT be scoped */
.custom-map-marker {
  background: none !important;
  border: none !important;
}

.pin-icon {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: white !important;
  transition: transform 0.2s ease !important;
  padding: 10px !important;
  box-sizing: border-box !important;
}

.pin-icon img {
  width: 100% !important;
  height: 100% !important;
  flex-shrink: 0 !important;
  display: block !important;
}
</style>

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

.filter-btn:active {
  transform: scale(0.98);
}

.filter-btn--active {
  background: rgb(var(--color-primary)) !important;
  color: white !important;
  border-color: rgb(var(--color-primary)) !important;
}

.filter-btn--garden {
  background: rgb(var(--color-primary)) !important;
  color: white !important;
  border-color: rgb(var(--color-primary)) !important;
}

.filter-btn--market {
  background: rgb(var(--color-secondary)) !important;
  color: white !important;
  border-color: rgb(var(--color-secondary)) !important;
}

.filter-btn--event {
  background: rgb(var(--color-accent)) !important;
  color: rgb(var(--color-primary-dark)) !important;
  border-color: rgb(var(--color-accent)) !important;
}

.filter-btn--group {
  background: rgb(var(--color-primary-dark)) !important;
  color: white !important;
  border-color: rgb(var(--color-primary-dark)) !important;
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

.leaflet-map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Pin styles moved to non-scoped style block above */

/* Leaflet tooltip styling */
.leaflet-tooltip {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: rgb(var(--color-text));
  border: none;
  padding: 0.5rem 0.75rem;
}

.leaflet-tooltip-bottom:before {
  border-bottom-color: white;
}

/* Legend removed */

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
  z-index: 9999; /* High z-index for modal */
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

.website-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.website-text {
  color: rgb(var(--color-text-secondary));
}

.website-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgb(var(--color-primary));
  color: white;
  text-decoration: none;
  width: fit-content;
  transition: all 0.2s ease;
  font-weight: 500;
}

.website-button:hover {
  background: rgb(var(--color-primary-dark));
}

.contact-item {
  color: rgb(var(--color-text-secondary));
  margin: 0;
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
