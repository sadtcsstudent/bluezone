<template>
  <div class="messages-page">
    <div class="messages-container">
      <!-- Sidebar -->
      <aside class="conversations-sidebar" :class="{ 'hidden-mobile': activeId }">
        <div class="sidebar-header">
          <h2>Messages</h2>
          <button class="icon-btn" @click="showNewConversation = true">
            <Edit :size="20" />
          </button>
        </div>
        
        <div class="search-bar">
          <Search :size="18" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Search messages..." />
        </div>

        <div class="conversations-list">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div
            v-else
            v-for="c in filteredConversations"
            :key="c.id"
            class="conversation-item"
            :class="{ active: c.id === activeId }"
            @click="openConversation(c.id)"
          >
            <div class="avatar-wrapper">
              <img 
                v-if="getRecipient(c)?.avatar" 
                :src="getRecipient(c)?.avatar" 
                class="avatar-img" 
                alt="Avatar"
              />
              <div v-else class="avatar-placeholder">
                <User :size="24" />
              </div>
              <span v-if="isOnline(getRecipient(c)?.userId)" class="status-dot online"></span>
            </div>
            
            <div class="conversation-info">
              <div class="conversation-top">
                <span class="conversation-name">{{ getRecipient(c)?.name || getRecipient(c)?.email }}</span>
                <span class="conversation-time">{{ formatTime(c.lastMessageAt) }}</span>
              </div>
              <p class="conversation-preview" :class="{ unread: c.unreadCount > 0 }">
                {{ c.lastMessage?.content || 'Start a conversation' }}
              </p>
            </div>
            
            <div v-if="c.unreadCount > 0" class="unread-badge">
              {{ c.unreadCount }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat Area -->
      <main class="chat-area" :class="{ 'active': activeId }">
        <div v-if="activeConversation" class="chat-wrapper">
          <!-- Chat Header -->
          <header class="chat-header">
            <button class="back-btn" @click="activeId = null">
              <ArrowLeft :size="24" />
            </button>
            
            <div class="header-user">
              <div class="avatar-wrapper sm">
                <img 
                  v-if="getRecipient(activeConversation)?.avatar" 
                  :src="getRecipient(activeConversation)?.avatar" 
                  class="avatar-img" 
                  alt="Avatar"
                />
                <div v-else class="avatar-placeholder">
                  <User :size="20" />
                </div>
                <span v-if="isOnline(getRecipient(activeConversation)?.userId)" class="status-dot online"></span>
              </div>
              <div class="header-info">
                <h3>{{ getRecipient(activeConversation)?.name || getRecipient(activeConversation)?.email }}</h3>
                <span class="status-text">
                  {{ isOnline(getRecipient(activeConversation)?.userId) ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>

            <div class="header-actions">
              <button class="icon-btn" @click="deleteConversation"><Trash2 :size="20" /></button>
            </div>
          </header>

          <!-- Messages List -->
          <div class="messages-list" ref="messagesContainer">
            <div 
              v-for="(m, index) in activeConversation.messages" 
              :key="m.id" 
              class="message-group"
              :class="{ 'own-message': m.senderId === authStore.user.id }"
            >
              <div class="message-bubble">
                {{ m.content }}
              </div>
              <span class="message-time">
                {{ formatMessageTime(m.createdAt) }}
              </span>
            </div>
            
            <div v-if="typingUsers.size > 0" class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>

          <!-- Composer -->
          <div class="chat-composer">
            <button class="icon-btn"><Paperclip :size="20" /></button>
            <form @submit.prevent="send" class="composer-form">
              <input 
                v-model="content" 
                @input="handleTyping" 
                placeholder="Type a message..." 
                required 
              />
              <button type="submit" class="send-btn" :disabled="!content.trim()">
                <Send :size="20" />
              </button>
            </form>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-content">
            <MessageCircle :size="64" />
            <h3>Your Messages</h3>
            <p>Select a conversation to start chatting</p>
          </div>
        </div>
      </main>
    </div>

    <!-- New Conversation Modal -->
    <div v-if="showNewConversation" class="modal-overlay" @click.self="showNewConversation = false">
      <div class="modal-content">
        <h2>New Conversation</h2>
        <div class="search-bar">
          <Search :size="18" class="search-icon" />
          <input v-model="userSearchQuery" type="text" placeholder="Search users..." @input="searchUsers" />
        </div>
        <div class="user-list">
          <div 
            v-for="user in userSearchResults" 
            :key="user.id" 
            class="user-item"
            @click="startConversation(user.id)"
          >
            <div class="avatar-wrapper sm">
              <div class="avatar-placeholder">
                {{ (user.name || user.email)[0].toUpperCase() }}
              </div>
            </div>
            <span>{{ user.name || user.email }}</span>
          </div>
        </div>
        <button class="btn btn--ghost" @click="showNewConversation = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, computed } from 'vue'
import { 
  User, Search, Edit, ArrowLeft, Phone, Video, 
  MoreVertical, Paperclip, Send, MessageCircle, Trash2 
} from 'lucide-vue-next'
import api from '@/services/api'
import { socketService } from '@/services/socket.service'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const authStore = useAuthStore()
const toast = useToastStore()
const conversations = ref([])
const activeConversation = ref(null)
const activeId = ref(null)
const content = ref('')
const typingUsers = ref(new Set())
const messagesContainer = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const showNewConversation = ref(false)
const userSearchQuery = ref('')
const userSearchResults = ref([])
let typingTimeout = null

// Helper to get the other participant
const getRecipient = (conversation) => {
  if (!conversation?.participants) return null
  return conversation.participants.find(p => p.userId !== authStore.user.id)?.user
}

// Helper to check online status (mock for now, real implementation would use a store)
const isOnline = (userId) => {
  // This would ideally come from a reactive store updated by socket events
  return true // Placeholder
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

const formatMessageTime = (dateString) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(dateString))
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const load = async () => {
  loading.value = true
  try {
    const res = await api.get('/messages/conversations')
    conversations.value = res.conversations || []
  } catch (err) {
    console.error('Failed to load conversations', err)
    toast.error('Failed to load conversations')
  } finally {
    loading.value = false
  }
}

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c => {
    const recipient = getRecipient(c)
    return recipient?.name?.toLowerCase().includes(q) || recipient?.email?.toLowerCase().includes(q)
  })
})

const openConversation = async (id) => {
  activeId.value = id
  try {
    const res = await api.get(`/messages/conversations/${id}`)
    activeConversation.value = res.conversation
    await api.put(`/messages/conversations/${id}/read`)
    typingUsers.value.clear()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to open conversation', err)
  }
}

const send = async () => {
  if (!content.value.trim()) return
  const recipient = activeConversation.value.participants.find(p => p.userId !== authStore.user.id)
  
  const tempMessage = {
    id: Date.now(),
    content: content.value,
    senderId: authStore.user.id,
    createdAt: new Date().toISOString()
  }
  activeConversation.value.messages.push(tempMessage)
  scrollToBottom()
  
  socketService.emit('message:send', {
    conversationId: activeId.value,
    senderId: authStore.user.id,
    content: content.value,
    recipientId: recipient?.userId
  })

  const msgContent = content.value
  content.value = ''
  
  try {
    await api.post(`/messages/conversations/${activeId.value}/messages`, { content: msgContent })
  } catch (err) {
    console.error('Failed to send message', err)
  }
  
  socketService.emit('typing:stop', { conversationId: activeId.value, userId: authStore.user.id, recipientId: recipient?.userId })
}

const handleTyping = () => {
  const recipient = activeConversation.value?.participants.find(p => p.userId !== authStore.user.id)
  if (!recipient) return

  socketService.emit('typing:start', { conversationId: activeId.value, userId: authStore.user.id, recipientId: recipient.userId })
  
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    socketService.emit('typing:stop', { conversationId: activeId.value, userId: authStore.user.id, recipientId: recipient.userId })
  }, 2000)
}

const deleteConversation = async () => {
  if (!confirm('Are you sure you want to delete this conversation?')) return
  try {
    await api.delete(`/messages/conversations/${activeId.value}`)
    conversations.value = conversations.value.filter(c => c.id !== activeId.value)
    activeId.value = null
    activeConversation.value = null
  } catch (err) {
    console.error('Failed to delete conversation', err)
  }
}

const searchUsers = async () => {
  if (!userSearchQuery.value) {
    userSearchResults.value = []
    return
  }
  try {
    const res = await api.get(`/users?search=${userSearchQuery.value}`)
    userSearchResults.value = res.users || []
  } catch (err) {
    console.error('Failed to search users', err)
  }
}

const startConversation = async (userId) => {
  try {
    const res = await api.post('/messages/conversations', { recipientId: userId })
    showNewConversation.value = false
    await load()
    openConversation(res.conversation.id)
  } catch (err) {
    console.error('Failed to start conversation', err)
  }
}

onMounted(() => {
  load()
  
  socketService.on('message:new', (message) => {
    if (activeId.value === message.conversationId) {
      activeConversation.value.messages.push(message)
      scrollToBottom()
      api.put(`/messages/conversations/${activeId.value}/read`)
    }
  })

  socketService.on('typing:start', (data) => {
    if (activeId.value === data.conversationId) {
      typingUsers.value.add(data.userId)
      scrollToBottom()
    }
  })

  socketService.on('typing:stop', (data) => {
    if (activeId.value === data.conversationId) {
      typingUsers.value.delete(data.userId)
    }
  })
})

onUnmounted(() => {
  socketService.off('message:new')
  socketService.off('typing:start')
  socketService.off('typing:stop')
})
</script>

<style scoped>
.messages-page {
  height: calc(100vh - 64px); /* Adjust based on navbar height */
  background: rgb(var(--color-background));
  overflow: hidden;
}

.messages-container {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  background: white;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
}

/* Sidebar */
.conversations-sidebar {
  width: 350px;
  border-right: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  background: white;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.search-bar {
  margin: 0 1.5rem 1rem;
  position: relative;
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
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  background: rgb(var(--color-background));
  transition: all 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  background: white;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.conversation-item:hover {
  background: rgb(var(--color-background));
}

.conversation-item.active {
  background: rgba(var(--color-primary), 0.05);
  border-left-color: rgb(var(--color-primary));
}

.avatar-wrapper {
  position: relative;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.avatar-wrapper.sm {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgb(var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid white;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-weight: 600;
  color: rgb(var(--color-text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.conversation-preview {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-preview.unread {
  color: rgb(var(--color-text));
  font-weight: 500;
}

.unread-badge {
  background: rgb(var(--color-primary));
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  height: fit-content;
  align-self: center;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgb(var(--color-background));
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-text));
}

.header-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.status-text {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-primary));
}

.messages-list {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 70%;
}

.message-group.own-message {
  align-self: flex-end;
  align-items: flex-end;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
  background: white;
  color: rgb(var(--color-text));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
}

.own-message .message-bubble {
  background: rgb(var(--color-primary));
  color: white;
  border-top-left-radius: 1rem;
  border-top-right-radius: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
  margin-top: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-group:hover .message-time {
  opacity: 1;
}

/* Typing Indicator */
.typing-indicator {
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
  width: fit-content;
  display: flex;
  gap: 0.25rem;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  background: rgb(var(--color-text-secondary));
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Composer */
.chat-composer {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: center;
  gap: 1rem;
}

.composer-form {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  background: rgb(var(--color-background));
  padding: 0.5rem;
  border-radius: 1.5rem;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.composer-form:focus-within {
  border-color: rgb(var(--color-primary));
}

.composer-form input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: rgb(var(--color-text));
}

.composer-form input:focus {
  outline: none;
}

.send-btn {
  background: rgb(var(--color-primary));
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: rgb(var(--color-primary-dark));
  transform: scale(1.05);
}

.send-btn:disabled {
  background: rgb(var(--color-text-secondary));
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-text-secondary));
}

.empty-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
}

.user-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 0.5rem;
}

.user-item:hover {
  background: rgb(var(--color-background));
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .conversations-sidebar {
    width: 100%;
  }
  
  .conversations-sidebar.hidden-mobile {
    display: none;
  }
  
  .chat-area {
    display: none;
  }
  
  .chat-area.active {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 50;
  }
  
  .back-btn {
    display: block;
  }
}

/* Loading State */
.loading-state {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(var(--color-primary), 0.1);
  border-top-color: rgb(var(--color-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
}
</style>
