<template>
  <div class="notification-dropdown">
    <div class="dropdown-header">
      <h3>{{ $t('components.notifications.title') }}</h3>
      <button 
        v-if="unreadCount > 0" 
        @click="markAllRead" 
        class="mark-all-btn"
      >
        {{ $t('components.notifications.markAllRead') }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="empty-state">
      <BellOff :size="32" />
      <p>{{ $t('components.notifications.empty') }}</p>
    </div>

    <div v-else class="notification-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="handleClick(notification)"
      >
        <div class="notification-icon">
          <component :is="getIcon(notification.type)" :size="20" />
        </div>
        <div class="notification-content">
          <p class="notification-title">{{ notification.title }}</p>
          <p class="notification-text">{{ notification.content }}</p>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        <div v-if="!notification.read" class="unread-dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { BellOff, Calendar, MessageCircle, Info } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NotificationDropdown',
  components: { BellOff, Calendar, MessageCircle, Info },
  setup() {
    const store = useNotificationStore()
    const router = useRouter()
    const { notifications, unreadCount, loading } = storeToRefs(store)

    onMounted(() => {
      store.fetchNotifications()
    })

    const markAllRead = () => {
      store.markAllAsRead()
    }

    const handleClick = (notification) => {
      if (!notification.read) {
        store.markAsRead(notification.id)
      }
      
      let link = notification.link
      
      // Handle cases where link is just an ID (not a path)
      if (link && !link.startsWith('/')) {
        switch (notification.type) {
          case 'forum_reply':
          case 'discussion_like':
          case 'reply_like':
            link = `/forum/${link}`
            break
          case 'event_registration':
          case 'event_reminder':
            link = `/events/${link}`
            break
          case 'group_invite':
          case 'group_join':
            link = `/groups/${link}`
            break
          default:
            // Fallback for unknown types if they look like IDs
            if (notification.type && notification.type.includes('event')) {
              link = `/events/${link}`
            } else if (notification.type && (notification.type.includes('forum') || notification.type.includes('discussion') || notification.type.includes('reply'))) {
              link = `/forum/${link}`
            }
        }
      }

      if (link) {
        router.push(link)
      }
    }

    const getIcon = (type) => {
      if (!type) return Info
      
      if (type.includes('event') || type === 'event_registration') return Calendar
      if (type.includes('forum') || type.includes('discussion') || type.includes('reply') || type === 'message') return MessageCircle
      
      return Info
    }

    const formatTime = (date) => {
      return new Date(date).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      notifications,
      unreadCount,
      loading,
      markAllRead,
      handleClick,
      getIcon,
      formatTime
    }
  }
}
</script>

<style scoped>
.notification-dropdown {
  width: 360px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgb(var(--color-border));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 480px;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.mark-all-btn {
  font-size: 0.75rem;
  color: rgb(var(--color-primary));
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.notification-list {
  overflow-y: auto;
  flex: 1;
}

.notification-item {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgb(var(--color-border));
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: rgb(var(--color-background));
}

.notification-item.unread {
  background: rgba(var(--color-primary), 0.05);
}

.notification-icon {
  color: rgb(var(--color-primary));
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.notification-text {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--color-primary));
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.loading-state, .empty-state {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-text-secondary));
  gap: 0.5rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(var(--color-primary), 0.1);
  border-top-color: rgb(var(--color-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
