<template>
  <div class="forum-card" @click="$emit('click')">
    <div class="forum-card-header">
      <div class="forum-card-info">
        <h3 class="forum-card-title">{{ title }}</h3>
        <span class="forum-card-category">{{ category }}</span>
      </div>
    </div>
    <p class="forum-card-preview">{{ preview }}</p>
    <div class="forum-card-meta">
      <div class="forum-card-author">
        <User :size="16" />
        <span>{{ author }}</span>
      </div>
      <div class="forum-card-stats">
        <div class="stat-item">
          <MessageCircle :size="16" />
          <span>{{ replies }} replies</span>
        </div>
        <div class="stat-item">
          <Clock :size="16" />
          <span>{{ lastActivity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { User, MessageCircle, Clock } from 'lucide-vue-next'

export default {
  name: 'ForumCard',
  components: {
    User,
    MessageCircle,
    Clock
  },
  emits: ['click'],
  props: {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    lastActivity: {
      type: String,
      required: true
    },
    replies: {
      type: Number,
      required: true
    },
    preview: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.forum-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.forum-card:hover {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.forum-card-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.forum-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.forum-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
  line-height: 1.4;
}

.forum-card-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.forum-card-preview {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
  margin-bottom: 1rem;
}

.forum-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-border));
}

@media (min-width: 640px) {
  .forum-card-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.forum-card-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.forum-card-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.stat-item svg {
  color: rgb(var(--color-primary));
}
</style>
