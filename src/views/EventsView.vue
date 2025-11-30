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

      <!-- Events Grid/List -->
      <div v-if="filteredEvents.length > 0" :class="viewMode === 'grid' ? 'events-grid' : 'events-list'">
        <EventCard
          v-for="(event, index) in filteredEvents"
          :key="index"
          v-bind="event"
          :on-view-details="() => handleViewDetails(event)"
        />
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
      events: [
        {
          title: 'Community Garden Workshop',
          date: 'December 7, 2025',
          time: '10:00 - 13:00',
          location: 'Enschede Community Garden',
          attendees: 24,
          imageUrl: 'https://images.unsplash.com/photo-1513906029980-32d13afe6d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwZW9wbGV8ZW58MXx8fHwxNzY0NDMzODQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Learn sustainable gardening techniques and connect with fellow gardeners in our community.',
          category: 'Gardening',
        },
        {
          title: 'Healthy Cooking Class',
          date: 'December 10, 2025',
          time: '18:00 - 20:30',
          location: 'De Kookplaats, Hengelo',
          attendees: 18,
          imageUrl: 'https://images.unsplash.com/photo-1686657429079-95d763456dbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbG9jYWwlMjBmb29kfGVufDF8fHx8MTc2NDQ5ODgwMnww&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Discover delicious and nutritious recipes using local, seasonal ingredients.',
          category: 'Food & Nutrition',
        },
        {
          title: 'Nature Walk & Meditation',
          date: 'December 14, 2025',
          time: '09:00 - 11:00',
          location: 'Lonnekerberg Nature Reserve',
          attendees: 32,
          imageUrl: 'https://images.unsplash.com/photo-1734596438089-ef300bc02fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjB3ZWxsYmVpbmd8ZW58MXx8fHwxNzY0NDk4ODAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Join us for a peaceful morning walk in nature followed by a guided meditation session.',
          category: 'Wellbeing',
        },
        {
          title: 'Winter Farmers Market',
          date: 'December 17, 2025',
          time: '10:00 - 14:00',
          location: 'Enschede Central Square',
          attendees: 120,
          imageUrl: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGZhcm1lcnMlMjBtYXJrZXR8ZW58MXx8fHwxNzY0NDM3NjY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Shop local produce, handmade goods, and meet the farmers and artisans of Twente.',
          category: 'Food & Nutrition',
        },
        {
          title: 'Community Potluck Dinner',
          date: 'December 20, 2025',
          time: '18:00 - 21:00',
          location: 'Community Center Hengelo',
          attendees: 45,
          imageUrl: 'https://images.unsplash.com/photo-1625246433906-6cfa33544b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzY0NDU5MDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Bring your favorite dish and share a meal with neighbors. A great way to connect and celebrate the season.',
          category: 'Social',
        },
        {
          title: 'Sustainable Living Workshop',
          date: 'December 22, 2025',
          time: '14:00 - 17:00',
          location: 'EcoHub Enschede',
          attendees: 28,
          imageUrl: 'https://images.unsplash.com/photo-1661328992560-55256f06bdad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGxpdmluZ3xlbnwxfHx8fDE3NjQ0OTg4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          description: 'Learn practical tips for reducing waste, conserving energy, and living more sustainably.',
          category: 'Sustainability',
        },
      ]
    }
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
    selectCategory(category) {
      this.selectedCategory = category === 'All Events' ? 'all' : category
    },
    isActiveCategory(category) {
      return (this.selectedCategory === 'all' && category === 'All Events') ||
        this.selectedCategory === category
    },
    handleViewDetails(event) {
      console.log('View event details:', event)
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
</style>
