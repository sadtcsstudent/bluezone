import axios from 'axios'

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach CSRF token from cookie if present
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN')
  if (token) {
    config.headers['X-XSRF-TOKEN'] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Import store dynamically to avoid circular dependency issues during init
    import('@/stores/toast').then(({ useToastStore }) => {
      const toastStore = useToastStore()

      const status = error.response?.status
      const data = error.response?.data

      // Global error handler for 500 errors (server issues)
      if (status >= 500) {
        toastStore.error(
          data?.message || 'Something went wrong on our end. Please try again later.',
          5000
        )
      }

      // We can also handle 401 (Unauthorized) globally if we want to redirect to login
      // but for now let's focus on user feedback for errors
    })

    return Promise.reject(error.response?.data || error.message)
  }
)

export default api
