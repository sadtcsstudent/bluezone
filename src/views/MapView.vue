```
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

        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-item">
            <div class="legend-dot legend-dot--garden"></div>
            <span>{{ $t('map.legend.garden') }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--market"></div>
            <span>{{ $t('map.legend.market') }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--event"></div>
            <span>{{ $t('map.legend.event') }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-dot--group"></div>
            <span>{{ $t('map.legend.group') }}</span>
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
          coordinates: { x: i.coordinateX, y: i.coordinateY }
        }))

        this.initiatives = initiatives.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        this.updateMapMarkers();
      } catch (error) {
        console.error('Failed to load initiatives', error)
      }
    },
    initMap() {
      // Enschede Coordinates
      const lat = 52.22153;
      const lng = 6.89366;
      const zoom = 13;

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
        // Map 0-100 x/y to Lat/Lon box around Enschede
        // Min Lat: 52.20, Max Lat: 52.24 (approx 5km height)
        // Min Lng: 6.87, Max Lng: 6.92 (approx 5km width)
        
        // Y: 0% -> 52.24 (Top/North), 100% -> 52.20 (Bottom/South)
        const lat = 52.24 - (initiative.coordinates.y / 100) * 0.04;
        
        // X: 0% -> 6.87 (Left/West), 100% -> 6.92 (Right/East)
        const lng = 6.87 + (initiative.coordinates.x / 100) * 0.05;

        // Custom Icon using CSS classes
        const getMarkerIcon = (type) => {
          const props = 'width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
          switch (type) {
            case 'garden': // Leaf
              return `<svg xmlns="http://www.w3.org/2000/svg" ${props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.5 2 4.5"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
            case 'market': // ShoppingBasket
              return `<svg xmlns="http://www.w3.org/2000/svg" ${props}><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/></svg>`;
            case 'event': // Calendar
              return `<svg xmlns="http://www.w3.org/2000/svg" ${props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`;
            case 'group': // Users
              return `<svg xmlns="http://www.w3.org/2000/svg" ${props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
            default: // MapPin
              return `<svg xmlns="http://www.w3.org/2000/svg" ${props}><path d="M12 12.2A4 4 0 0 0 8 8a4 4 0 0 0 8 0 4 4 0 0 0-4-4v0A4 4 0 0 0 8 8z"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
          }
        };

        const iconHtml = `<div class="pin-icon pin-icon--${initiative.type}">
          <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            ${getMarkerIcon(initiative.type)}
          </div>
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
      if (!this.selectedInitiative || !this.selectedInitiative.coordinates) return
      
      // Calculate Lat/Lng from X/Y (same logic as map markers)
      // Y: 0% -> 52.24 (Top/North), 100% -> 52.20 (Bottom/South)
      const lat = 52.24 - (this.selectedInitiative.coordinates.y / 100) * 0.04;
      
      // X: 0% -> 6.87 (Left/West), 100% -> 6.92 (Right/East)
      const lng = 6.87 + (this.selectedInitiative.coordinates.x / 100) * 0.05;

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

.leaflet-map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Reusing pin styles for Leaflet custom icons */

/* Ensure the wrapper div from Leaflet has no background/border if it picked up defaults */
:deep(.custom-map-marker) {
  background: none !important;
  border: none !important;
}

/* The .pin-icon class is used within the L.divIcon HTML */
.pin-icon {
  width: 48px; /* Use px instead of rem to match JS */
  height: 48px; /* Use px instead of rem to match JS */
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s ease;
}

/* Specific colors for pin types */
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
  z-index: 1000; /* Ensure above Leaflet */
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
```
