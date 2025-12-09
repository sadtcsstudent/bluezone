<template>
  <div class="story-page">
    <!-- Hero -->
    <section class="story-hero">
      <div class="story-hero-container">
        <div class="story-hero-content">
          <div class="story-badge">
            <Heart :size="16" class="story-badge-icon" />
            <span class="story-badge-text">{{ $t('story.badge') }}</span>
          </div>
          <h1>{{ $t('story.title') }}</h1>
          <p class="story-hero-subtitle">
            {{ $t('story.subtitle') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Origin Story -->
    <section class="origin-section">
      <div class="origin-container">
        <div class="origin-grid">
          <div class="origin-content">
            <h2>{{ $t('story.originTitle') }}</h2>
            <p class="origin-text">
              {{ $t('story.originText1') }}
            </p>
            <p class="origin-text">
              {{ $t('story.originText2') }}
            </p>
            <p class="origin-text">
              {{ $t('story.originText3') }}
            </p>
          </div>
          <div class="origin-image-wrapper">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1661328992560-55256f06bdad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGxpdmluZ3xlbnwxfHx8fDE3NjQ0OTg4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Sustainable living"
              class-name="origin-image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Mission, Vision, Values -->
    <section class="mvv-section">
      <div class="mvv-container">
        <div class="mvv-content">
          <!-- Mission -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--primary">
              <Target :size="32" />
            </div>
            <h2>{{ $t('story.missionTitle') }}</h2>
            <p class="mvv-text">
              {{ $t('story.missionText') }}
            </p>
          </div>

          <!-- Vision -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--secondary">
              <Eye :size="32" />
            </div>
            <h2>{{ $t('story.visionTitle') }}</h2>
            <p class="mvv-text">
              {{ $t('story.visionText') }}
            </p>
          </div>

          <!-- Values -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--accent">
              <Compass :size="32" />
            </div>
            <h2>{{ $t('story.valuesTitle') }}</h2>
            <div class="values-grid">
              <div class="value-card">
                <h4>{{ $t('story.values.communityFirst.title') }}</h4>
                <p class="value-text">
                  {{ $t('story.values.communityFirst.text') }}
                </p>
              </div>
              <div class="value-card">
                <h4>{{ $t('story.values.inclusivity.title') }}</h4>
                <p class="value-text">
                  {{ $t('story.values.inclusivity.text') }}
                </p>
              </div>
              <div class="value-card">
                <h4>{{ $t('story.values.transparency.title') }}</h4>
                <p class="value-text">
                  {{ $t('story.values.transparency.text') }}
                </p>
              </div>
              <div class="value-card">
                <h4>{{ $t('story.values.sustainability.title') }}</h4>
                <p class="value-text">
                  {{ $t('story.values.sustainability.text') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Do -->
    <section class="what-we-do-section">
      <div class="what-we-do-container">
        <div class="what-we-do-header">
          <h2>{{ $t('story.whatWeDo.title') }}</h2>
          <p class="what-we-do-subtitle">
            {{ $t('story.whatWeDo.subtitle') }}
          </p>
        </div>
        <div class="what-we-do-grid">
          <div class="activity-card">
            <div class="activity-icon">
              <Users :size="24" />
            </div>
            <h4>{{ $t('story.whatWeDo.connect.title') }}</h4>
            <p class="activity-text">
              {{ $t('story.whatWeDo.connect.text') }}
            </p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">
              <Sprout :size="24" />
            </div>
            <h4>{{ $t('story.whatWeDo.learn.title') }}</h4>
            <p class="activity-text">
              {{ $t('story.whatWeDo.learn.text') }}
            </p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">
              <Heart :size="24" />
            </div>
            <h4>{{ $t('story.whatWeDo.act.title') }}</h4>
            <p class="activity-text">
              {{ $t('story.whatWeDo.act.text') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Join Us -->
    <section class="join-us-section" v-if="!isLoggedIn">
      <div class="join-us-container">
        <h2 class="join-us-title">{{ $t('story.joinMovement.title') }}</h2>
        <p class="join-us-text">
          {{ $t('story.joinMovement.text') }}
        </p>
        <button @click="handleJoin" class="join-us-btn">
          {{ $t('story.joinBtn') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { Heart, Users, Sprout, Target, Eye, Compass } from 'lucide-vue-next'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import ImageWithFallback from '../components/ImageWithFallback.vue'

export default {
  name: 'StoryView',
  components: {
    ImageWithFallback,
    Heart,
    Users,
    Sprout,
    Target,
    Eye,
    Compass
  },
  computed: {
    ...mapState(useAuthStore, ['isLoggedIn'])
  },
  methods: {
    handleJoin() {
      this.$router.push({ name: 'signup' })
    }
  }
}
</script>

<style scoped>
.story-page {
  min-height: 100vh;
}

/* Hero Section */
.story-hero {
  position: relative;
  background: linear-gradient(135deg,
    rgba(var(--color-primary), 0.1) 0%,
    rgb(var(--color-background)) 100%
  );
}

.story-hero-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 5rem 1rem;
}

@media (min-width: 640px) {
  .story-hero-container {
    padding: 5rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .story-hero-container {
    padding: 5rem 2rem;
  }
}

.story-hero-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.story-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgb(var(--color-border));
  width: fit-content;
  margin: 0 auto;
}

.story-badge-icon {
  color: rgb(var(--color-primary));
}

.story-badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.story-hero-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

@media (min-width: 1024px) {
  .story-hero-content h1 {
    font-size: 3rem;
  }
}

.story-hero-subtitle {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
  max-width: 48rem;
  margin: 0 auto;
}

/* Origin Section */
.origin-section {
  padding: 5rem 0;
}

.origin-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .origin-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .origin-container {
    padding: 0 2rem;
  }
}

.origin-grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .origin-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.origin-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.origin-content h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.origin-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.7;
}

.origin-image-wrapper {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.origin-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

/* Mission, Vision, Values Section */
.mvv-section {
  padding: 5rem 0;
  background: white;
}

.mvv-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .mvv-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .mvv-container {
    padding: 0 2rem;
  }
}

.mvv-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.mvv-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mvv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  margin: 0 auto;
}

.mvv-icon--primary {
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
}

.mvv-icon--secondary {
  background: rgba(var(--color-secondary), 0.2);
  color: rgb(var(--color-secondary));
}

.mvv-icon--accent {
  background: rgba(var(--color-accent), 0.3);
  color: rgb(var(--color-primary-dark));
}

.mvv-item h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.mvv-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.7;
  max-width: 48rem;
  margin: 0 auto;
}

.values-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.value-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: rgb(var(--color-background));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.value-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.value-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
}

/* What We Do Section */
.what-we-do-section {
  padding: 5rem 0;
}

.what-we-do-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .what-we-do-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .what-we-do-container {
    padding: 0 2rem;
  }
}

.what-we-do-header {
  text-align: center;
  margin-bottom: 3rem;
}

.what-we-do-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 1rem;
}

.what-we-do-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.what-we-do-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .what-we-do-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.activity-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
}

.activity-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.activity-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
}

/* Join Us Section */
.join-us-section {
  padding: 5rem 0;
  background: linear-gradient(135deg,
    rgb(var(--color-primary)) 0%,
    rgb(var(--color-primary-dark)) 100%
  );
  color: white;
}

.join-us-container {
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 640px) {
  .join-us-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .join-us-container {
    padding: 0 2rem;
  }
}

.join-us-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.join-us-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.125rem;
  line-height: 1.6;
}

.join-us-btn {
  padding: 1rem 2rem;
  border-radius: 9999px;
  background: white;
  color: rgb(var(--color-primary));
  border: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  margin: 0 auto;
}

.join-us-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
