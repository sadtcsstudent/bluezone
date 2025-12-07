<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <div class="hero__grid">
          <div class="hero__content">
            <div class="hero__badge">
              <Sprout :size="16" class="hero__badge-icon" />
              <span class="hero__badge-text">
                Living Laboratory • Learning Network
              </span>
            </div>
            <h1 class="hero__title">Welcome to Blue Zone Twente</h1>
            <p class="hero__description">
              A vibrant community dedicated to healthy, social, and sustainable living.
              Join us in creating a thriving ecosystem where people connect, learn,
              and grow together in the beautiful Twente region.
            </p>
            <div class="hero__actions" v-if="!isLoggedIn">
              <button class="btn btn--primary" @click="handleNavigate('signup')">
                <span>Join Our Community</span>
                <ArrowRight :size="20" />
              </button>
              <button class="btn btn--outline" @click="handleNavigate('story')">
                Learn More
              </button>
            </div>
          </div>
          <div class="hero__image-container">
            <div class="hero__image-wrapper">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1625246433906-6cfa33544b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzY0NDU5MDg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community gathering"
                class-name="hero__image"
              />
            </div>
            <div class="hero__stat-card">
              <div class="hero__stat-icon">
                <Users :size="24" />
              </div>
              <div>
                <div class="hero__stat-label">Community Members</div>
                <div class="hero__stat-value">1,200+</div>
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
          <h2>Our Core Values</h2>
          <p class="values__subtitle">
            Blue Zone Twente is built on principles that promote wellbeing,
            community connection, and sustainable living for all.
          </p>
        </div>
        <div class="values__grid">
          <div class="value-card value-card--primary">
            <div class="value-card__icon value-card__icon--primary">
              <Heart :size="28" />
            </div>
            <h3 class="value-card__title">Community Connection</h3>
            <p class="value-card__description">
              Building strong, supportive relationships through shared experiences,
              local initiatives, and meaningful interactions.
            </p>
          </div>
          <div class="value-card value-card--secondary">
            <div class="value-card__icon value-card__icon--secondary">
              <Sprout :size="28" />
            </div>
            <h3 class="value-card__title">Healthy Living</h3>
            <p class="value-card__description">
              Promoting physical and mental wellbeing through nutrition, movement,
              mindfulness, and access to healthy local food.
            </p>
          </div>
          <div class="value-card value-card--accent">
            <div class="value-card__icon value-card__icon--accent">
              <Leaf :size="28" />
            </div>
            <h3 class="value-card__title">Sustainability</h3>
            <p class="value-card__description">
              Creating a regenerative future through eco-friendly practices,
              local food systems, and environmental stewardship.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="events">
      <div class="events__container">
        <div class="events__header">
          <div>
            <h2>Upcoming Events</h2>
            <p class="events__subtitle">
              Join us for workshops, gatherings, and community activities
            </p>
          </div>
          <button class="events__view-all events__view-all--desktop" @click="handleNavigate('events')">
            <span>View All Events</span>
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
          View All Events
        </button>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" v-if="!isLoggedIn">
      <div class="cta__container">
        <h2 class="cta__title">Ready to Join Our Community?</h2>
        <p class="cta__description">
          Become part of a movement dedicated to creating healthier, more connected,
          and sustainable communities in Twente. Together, we can make a difference.
        </p>
        <div class="cta__actions">
          <button class="btn btn--white" @click="handleNavigate('signup')">
            Create Account
          </button>
          <button class="btn btn--outline-white" @click="handleNavigate('map')">
            <MapPin :size="20" />
            <span>Explore Local Initiatives</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ArrowRight, Users, MapPin, Sprout, Heart, Leaf } from 'lucide-vue-next'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import api from '@/services/api'
import EventCard from '../components/EventCard.vue'
import ImageWithFallback from '../components/ImageWithFallback.vue'

export default {
  name: 'HomePage',
  components: {
    EventCard,
    ImageWithFallback,
    ArrowRight,
    Users,
    MapPin,
    Sprout,
    Heart,
    Leaf
  },
  computed: {
    ...mapState(useAuthStore, ['isLoggedIn'])
  },
  data() {
    return {
      authStore: useAuthStore(),
      upcomingEvents: [],
      loading: false
    }
  },
  async created() {
    await this.loadEvents()
  },
  methods: {
    handleNavigate(page) {
      console.log('Navigate to:', page)
      this.$router.push({ name: page })
    },
    async loadEvents() {
      this.loading = true
      try {
        // Fetch 3 upcoming events
        const data = await api.get('/events?limit=3')
        
        const normalizeEvent = (event) => {
          const attendeeCount = event.attendees ?? event.attendeeCount ?? (
            event.registrations ? event.registrations.filter((r) => r.status === 'registered').length : 0
          )
          return {
            ...event,
            attendees: attendeeCount,
            attendeeCount,
            status: event.status || null
          }
        }
        
        this.upcomingEvents = (data.events || []).map(normalizeEvent)
      } catch (err) {
        console.error('Failed to load home page events', err)
      } finally {
        this.loading = false
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
        if (!confirm(`Remove interest for ${event.title}?`)) return
        await this.performUnregister(event, 'Interest removed')
        return
      }

      // Logic for Unregistering (if already registered)
      if (event.status === 'registered') {
        if (!confirm(`Unregister from ${event.title}?`)) return
        await this.performUnregister(event, 'Successfully unregistered')
        return
      }
      
      if (!confirm(`Register for ${event.title}?`)) return
      
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
    grid-template-columns: repeat(3, 1fr);
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
