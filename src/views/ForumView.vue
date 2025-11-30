<template>
  <div class="forum-page">
    <div class="forum-container">
      <!-- Header -->
      <div class="forum-header">
        <div class="forum-badge">
          <MessageCircle :size="16" class="badge-icon" />
          <span class="badge-text">Community Forum</span>
        </div>
        <h1>Join the Conversation</h1>
        <p class="forum-subtitle">
          Connect with fellow community members, share experiences, and learn from each other.
        </p>
      </div>

      <!-- Search & Actions -->
      <div class="forum-actions">
        <div class="search-container">
          <Search :size="20" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search discussions..."
            class="search-input"
          />
        </div>
        <button class="btn-new-discussion">
          <Plus :size="20" />
          <span>New Discussion</span>
        </button>
      </div>

      <div class="forum-grid">
        <!-- Sidebar -->
        <aside class="forum-sidebar">
          <!-- Categories -->
          <div class="sidebar-card">
            <h3>Categories</h3>
            <div class="category-list">
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="['category-item', { 'category-item--active': selectedCategory === cat.id }]"
                @click="selectedCategory = cat.id"
              >
                <span class="category-name">{{ cat.name }}</span>
                <span class="category-count">{{ cat.count }}</span>
              </button>
            </div>
          </div>

          <!-- Trending Topics -->
          <div class="sidebar-card">
            <h3>Trending Topics</h3>
            <div class="trending-list">
              <div
                v-for="(topic, index) in trendingTopics"
                :key="index"
                class="trending-item"
              >
                <TrendingUp :size="16" class="trending-icon" />
                <span>{{ topic }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="forum-main">
          <!-- Results Info -->
          <div class="results-info">
            <span class="results-count">
              {{ filteredDiscussions.length }}
              {{ filteredDiscussions.length === 1 ? 'discussion' : 'discussions' }}
            </span>
            <select v-model="sortBy" class="sort-select">
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="active">Most Active</option>
            </select>
          </div>

          <!-- Discussions List -->
          <div v-if="filteredDiscussions.length > 0" class="discussions-list">
            <ForumCard
              v-for="discussion in filteredDiscussions"
              :key="discussion.id"
              :title="discussion.title"
              :category="discussion.category"
              :author="discussion.author"
              :lastActivity="discussion.lastActivity"
              :replies="discussion.replies"
              :preview="discussion.preview"
            />
          </div>

          <!-- No Results -->
          <div v-else class="no-results">
            <MessageCircle :size="48" class="no-results-icon" />
            <h3>No discussions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { MessageCircle, Search, Plus, TrendingUp } from 'lucide-vue-next'
import ForumCard from '../components/ForumCard.vue'

export default {
  name: 'ForumView',
  components: {
    MessageCircle,
    Search,
    Plus,
    TrendingUp,
    ForumCard
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'recent',
      categories: [
        { id: 'all', name: 'All Discussions', count: 47 },
        { id: 'food', name: 'Food & Nutrition', count: 12 },
        { id: 'health', name: 'Health & Wellbeing', count: 15 },
        { id: 'local', name: 'Local Initiatives', count: 8 },
        { id: 'general', name: 'General Discussion', count: 12 }
      ],
      trendingTopics: [
        'Community Gardens',
        'Seasonal Recipes',
        'Walking Groups',
        'Sustainability Tips',
        'Local Markets'
      ],
      discussions: [
        {
          id: 1,
          title: 'Best Local Markets in Enschede?',
          category: 'Food & Nutrition',
          categoryId: 'food',
          author: 'Maria de Vries',
          lastActivity: '2 hours ago',
          replies: 24,
          preview: 'Hi everyone! I\'m new to the area and looking for recommendations on the best local markets for fresh produce. Any suggestions?'
        },
        {
          id: 2,
          title: 'Starting a Community Garden - Tips Needed',
          category: 'Local Initiatives',
          categoryId: 'local',
          author: 'Jan Bakker',
          lastActivity: '5 hours ago',
          replies: 18,
          preview: 'We\'re planning to start a community garden in our neighborhood. Would love to hear from anyone who has experience with this!'
        },
        {
          id: 3,
          title: 'Weekly Walking Group - Join Us!',
          category: 'Health & Wellbeing',
          categoryId: 'health',
          author: 'Sophie van Dam',
          lastActivity: '1 day ago',
          replies: 32,
          preview: 'Our walking group meets every Saturday morning at 9 AM. All fitness levels welcome! We explore different routes around Twente.'
        },
        {
          id: 4,
          title: 'Healthy Meal Prep Ideas for Busy Weeks',
          category: 'Food & Nutrition',
          categoryId: 'food',
          author: 'Emma Jansen',
          lastActivity: '1 day ago',
          replies: 45,
          preview: 'Share your favorite meal prep recipes that are healthy, delicious, and can be prepared in advance!'
        },
        {
          id: 5,
          title: 'Meditation Sessions at the Park',
          category: 'Health & Wellbeing',
          categoryId: 'health',
          author: 'Lucas Smit',
          lastActivity: '2 days ago',
          replies: 15,
          preview: 'Organizing free outdoor meditation sessions every Wednesday evening. Beginners welcome!'
        },
        {
          id: 6,
          title: 'Reducing Plastic Waste - What Works?',
          category: 'General Discussion',
          categoryId: 'general',
          author: 'Nina Peters',
          lastActivity: '3 days ago',
          replies: 28,
          preview: 'Let\'s discuss practical ways to reduce plastic waste in our daily lives. What changes have you made?'
        },
        {
          id: 7,
          title: 'Bike Repair Workshop This Saturday',
          category: 'Local Initiatives',
          categoryId: 'local',
          author: 'Tom Verhoeven',
          lastActivity: '3 days ago',
          replies: 12,
          preview: 'Free bike repair workshop at the community center. Bring your bikes and learn basic maintenance!'
        },
        {
          id: 8,
          title: 'Favorite Healthy Restaurants in Hengelo',
          category: 'Food & Nutrition',
          categoryId: 'food',
          author: 'Lisa Mulder',
          lastActivity: '4 days ago',
          replies: 21,
          preview: 'Looking for restaurant recommendations that focus on healthy, locally-sourced food. Where do you like to eat?'
        }
      ]
    }
  },
  computed: {
    filteredDiscussions() {
      let filtered = this.discussions

      // Filter by category
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(d => d.categoryId === this.selectedCategory)
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(query) ||
          d.preview.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  }
}
</script>

<style scoped>
.forum-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.forum-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .forum-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .forum-container {
    padding: 0 2rem;
  }
}

/* Header */
.forum-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.forum-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  width: fit-content;
  margin: 0 auto;
}

.badge-icon {
  color: rgb(var(--color-primary));
}

.badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.forum-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.forum-subtitle {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
  max-width: 42rem;
  margin: 0 auto;
}

/* Search & Actions */
.forum-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .forum-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-container {
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
  border-radius: 9999px;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  color: rgb(var(--color-text));
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.btn-new-discussion {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background: rgb(var(--color-primary));
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-new-discussion:hover {
  background: rgb(var(--color-primary-dark));
}

/* Grid Layout */
.forum-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .forum-grid {
    grid-template-columns: 280px 1fr;
  }
}

/* Sidebar */
.forum-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
}

.sidebar-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 1rem;
}

/* Categories */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.category-item:hover {
  background: rgb(var(--color-background));
}

.category-item--active {
  background: rgba(var(--color-primary), 0.1);
}

.category-item--active .category-name {
  color: rgb(var(--color-primary));
  font-weight: 500;
}

.category-name {
  color: rgb(var(--color-text));
  font-size: 0.875rem;
}

.category-count {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  background: rgb(var(--color-background));
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.category-item--active .category-count {
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
}

/* Trending */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.trending-icon {
  color: rgb(var(--color-primary));
}

/* Main Content */
.forum-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
}

.results-count {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  color: rgb(var(--color-text));
  font-size: 0.875rem;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
}

/* Discussions List */
.discussions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
}

.no-results-icon {
  color: rgb(var(--color-text-secondary));
  margin: 0 auto 1rem;
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.no-results p {
  color: rgb(var(--color-text-secondary));
}
</style>
