<template>
  <div class="notification-bell-container" ref="container">
    <button 
      class="notification-bell" 
      @click="toggleDropdown"
      :class="{ 'active': isOpen }"
    >
      <Bell :size="20" />
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <div v-if="isOpen" class="dropdown-wrapper">
      <NotificationDropdown />
    </div>
  </div>
</template>

<script>
import { Bell } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import NotificationDropdown from './NotificationDropdown.vue'

export default {
  name: 'NotificationBell',
  components: { Bell, NotificationDropdown },
  setup() {
    const isOpen = ref(false)
    const container = ref(null)
    const store = useNotificationStore()
    const { unreadCount } = storeToRefs(store)

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    const closeDropdown = (e) => {
      if (container.value && !container.value.contains(e.target)) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', closeDropdown)
      store.fetchUnreadCount()
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown)
    })

    return {
      isOpen,
      container,
      toggleDropdown,
      unreadCount
    }
  }
}
</script>

<style scoped>
.notification-bell-container {
  position: relative;
}

.notification-bell {
  padding: 0.5rem;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.notification-bell:hover, .notification-bell.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}

.dropdown-wrapper {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  z-index: 100;
}

@media (max-width: 640px) {
  .dropdown-wrapper {
    position: fixed;
    top: 4rem;
    left: 0;
    right: 0;
    margin: 0;
    padding: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .dropdown-wrapper :deep(.notification-dropdown) {
    width: 100%;
    max-width: 400px;
  }
}
</style>
