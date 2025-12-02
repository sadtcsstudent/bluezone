import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])

    const add = (message, type = 'info', duration = 3000) => {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        if (duration > 0) {
            setTimeout(() => {
                remove(id)
            }, duration)
        }
    }

    const remove = (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    const success = (message, duration) => add(message, 'success', duration)
    const error = (message, duration) => add(message, 'error', duration)
    const info = (message, duration) => add(message, 'info', duration)
    const warning = (message, duration) => add(message, 'warning', duration)

    return {
        toasts,
        add,
        remove,
        success,
        error,
        info,
        warning
    }
})
