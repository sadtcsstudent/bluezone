<template>
  <div class="forum-page">
    <div class="forum-container">
      <!-- Header -->
      <div class="forum-header">
        <div class="forum-badge">
          <MessageCircle :size="16" class="badge-icon" />
          <span class="badge-text">{{ $t('forum.badge') }}</span>
        </div>
        <h1>{{ $t('forum.headerTitle') }}</h1>
        <p class="forum-subtitle">
          {{ $t('forum.headerSubtitle') }}
        </p>
      </div>

      <!-- Search & Actions -->
      <div class="forum-actions">
        <div class="search-container">
          <Search :size="20" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="$t('forum.searchPlaceholder')"
            class="search-input"
          />
        </div>
        <button class="btn-new-discussion" @click="startNewDiscussion">
          <Plus :size="20" />
          <span>{{ $t('forum.newDiscussion') }}</span>
        </button>
      </div>

      <div class="forum-grid">
        <!-- Sidebar -->
        <aside class="forum-sidebar">
          <!-- Categories -->
          <div class="sidebar-card">
            <h3>{{ $t('forum.categories') }}</h3>
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
            <h3>{{ $t('forum.trending') }}</h3>
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
              {{ filteredDiscussions.length === 1 ? $t('forum.discussion_one') : $t('forum.discussion_other') }}
            </span>
            <select v-model="sortBy" class="sort-select">
              <option value="recent">{{ $t('forum.sort.recent') }}</option>
              <option value="popular">{{ $t('forum.sort.popular') }}</option>
              <option value="active">{{ $t('forum.sort.active') }}</option>
            </select>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>

          <!-- Discussions List -->
          <div v-else-if="filteredDiscussions.length > 0">
            <div class="discussions-list">
              <ForumCard
                v-for="discussion in filteredDiscussions"
                :key="discussion.id"
                :title="discussion.title"
                :category="discussion.category"
                :author="discussion.author?.name || discussion.author?.email"
                :lastActivity="new Date(discussion.createdAt).toLocaleDateString()"
                :replies="discussion.replies?.length || 0"
                :preview="discussion.content"
                @click="openDiscussion(discussion.id)"
              />
            </div>
            
            <div v-if="hasMore && !searchQuery" class="load-more-container">
              <button class="btn-load-more" @click="loadDiscussions(false)" :disabled="loadingMore">
                {{ loadingMore ? 'Loading...' : 'Load More Discussions' }}
              </button>
            </div>
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

    <!-- New Discussion Modal -->
    <div v-if="showNewDiscussion" class="modal-overlay" @click.self="showNewDiscussion = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Start a New Discussion</h2>
          <button class="close-btn" @click="showNewDiscussion = false">
            <X :size="24" />
          </button>
        </div>
        <form @submit.prevent="createDiscussion" class="discussion-form">
          <div class="form-group">
            <label>Title</label>
            <input v-model="newDiscussion.title" placeholder="What's on your mind?" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="newDiscussion.category" required>
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="newDiscussion.content" rows="6" placeholder="Share your thoughts..." required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showNewDiscussion = false">Cancel</button>
            <button type="submit" class="btn btn--primary" :disabled="creating">
              {{ creating ? 'Posting...' : 'Post Discussion' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { MessageCircle, Search, Plus, TrendingUp, X } from 'lucide-vue-next'
import ForumCard from '../components/ForumCard.vue'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ForumView',
  components: {
    MessageCircle,
    Search,
    Plus,
    TrendingUp,
    ForumCard,
    X
  },
  data() {
    const authStore = useAuthStore()
    return {
      authStore,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'recent',
      categories: [
        { id: 'all', name: 'All Discussions' },
        { id: 'Food & Nutrition', name: 'Food & Nutrition' },
        { id: 'Health & Wellbeing', name: 'Health & Wellbeing' },
        { id: 'Local Initiatives', name: 'Local Initiatives' },
        { id: 'General Discussion', name: 'General Discussion' }
      ],
      trendingTopics: [],
      discussions: [],
      showNewDiscussion: false,
      newDiscussion: { title: '', category: '', content: '' },
      creating: false,
      loading: true,
      page: 1,
      limit: 10,
      hasMore: true,
      loadingMore: false
    }
  },
  async created() {
    await this.loadDiscussions(true)
  },
  computed: {
    filteredDiscussions() {
      let filtered = this.discussions

      // Filter by category
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(d => d.category === this.selectedCategory)
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(query) ||
          (d.content || '').toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  },
  methods: {
    async loadDiscussions(reset = false) {
      if (reset) {
        this.page = 1
        this.discussions = []
        this.hasMore = true
        this.loading = true
      } else {
        this.loadingMore = true
      }

      try {
        const offset = (this.page - 1) * this.limit
        const [data, trending] = await Promise.all([
          api.get(`/forum/discussions?limit=${this.limit}&offset=${offset}`),
          reset ? api.get('/forum/discussions/trending') : Promise.resolve(null)
        ])

        if (reset) {
          this.discussions = data.discussions || []
          if (trending) {
            this.trendingTopics = (trending.discussions || []).map(d => d.title)
          }
        } else {
          this.discussions = [...this.discussions, ...(data.discussions || [])]
        }

        this.hasMore = (data.discussions || []).length === this.limit
        if (this.hasMore) this.page++
      } catch (err) {
        console.error('Failed to load discussions', err)
        const toast = useToastStore()
        toast.error('Failed to load discussions')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    openDiscussion(id) {
      this.$router.push({ name: 'discussion-detail', params: { id } })
    },
    ensureLoggedIn() {
      if (this.authStore?.isLoggedIn && this.authStore?.user) return true
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
      return false
    },
    startNewDiscussion() {
      if (!this.ensureLoggedIn()) return
      this.showNewDiscussion = true
    },
    async createDiscussion() {
      if (!this.ensureLoggedIn()) return

      // Validation
      if (this.newDiscussion.title.trim().length < 5) {
        useToastStore().error('Title must be at least 5 characters long')
        return
      }
      if (this.newDiscussion.content.trim().length < 10) {
        useToastStore().error('Description must be at least 10 characters long')
        return
      }
      if (!this.newDiscussion.category) {
        useToastStore().error('Please select a category')
        return
      }

      this.creating = true
      const toast = useToastStore()
      try {
        await api.post('/forum/discussions', this.newDiscussion)
        this.showNewDiscussion = false
        this.newDiscussion = { title: '', category: '', content: '' }
        await this.loadDiscussions()
        toast.success('Discussion created successfully!')
      } catch (error) {
        console.error('Failed to create discussion', error)
        const message = error.message || 'Failed to create discussion'
        toast.error(message)
      } finally {
        this.creating = false
      }
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

@media (max-width: 1023px) {
  .forum-grid {
    display: flex;
    flex-direction: column;
  }

  .forum-sidebar {
    order: -1; /* Show sidebar first */
  }

  .category-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .category-item {
    white-space: nowrap;
    border: 1px solid rgb(var(--color-border));
  }
  
  .trending-list {
    display: none; /* Hide trending on mobile to save space */
  }
  
  .sidebar-card:has(.trending-list) {
    display: none;
  }
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
  margin-top: 2rem;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.discussion-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: rgb(var(--color-text));
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--ghost:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
