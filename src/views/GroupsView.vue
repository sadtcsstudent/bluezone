<template>
  <div class="groups-page">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1>Discover Groups</h1>
          <p>Join communities that share your interests and passions</p>
        </div>
        <button class="btn btn--primary" @click="showCreateModal = true">
          <Plus :size="20" />
          <span>Create Group</span>
        </button>
      </header>

      <!-- Search & Filters -->
      <div class="filters-bar">
        <div class="search-input">
          <Search :size="20" />
          <input v-model="searchQuery" type="text" placeholder="Search groups..." />
        </div>
        <div class="categories-list">
          <button 
            v-for="cat in categories" 
            :key="cat"
            class="category-pill"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Groups Grid -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="filteredGroups.length > 0" class="groups-grid">
        <div 
          v-for="group in filteredGroups" 
          :key="group.id" 
          class="group-card"
          @click="openGroup(group.id)"
        >
          <div class="card-image">
            <ImageWithFallback 
              :src="group.image || `https://source.unsplash.com/random/800x600?${group.category}`" 
              class-name="group-img"
              alt="Group cover"
            />
            <div class="category-badge">{{ group.category }}</div>
          </div>
          
          <div class="card-content">
            <h3>{{ group.name }}</h3>
            <p class="description">{{ group.description }}</p>
            
            <div class="card-footer">
              <div class="members-count">
                <Users :size="16" />
                <span>{{ group._count?.members || 0 }} members</span>
              </div>
              <span class="join-text">View Group <ArrowRight :size="16" /></span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Users :size="48" />
        <h3>No groups found</h3>
        <p>Try adjusting your search or create a new group</p>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New Group</h2>
          <button class="close-btn" @click="showCreateModal = false">
            <X :size="24" />
          </button>
        </div>
        
        <form @submit.prevent="createGroup" class="create-form">
          <div class="form-group">
            <label>Group Name</label>
            <input v-model="newGroup.name" type="text" required placeholder="e.g. Hiking Enthusiasts" />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="newGroup.category" required>
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories.filter(c => c !== 'All')" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="newGroup.description" 
              required 
              rows="4" 
              placeholder="What is this group about?"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showCreateModal = false">Cancel</button>
            <button type="submit" class="btn btn--primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Users, ArrowRight, X } from 'lucide-vue-next'
import api from '@/services/api'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const groups = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('All')
const showCreateModal = ref(false)
const creating = ref(false)

const categories = ['All', 'Community', 'Technology', 'Sports', 'Arts', 'Education', 'Health']

const newGroup = ref({
  name: '',
  category: '',
  description: ''
})

const load = async () => {
  loading.value = true
  try {
    const res = await api.get('/groups')
    groups.value = res.groups || []
  } catch (err) {
    console.error('Failed to load groups', err)
  } finally {
    loading.value = false
  }
}

const filteredGroups = computed(() => {
  return groups.value.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         g.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || g.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const openGroup = (id) => {
  router.push({ name: 'group-detail', params: { id } })
}

const createGroup = async () => {
  const toast = useToastStore()
  creating.value = true
  try {
    await api.post('/groups', newGroup.value)
    showCreateModal.value = false
    newGroup.value = { name: '', category: '', description: '' }
    await load()
    toast.success('Group created successfully!')
  } catch (err) {
    console.error('Failed to create group', err)
    toast.error('Failed to create group')
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.groups-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.header-content p {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
}

/* Filters */
.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-input {
  position: relative;
  max-width: 500px;
}

.search-input svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-secondary));
}

.search-input input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

.categories-list {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.category-pill {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-pill:hover {
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

.category-pill.active {
  background: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
  color: white;
}

/* Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.group-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

.card-image {
  height: 200px;
  position: relative;
  background: rgb(var(--color-background));
}

.group-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: rgb(var(--color-text));
}

.description {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-border));
}

.members-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.join-text {
  color: rgb(var(--color-primary));
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgb(var(--color-text));
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn--primary:hover {
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

/* Loading & Empty States */
.loading-state, .empty-state {
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgb(var(--color-text-secondary));
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
