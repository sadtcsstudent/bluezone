import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import CompanyDashboardView from '../views/CompanyDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/story',
      name: 'story',
      component: () => import('../views/StoryView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue')
    },
    {
      path: '/newsletter',
      name: 'newsletter',
      component: () => import('../views/NewsletterView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/forum',
      name: 'forum',
      component: () => import('../views/ForumView.vue')
    },
    {
      path: '/forum/:id',
      name: 'discussion-detail',
      component: () => import('../views/DiscussionDetailView.vue')
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue')
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/MessagesView.vue')
    },
    {
      path: '/messages/:id',
      name: 'message-detail',
      component: () => import('../views/MessagesView.vue')
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/GroupsView.vue')
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: () => import('../views/GroupDetailView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView
    },
    {
      path: '/company-dashboard',
      name: 'company-dashboard',
      component: CompanyDashboardView
    }
  ]
})

export default router
