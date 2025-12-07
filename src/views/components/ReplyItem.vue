<template>
  <article class="post-card reply-card" :class="{ 'nested-reply': depth > 0 }">
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
          <button class="icon-btn" @click="$emit('edit', reply)">
            <Edit2 :size="14" />
          </button>
          <button class="icon-btn danger" @click="$emit('delete', reply.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </header>

      <div v-if="editingId === reply.id" class="edit-mode">
        <textarea v-model="editContent" rows="3"></textarea>
        <div class="edit-actions">
          <button class="btn btn--sm btn--ghost" @click="$emit('cancel-edit')">Cancel</button>
          <button class="btn btn--sm btn--primary" @click="saveEdit">Save</button>
        </div>
      </div>
      <div v-else class="post-body">
        {{ reply.content }}
      </div>

      <footer class="post-actions">
        <button 
          class="action-btn sm" 
          :class="{ active: reply.likedByUser }"
          @click="$emit('like', reply)"
        >
          <ThumbsUp :size="16" />
          <span>{{ reply.likesCount || 0 }} Helpful</span>
        </button>
        <button class="action-btn sm" @click="$emit('reply', reply)">
          <MessageSquare :size="16" />
          <span>Reply</span>
        </button>
      </footer>

      <!-- Nested Replies -->
      <div v-if="reply.children && reply.children.length > 0" class="nested-replies">
        <ReplyItem 
          v-for="child in reply.children" 
          :key="child.id" 
          :reply="child" 
          :depth="depth + 1"
          :editing-id="editingId"
          :current-user-id="currentUserId"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @cancel-edit="$emit('cancel-edit')"
          @save-edit="$emit('save-edit', $event)"
          @like="$emit('like', $event)"
          @reply="$emit('reply', $event)"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ThumbsUp, MessageSquare, Edit2, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  reply: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  editingId: String,
  currentUserId: String
})

const emit = defineEmits(['edit', 'delete', 'cancel-edit', 'save-edit', 'like', 'reply'])

const editContent = ref('')

watch(() => props.editingId, (newId) => {
  if (newId === props.reply.id) {
    editContent.value = props.reply.content
  }
})

const saveEdit = () => {
  emit('save-edit', { id: props.reply.id, content: editContent.value })
}

const isAuthor = (authorId) => {
  return props.currentUserId === authorId
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = (now - date) / 1000

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.nested-reply {
  margin-top: 1.5rem;
  margin-bottom: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  margin-left: -1rem; /* Offset sidebar padding */
}

.post-sidebar {
  width: 80px;
  background: rgb(var(--color-background));
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-right: 1px solid rgb(var(--color-border));
  flex-shrink: 0;
}

.nested-reply .post-sidebar {
  background: transparent;
  border-right: none;
}

.author-avatar.sm {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder.sm {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-primary));
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.post-content-wrapper {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.reply-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.author-name {
  font-weight: 600;
  color: rgb(var(--color-text));
}

.post-date {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
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

.post-body {
  color: rgb(var(--color-text));
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-primary));
}

.action-btn.active {
  color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.08);
}

.nested-replies {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid rgb(var(--color-border));
}

.edit-mode textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  margin-bottom: 0.5rem;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
