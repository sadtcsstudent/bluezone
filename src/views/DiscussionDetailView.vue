<template>
  <div class="discussion-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="discussion" class="discussion-container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <router-link :to="{ name: 'forum' }" class="breadcrumb-item">Forum</router-link>
        <ChevronRight :size="16" />
        <span class="breadcrumb-item">{{ discussion.category }}</span>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Original Post -->
        <article class="post-card original-post">
          <div class="post-sidebar">
            <div class="author-avatar">
              <img v-if="discussion.author?.avatar" :src="discussion.author.avatar" :alt="discussion.author.name" />
              <div v-else class="avatar-placeholder">
                {{ (discussion.author?.name || discussion.author?.email || '?')[0].toUpperCase() }}
              </div>
            </div>
            <div class="author-info">
              <span class="author-name">{{ discussion.author?.name || discussion.author?.email }}</span>
              <span class="author-role">Author</span>
            </div>
          </div>

          <div class="post-content-wrapper">
            <header class="post-header">
              <div class="header-top">
                <h1 class="post-title">{{ discussion.title }}</h1>
                <div v-if="isAuthor(discussion.authorId)" class="post-menu">
                  <button class="icon-btn" @click="startEditDiscussion">
                    <Edit2 :size="16" />
                  </button>
                  <button class="icon-btn danger" @click="deleteDiscussion">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              <span class="post-date">{{ formatDate(discussion.createdAt) }}</span>
            </header>
            
            <div v-if="editingDiscussion" class="edit-mode">
              <textarea v-model="editDiscussionContent" rows="6"></textarea>
              <div class="edit-actions">
                <button class="btn btn--sm btn--ghost" @click="cancelEditDiscussion">Cancel</button>
                <button class="btn btn--sm btn--primary" @click="saveDiscussion">Save</button>
              </div>
            </div>
            <div v-else class="post-body">
              {{ discussion.content }}
            </div>

            <footer class="post-actions">
              <button class="action-btn">
                <ThumbsUp :size="18" />
                <span>Like</span>
              </button>
              <button class="action-btn">
                <Share2 :size="18" />
                <span>Share</span>
              </button>
              <button class="action-btn" @click="scrollToReply">
                <MessageSquare :size="18" />
                <span>Reply</span>
              </button>
            </footer>
          </div>
        </article>

        <!-- Replies Section -->
        <div class="replies-section">
          <div class="replies-header">
            <h3>{{ replies.length }} Replies</h3>
          </div>

          <div class="replies-list">
            <article v-for="reply in replies" :key="reply.id" class="post-card reply-card">
              <div class="post-sidebar">
                <div class="author-avatar sm">
                  <img v-if="reply.author?.avatar" :src="reply.author.avatar" :alt="reply.author.name" />
                  <div v-else class="avatar-placeholder sm">
                    {{ (reply.author?.name || reply.author?.email || '?')[0].toUpperCase() }}
                  </div>
                </div>
              </div>

              <div class="post-content-wrapper">
                <header class="post-header">
                  <div class="reply-meta">
                    <span class="author-name">{{ reply.author?.name || reply.author?.email }}</span>
                    <span class="post-date">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <div v-if="isAuthor(reply.authorId)" class="post-menu">
                    <button class="icon-btn" @click="startEditReply(reply)">
                      <Edit2 :size="14" />
                    </button>
                    <button class="icon-btn danger" @click="deleteReply(reply.id)">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </header>
                
                <div v-if="editingReplyId === reply.id" class="edit-mode">
                  <textarea v-model="editReplyContent" rows="3"></textarea>
                  <div class="edit-actions">
                    <button class="btn btn--sm btn--ghost" @click="cancelEditReply">Cancel</button>
                    <button class="btn btn--sm btn--primary" @click="saveReply(reply.id)">Save</button>
                  </div>
                </div>
                <div v-else class="post-body">
                  {{ reply.content }}
                </div>

                <footer class="post-actions">
                  <button class="action-btn sm">
                    <ThumbsUp :size="16" />
                    <span>Helpful</span>
                  </button>
                  <button class="action-btn sm">
                    <MessageSquare :size="16" />
                    <span>Reply</span>
                  </button>
                </footer>
              </div>
            </article>
          </div>
        </div>

        <!-- Reply Composer -->
        <div class="composer-section" ref="composer">
          <h3>Post a Reply</h3>
          <form @submit.prevent="postReply" class="reply-form">
            <div class="editor-wrapper">
              <textarea 
                v-model="replyContent" 
                placeholder="What are your thoughts?" 
                required
                rows="4"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn--primary" :disabled="!replyContent.trim()">
                Post Reply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRight, ThumbsUp, Share2, MessageSquare, Edit2, Trash2 } from 'lucide-vue-next'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const discussion = ref(null)
const replies = ref([])
const loading = ref(true)
const replyContent = ref('')
const composer = ref(null)

// Editing states
const editingDiscussion = ref(false)
const editDiscussionContent = ref('')
const editingReplyId = ref(null)
const editReplyContent = ref('')

const isAuthor = (authorId) => {
  return authStore.user?.id === authorId
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = (now - date) / 1000 // seconds

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const load = async () => {
  loading.value = true
  try {
    const data = await api.get(`/forum/discussions/${route.params.id}`)
    discussion.value = data.discussion
    replies.value = data.replies || []
  } catch (error) {
    console.error('Failed to load discussion:', error)
    toast.error('Failed to load discussion')
  } finally {
    loading.value = false
  }
}

const postReply = async () => {
  if (!replyContent.value.trim()) return
  
  try {
    await api.post(`/forum/discussions/${route.params.id}/replies`, { content: replyContent.value })
    replyContent.value = ''
    await load()
    toast.success('Reply posted')
  } catch (error) {
    console.error('Failed to post reply:', error)
    toast.error('Failed to post reply')
  }
}

const startEditDiscussion = () => {
  editDiscussionContent.value = discussion.value.content
  editingDiscussion.value = true
}

const cancelEditDiscussion = () => {
  editingDiscussion.value = false
  editDiscussionContent.value = ''
}

const saveDiscussion = async () => {
  try {
    await api.put(`/forum/discussions/${discussion.value.id}`, {
      title: discussion.value.title, // Keep title same for now, or add title edit field
      content: editDiscussionContent.value
    })
    discussion.value.content = editDiscussionContent.value
    editingDiscussion.value = false
    toast.success('Discussion updated')
  } catch (error) {
    console.error('Failed to update discussion:', error)
    toast.error('Failed to update discussion')
  }
}

const deleteDiscussion = async () => {
  if (!confirm('Are you sure you want to delete this discussion?')) return
  try {
    await api.delete(`/forum/discussions/${discussion.value.id}`)
    toast.success('Discussion deleted')
    router.push({ name: 'forum' })
  } catch (error) {
    console.error('Failed to delete discussion:', error)
    toast.error('Failed to delete discussion')
  }
}

const startEditReply = (reply) => {
  editReplyContent.value = reply.content
  editingReplyId.value = reply.id
}

const cancelEditReply = () => {
  editingReplyId.value = null
  editReplyContent.value = ''
}

const saveReply = async (replyId) => {
  try {
    await api.put(`/forum/replies/${replyId}`, { content: editReplyContent.value })
    const reply = replies.value.find(r => r.id === replyId)
    if (reply) reply.content = editReplyContent.value
    editingReplyId.value = null
    toast.success('Reply updated')
  } catch (error) {
    console.error('Failed to update reply:', error)
    toast.error('Failed to update reply')
  }
}

const deleteReply = async (replyId) => {
  if (!confirm('Are you sure you want to delete this reply?')) return
  try {
    await api.delete(`/forum/replies/${replyId}`)
    replies.value = replies.value.filter(r => r.id !== replyId)
    toast.success('Reply deleted')
  } catch (error) {
    console.error('Failed to delete reply:', error)
    toast.error('Failed to delete reply')
  }
}

const scrollToReply = () => {
  composer.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(load)
</script>

<style scoped>
.discussion-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding: 2rem 0 4rem;
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

.discussion-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: rgb(var(--color-primary));
}

/* Post Card */
.post-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  overflow: hidden;
  margin-bottom: 2rem;
}

.original-post {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.post-sidebar {
  width: 200px;
  background: rgb(var(--color-background));
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-right: 1px solid rgb(var(--color-border));
  flex-shrink: 0;
}

.author-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  background: white;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.author-avatar.sm {
  width: 3rem;
  height: 3rem;
  border-width: 2px;
}

.author-avatar img {
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
  font-size: 2rem;
  font-weight: 600;
}

.avatar-placeholder.sm {
  font-size: 1.25rem;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  font-weight: 600;
  color: rgb(var(--color-text));
  word-break: break-word;
}

.author-role {
  font-size: 0.75rem;
  color: rgb(var(--color-primary));
  font-weight: 500;
  background: rgba(var(--color-primary), 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.post-content-wrapper {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.post-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.post-menu {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
  border-radius: 0.25rem;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: rgb(var(--color-primary));
}

.icon-btn.danger:hover {
  color: #ef4444;
}

.post-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.post-date {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.post-body {
  flex: 1;
  color: rgb(var(--color-text));
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
  margin-bottom: 2rem;
}

.edit-mode {
  margin-bottom: 2rem;
}

.edit-mode textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.post-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-border));
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-primary));
}

.action-btn.sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

/* Replies */
.replies-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgb(var(--color-border));
}

.replies-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.reply-card {
  margin-bottom: 1.5rem;
}

.reply-card .post-sidebar {
  width: 100px;
  padding: 1.5rem 1rem;
}

.reply-card .post-content-wrapper {
  padding: 1.5rem;
}

.reply-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.reply-card .post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Composer */
.composer-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgb(var(--color-border));
  margin-top: 3rem;
}

.composer-section h3 {
  margin-bottom: 1.5rem;
  color: rgb(var(--color-text));
}

.editor-wrapper {
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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

.btn--primary:disabled {
  background: rgb(var(--color-text-secondary));
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--ghost:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .post-card {
    flex-direction: column;
  }

  .post-sidebar {
    width: 100%;
    flex-direction: row;
    padding: 1rem;
    border-right: none;
    border-bottom: 1px solid rgb(var(--color-border));
    text-align: left;
    gap: 1rem;
  }

  .author-avatar {
    margin-bottom: 0;
    width: 3rem;
    height: 3rem;
    border-width: 2px;
  }

  .author-info {
    align-items: flex-start;
  }

  .reply-card .post-sidebar {
    width: 100%;
  }
}
</style>
