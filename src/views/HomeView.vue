<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <div class="hero__grid">
          <div class="hero__content">
            <div class="hero__badge">
              <Sprout :size="16" class="hero__badge-icon" />
              <MarkdownText keypath="home.badge" tag="span" inline class-name="hero__badge-text" />
            </div>
            <MarkdownText keypath="home.title" tag="h1" inline class-name="hero__title" />
            <MarkdownText keypath="home.description" class-name="hero__description" />
            <div class="hero__actions" v-if="!isLoggedIn">
              <button class="btn btn--primary" @click="handleNavigate('signup')">
                <MarkdownText keypath="home.joinCommunity" tag="span" inline />
                <ArrowRight :size="20" />
              </button>
              <button class="btn btn--outline" @click="handleNavigate('story')">
                <MarkdownText keypath="home.learnMore" tag="span" inline />
              </button>
            </div>
          </div>
          <div class="hero__image-container">
            <div class="hero__image-wrapper">
              <ImageWithFallback
                src="/images/homepagebig.jpeg"
                alt="Community gathering"
                class-name="hero__image"
              />
            </div>
            <div class="hero__stat-card">
              <div class="hero__stat-icon">
                <Users :size="24" />
              </div>
              <div>
                <MarkdownText keypath="home.communityMembers" tag="div" inline class-name="hero__stat-label" />
                <div class="hero__stat-value">{{ userCount > 0 ? userCount.toLocaleString() + '+' : '1,200+' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="values">
      <div class="values__container">
        <div class="values__header">
          <MarkdownText keypath="home.coreValues" tag="h2" inline />
          <MarkdownText keypath="home.coreValuesSubtitle" class-name="values__subtitle" />
        </div>
        <div class="values__grid">
          <div class="value-card value-card--primary">
            <div class="value-card__icon value-card__icon--primary">
              <Heart :size="28" />
            </div>
            <MarkdownText keypath="home.communityConnection" tag="h3" inline class-name="value-card__title" />
            <MarkdownText keypath="home.communityConnectionDesc" class-name="value-card__description" />
          </div>
          <div class="value-card value-card--secondary">
            <div class="value-card__icon value-card__icon--secondary">
              <Sprout :size="28" />
            </div>
            <MarkdownText keypath="home.healthyLiving" tag="h3" inline class-name="value-card__title" />
            <MarkdownText keypath="home.healthyLivingDesc" class-name="value-card__description" />
          </div>
          <div class="value-card value-card--accent">
            <div class="value-card__icon value-card__icon--accent">
              <Leaf :size="28" />
            </div>
            <MarkdownText keypath="home.sustainability" tag="h3" inline class-name="value-card__title" />
            <MarkdownText keypath="home.sustainabilityDesc" class-name="value-card__description" />
          </div>
          <div class="value-card value-card--tertiary">
            <div class="value-card__icon value-card__icon--tertiary">
              <BookOpen :size="28" />
            </div>
            <MarkdownText keypath="home.lifelongLearning" tag="h3" inline class-name="value-card__title" />
            <MarkdownText keypath="home.lifelongLearningDesc" class-name="value-card__description" />
          </div>
        </div>
      </div>
    </section>

    <!-- Community Pulse -->
    <section class="community-pulse">
      <div class="community-pulse__container">
        <div class="pulse-copy">
          <div class="pulse-badge">
            <Sparkles :size="16" />
            <MarkdownText keypath="home.hearFromCommunity" tag="span" inline />
          </div>
          <MarkdownText keypath="home.communityPulse" tag="h2" inline />
          <MarkdownText keypath="home.communityPulseDesc" />
        </div>
        <CommunityPoll />
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="events">
      <div class="events__container">
        <div class="events__header">
          <div>
            <MarkdownText keypath="home.upcomingEvents" tag="h2" inline />
            <MarkdownText keypath="home.upcomingEventsSubtitle" class-name="events__subtitle" />
          </div>
          <button class="events__view-all events__view-all--desktop" @click="handleNavigate('events')">
            <MarkdownText keypath="home.viewAllEvents" tag="span" inline />
            <ArrowRight :size="20" />
          </button>
        </div>
        <div class="events__grid">
          <EventCard
            v-for="(event, index) in upcomingEvents"
            :key="event.id || index"
            v-bind="event"
            :on-view-details="() => handleViewDetails(event)"
            :on-register="() => handleRegister(event)"
            :status="event.status"
          />
        </div>
        <button class="events__view-all events__view-all--mobile" @click="handleNavigate('events')">
          <MarkdownText keypath="home.viewAllEvents" tag="span" inline />
        </button>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" v-if="!isLoggedIn">
      <div class="cta__container">
        <MarkdownText keypath="home.ctaTitle" tag="h2" inline class-name="cta__title" />
        <MarkdownText keypath="home.ctaDescription" class-name="cta__description" />
        <div class="cta__actions">
          <button class="btn btn--white" @click="handleNavigate('signup')">
            <MarkdownText keypath="home.createAccount" tag="span" inline />
          </button>
          <button class="btn btn--outline-white" @click="handleNavigate('map')">
            <MapPin :size="20" />
            <MarkdownText keypath="home.exploreLocalInitiatives" tag="span" inline />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ArrowRight, Users, MapPin, Sprout, Heart, Leaf, Sparkles, BookOpen } from 'lucide-vue-next'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import api from '@/services/api'
import EventCard from '../components/EventCard.vue'
import ImageWithFallback from '../components/ImageWithFallback.vue'
import CommunityPoll from '../components/CommunityPoll.vue'
import MarkdownText from '../components/MarkdownText.vue'
import { useConfirm } from '@/composables/useConfirm'
import { resolveImageUrl } from '@/utils/resolveImageUrl'

export default {
  name: 'HomePage',
  components: {
    EventCard,
    ImageWithFallback,
    CommunityPoll,
    MarkdownText,
    ArrowRight,
    Users,
    MapPin,
    Sprout,
    Heart,
    Leaf,
    Sparkles,
    BookOpen
  },
  setup() {
    const confirmModal = useConfirm()
    return {
      confirmModal
    }
  },
  computed: {
    ...mapState(useAuthStore, ['isLoggedIn'])
  },
  data() {
    return {
      authStore: useAuthStore(),
      upcomingEvents: [],
      loading: false,
      userCount: 0
    }
  },
  async created() {
    await Promise.all([
      this.loadEvents(),
      this.loadStats()
    ])
  },
  methods: {
    handleNavigate(page) {
      console.log('Navigate to:', page)
      this.$router.push({ name: page })
    },
    async loadEvents() {
      this.loading = true
      try {
        // Fetch upcoming events
        const data = await api.get('/events?limit=10')

        const normalizeEvent = (event) => {
          const attendeeCount = event.attendees ?? event.attendeeCount ?? (
            event.registrations ? event.registrations.filter((r) => r.status === 'registered').length : 0
          )
          return {
            ...event,
            category: typeof event.category === 'object' ? event.category?.name : event.category,
            imageUrl: resolveImageUrl(event.imageUrl || event.image || ''),
            attendees: attendeeCount,
            attendeeCount,
            status: event.status || null
          }
        }

        // Filter out events user is already registered for and limit to 3
        this.upcomingEvents = (data.events || [])
          .map(normalizeEvent)
          .filter(event => event.status !== 'registered')
          .slice(0, 3)
      } catch (err) {
        console.error('Failed to load home page events', err)
      } finally {
        this.loading = false
      }
    },
    async loadStats() {
      try {
        const data = await api.get('/stats')
        this.userCount = data.userCount || 0
      } catch (err) {
        console.error('Failed to load stats', err)
        // Keep default value of 0
      }
    },
    requireLogin() {
      if (this.authStore?.isLoggedIn && this.authStore?.user) return true
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
      return false
    },
    handleViewDetails(event) {
      this.$router.push({ name: 'event-detail', params: { id: event.id } })
    },
    async handleRegister(event) {
      if (!this.requireLogin()) return

      // Logic for toggling Interest
      if (event.status === 'interested') {
        const confirmed = await this.confirmModal.confirm({
          title: 'Remove Interest',
          message: `Are you sure you want to remove interest for "${event.title}"?`,
          confirmText: 'Remove',
          type: 'warning'
        })
        if (!confirmed) return
        await this.performUnregister(event, 'Interest removed')
        return
      }

      // Logic for Unregistering (if already registered)
      if (event.status === 'registered') {
        const confirmed = await this.confirmModal.confirm({
          title: 'Unregister from Event',
          message: `Are you sure you want to unregister from "${event.title}"?`,
          confirmText: 'Unregister',
          type: 'warning'
        })
        if (!confirmed) return
        await this.performUnregister(event, 'Successfully unregistered')
        return
      }

      const confirmed = await this.confirmModal.confirm({
        title: this.$t('eventDetail.registration'),
        message: this.$t('eventsPage.confirmRegister', { title: event.title }),
        confirmText: this.$t('eventDetail.registerNow'),
        type: 'question'
      })
      if (!confirmed) return
      
      const toast = useToastStore()
      try {
        await api.post(`/events/${event.id}/register`, {})
        toast.success('Successfully registered!')
        this.updateEventStatus(event, 'registered')
      } catch (err) {
        console.error('Registration failed', err)
        toast.error('Registration failed')
      }
    },
    async performUnregister(event, successMsg) {
       const toast = useToastStore()
       try {
         await api.delete(`/events/${event.id}/register`)
         toast.success(successMsg)
         this.updateEventStatus(event, null)
       } catch (err) {
         console.error('Unregister failed', err)
         toast.error('Could not update status')
       }
    },
    updateEventStatus(event, newStatus) {
        const index = this.upcomingEvents.findIndex((e) => e.id === event.id)
        if (index !== -1) {
          const current = this.upcomingEvents[index]
          
          let increment = 0
          if (newStatus === 'registered' && current.status !== 'registered') increment = 1
          if (newStatus !== 'registered' && current.status === 'registered') increment = -1
          
          const updated = {
            ...current,
            status: newStatus,
            attendees: (current.attendees || 0) + increment,
            attendeeCount: (current.attendeeCount || current.attendees || 0) + increment
          }
          this.upcomingEvents.splice(index, 1, updated)
        }
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg,
    rgba(var(--color-primary), 0.1) 0%,
    rgb(var(--color-background)) 50%,
    rgba(var(--color-accent), 0.1) 100%
  );
}

.hero__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 5rem 1rem;
}

@media (min-width: 640px) {
  .hero__container {
    padding: 5rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .hero__container {
    padding: 8rem 2rem;
  }
}

.hero__grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  width: fit-content;
}

.hero__badge-icon {
  color: rgb(var(--color-primary));
}

.hero__badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.hero__title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--color-text));
  margin: 0;
}

@media (min-width: 1024px) {
  .hero__title {
    font-size: 3.5rem;
  }
}

.hero__description {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0;
  white-space: pre-line;
}

.hero__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .hero__actions {
    flex-direction: row;
  }
}

.hero__image-container {
  position: relative;
}

.hero__image-wrapper {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hero__image {
  width: 100%;
  height: 500px;
  object-fit: cover;
}

.hero__stat-card {
  position: absolute;
  bottom: -1.5rem;
  left: -1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(var(--color-border));
  max-width: 18rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero__stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-primary));
}

.hero__stat-label {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.hero__stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

/* Values Section */
.values {
  padding: 5rem 0;
  background: white;
}

.values__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .values__container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .values__container {
    padding: 0 2rem;
  }
}

.values__header {
  text-align: center;
  margin-bottom: 3rem;
}

.values__header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: rgb(var(--color-text));
}

.values__subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.values__grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .values__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .values__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.value-card {
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.value-card--primary {
  background: linear-gradient(135deg, rgba(var(--color-primary), 0.05) 0%, transparent 100%);
}

.value-card--secondary {
  background: linear-gradient(135deg, rgba(var(--color-secondary), 0.05) 0%, transparent 100%);
}

.value-card--accent {
  background: linear-gradient(135deg, rgba(var(--color-accent), 0.1) 0%, transparent 100%);
}

.value-card--tertiary {
  background: linear-gradient(135deg, rgba(var(--color-primary-dark), 0.08) 0%, transparent 100%);
}

.value-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.value-card__icon--primary {
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
}

.value-card__icon--secondary {
  background: rgba(var(--color-secondary), 0.2);
  color: rgb(var(--color-secondary));
}

.value-card__icon--accent {
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
}

.value-card__icon--tertiary {
  background: rgba(var(--color-primary-dark), 0.2);
  color: rgb(var(--color-primary-dark));
}

.value-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.value-card__description {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
  margin: 0;
}

.community-pulse {
  padding: 5rem 0;
  background: rgb(var(--color-background));
}

.community-pulse__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 768px) {
  .community-pulse__container {
    grid-template-columns: 1fr 1fr;
  }
}

.pulse-copy h2 {
  font-size: 2rem;
  margin: 0.5rem 0;
  color: rgb(var(--color-text));
}

.pulse-copy p {
  color: rgb(var(--color-text-secondary));
  max-width: 36rem;
  margin: 0;
  line-height: 1.6;
}

.pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-primary));
  font-weight: 600;
}

/* Events Section */
.events {
  padding: 5rem 0;
}

.events__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .events__container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .events__container {
    padding: 0 2rem;
  }
}

.events__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.events__header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin: 0;
}

.events__subtitle {
  margin-top: 0.5rem;
  color: rgb(var(--color-text-secondary));
  white-space: pre-line;
}

.events__view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-primary));
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease;
}

.events__view-all:hover {
  color: rgb(var(--color-primary-dark));
}

.events__view-all--desktop {
  display: none;
}

@media (min-width: 640px) {
  .events__view-all--desktop {
    display: flex;
  }
}

.events__view-all--mobile {
  display: block;
  width: 100%;
  margin-top: 2rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  border: 2px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.events__view-all--mobile:hover {
  background: rgb(var(--color-primary));
  color: white;
}

@media (min-width: 640px) {
  .events__view-all--mobile {
    display: none;
  }
}

.events__grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .events__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .events__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* CTA Section */
.cta {
  padding: 5rem 0;
  background: linear-gradient(135deg,
    rgb(var(--color-primary)) 0%,
    rgb(var(--color-primary-dark)) 100%
  );
  color: white;
}

.cta__container {
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 640px) {
  .cta__container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .cta__container {
    padding: 0 2rem;
  }
}

.cta__title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.cta__description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
}

.cta__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
}

@media (min-width: 640px) {
  .cta__actions {
    flex-direction: row;
  }
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--primary:hover {
  background: rgb(var(--color-primary-dark));
}

.btn--outline {
  border: 2px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
}

.btn--outline:hover {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--white {
  background: white;
  color: rgb(var(--color-primary));
}

.btn--white:hover {
  background: rgba(255, 255, 255, 0.9);
}

.btn--outline-white {
  border: 2px solid white;
  color: white;
  background: transparent;
}

.btn--outline-white:hover {
  background: white;
  color: rgb(var(--color-primary));
}
</style>
