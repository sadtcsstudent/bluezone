import { defineStore } from 'pinia'
import api from '@/services/api'

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
        loading: false
    }),

    actions: {
        async fetchNotifications() {
            this.loading = true
            try {
                const data = await api.get('/notifications')
                this.notifications = data.notifications || []
                await this.fetchUnreadCount()
            } catch (err) {
                console.error('Failed to fetch notifications', err)
            } finally {
                this.loading = false
            }
        },

        async fetchUnreadCount() {
            try {
                const data = await api.get('/notifications/unread-count')
                this.unreadCount = data.unread || 0
            } catch (err) {
                console.error('Failed to fetch unread count', err)
            }
        },

        async markAsRead(id) {
            try {
                await api.put(`/notifications/${id}/read`)
                const notification = this.notifications.find(n => n.id === id)
                if (notification && !notification.read) {
                    notification.read = true
                    this.unreadCount = Math.max(0, this.unreadCount - 1)
                }
            } catch (err) {
                console.error('Failed to mark notification as read', err)
            }
        },

        async markAllAsRead() {
            try {
                await api.put('/notifications/read-all')
                this.notifications.forEach(n => n.read = true)
                this.unreadCount = 0
            } catch (err) {
                console.error('Failed to mark all as read', err)
            }
        },

        // Call this when a real-time notification is received
        addNotification(notification) {
            this.notifications.unshift(notification)
            this.unreadCount++
        }
    }
})
