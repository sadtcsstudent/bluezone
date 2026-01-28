<template>
  <div class="story-page">
    <!-- Hero -->
    <section class="story-hero">
      <div class="story-hero-container">
        <div class="story-hero-content">
          <div class="story-badge">
            <Heart :size="16" class="story-badge-icon" />
            <MarkdownText keypath="story.badge" tag="span" inline class-name="story-badge-text" />
          </div>
          <MarkdownText keypath="story.title" tag="h1" inline />
          <MarkdownText keypath="story.subtitle" class-name="story-hero-subtitle" />
        </div>
      </div>
    </section>

    <!-- Mission, Vision, Values -->
    <section id="mission-vision-values" class="mvv-section story-section">
      <div class="mvv-container">
        <div class="mvv-content">
          <!-- Mission -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--primary">
              <Target :size="32" />
            </div>
            <MarkdownText keypath="story.missionTitle" tag="h2" inline />
            <MarkdownText keypath="story.missionText" class-name="mvv-text" />
          </div>

          <!-- Vision -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--secondary">
              <Eye :size="32" />
            </div>
            <MarkdownText keypath="story.visionTitle" tag="h2" inline />
            <MarkdownText keypath="story.visionText" class-name="mvv-text" />
          </div>

          <!-- Values -->
          <div class="mvv-item">
            <div class="mvv-icon mvv-icon--accent">
              <Compass :size="32" />
            </div>
            <MarkdownText keypath="story.valuesTitle" tag="h2" inline />
            <div class="values-grid">
              <div class="value-card">
                <MarkdownText keypath="story.values.communityFirst.title" tag="h4" inline />
                <MarkdownText keypath="story.values.communityFirst.text" class-name="value-text" />
              </div>
              <div class="value-card">
                <MarkdownText keypath="story.values.inclusivity.title" tag="h4" inline />
                <MarkdownText keypath="story.values.inclusivity.text" class-name="value-text" />
              </div>
              <div class="value-card">
                <MarkdownText keypath="story.values.transparency.title" tag="h4" inline />
                <MarkdownText keypath="story.values.transparency.text" class-name="value-text" />
              </div>
              <div class="value-card">
                <MarkdownText keypath="story.values.sustainability.title" tag="h4" inline />
                <MarkdownText keypath="story.values.sustainability.text" class-name="value-text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Origin Story -->
    <section id="blue-zone-twente" class="origin-section story-section">
      <div class="origin-container">
        <div class="origin-grid">
          <div class="origin-content">
            <MarkdownText keypath="story.originTitle" tag="h2" inline />
            <MarkdownText keypath="story.originText1" class-name="origin-text" />
            <MarkdownText keypath="story.originText2" class-name="origin-text" />
            <MarkdownText keypath="story.originText3" class-name="origin-text" />
          </div>
          <div class="origin-image-wrapper">
            <ImageWithFallback
              :src="resolveStoryImage('story.originImage')"
              alt="Sustainable living"
              class-name="origin-image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- People -->
    <section id="our-team" class="people-section story-section">
      <div class="people-container">
        <div class="people-header">
          <MarkdownText keypath="story.people.title" tag="h2" inline />
          <MarkdownText keypath="story.people.subtitle" class-name="people-subtitle" />
        </div>
        <div class="people-grid">
          <div v-for="member in peopleMembers" :key="member.key" class="person-card">
            <ImageWithFallback
              :src="resolveStoryImage(member.imageKey)"
              :alt="$t(member.nameKey)"
              class-name="person-photo"
            />
            <div class="person-content">
              <MarkdownText :keypath="member.nameKey" tag="h3" inline class-name="person-name" />
              <MarkdownText :keypath="member.roleKey" tag="p" inline class-name="person-role" />
              <MarkdownText :keypath="member.textKey" class-name="person-text" />
            </div>
          </div>
        </div>
        <div class="partners-section">
          <div class="partners-header">
            <MarkdownText keypath="story.partners.title" tag="h3" inline />
            <MarkdownText keypath="story.partners.subtitle" class-name="partners-subtitle" />
          </div>
          <div class="partners-grid">
            <div class="partner-card">
              <ImageWithFallback
                :src="resolveStoryImage('story.partners.zwanenhof.image')"
                :alt="$t('story.partners.zwanenhof.name')"
                class-name="partner-logo"
              />
              <MarkdownText keypath="story.partners.zwanenhof.name" tag="p" inline class-name="partner-name" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Do -->
    <section class="what-we-do-section story-section">
      <div class="what-we-do-container">
        <div class="what-we-do-header">
          <MarkdownText keypath="story.whatWeDo.title" tag="h2" inline />
          <MarkdownText keypath="story.whatWeDo.subtitle" class-name="what-we-do-subtitle" />
        </div>
        <div class="what-we-do-grid">
          <div class="activity-card">
            <div class="activity-icon">
              <Users :size="24" />
            </div>
            <MarkdownText keypath="story.whatWeDo.connect.title" tag="h4" inline />
            <MarkdownText keypath="story.whatWeDo.connect.text" class-name="activity-text" />
          </div>
          <div class="activity-card">
            <div class="activity-icon">
              <Sprout :size="24" />
            </div>
            <MarkdownText keypath="story.whatWeDo.learn.title" tag="h4" inline />
            <MarkdownText keypath="story.whatWeDo.learn.text" class-name="activity-text" />
          </div>
          <div class="activity-card">
            <div class="activity-icon">
              <Heart :size="24" />
            </div>
            <MarkdownText keypath="story.whatWeDo.act.title" tag="h4" inline />
            <MarkdownText keypath="story.whatWeDo.act.text" class-name="activity-text" />
          </div>
        </div>
      </div>
    </section>

    <!-- Blue Zones -->
    <section id="blue-zones-worldwide" class="blue-zones-section story-section">
      <div class="blue-zones-container">
        <div class="blue-zones-header">
          <MarkdownText keypath="story.blueZones.title" tag="h2" inline />
          <MarkdownText keypath="story.blueZones.subtitle" class-name="blue-zones-subtitle" />
        </div>
        <div class="blue-zones-grid">
          <div class="info-card">
            <MarkdownText keypath="story.blueZones.worldwideTitle" tag="h3" inline />
            <MarkdownText keypath="story.blueZones.worldwideText" class-name="info-text" />
          </div>
          <div class="info-card">
            <MarkdownText keypath="story.blueZones.characteristicsTitle" tag="h3" inline />
            <MarkdownText keypath="story.blueZones.characteristicsText" class-name="info-text" />
          </div>
        </div>
      </div>
    </section>

    <!-- Finance -->
    <section id="finance" class="finance-section story-section">
      <div class="finance-container">
        <div class="finance-card">
          <MarkdownText keypath="story.finance.title" tag="h2" inline />
          <MarkdownText keypath="story.finance.text" class-name="finance-text" />
          <div class="finance-logos">
            <ImageWithFallback
              v-for="logo in financeLogos"
              :key="logo.srcKey"
              :src="resolveStoryImage(logo.srcKey)"
              :alt="$t(logo.altKey)"
              class-name="finance-logo-image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Join Us -->
    <section class="join-us-section" v-if="!isLoggedIn">
      <div class="join-us-container">
        <MarkdownText keypath="story.joinMovement.title" tag="h2" inline class-name="join-us-title" />
        <MarkdownText keypath="story.joinMovement.text" class-name="join-us-text" />
        <button @click="handleJoin" class="join-us-btn">
          <MarkdownText keypath="story.joinBtn" tag="span" inline />
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
import MarkdownText from '../components/MarkdownText.vue'
import { resolveImageUrl } from '@/utils/resolveImageUrl'

export default {
  name: 'StoryView',
  components: {
    ImageWithFallback,
    Heart,
    Users,
    Sprout,
    Target,
    Eye,
    Compass,
    MarkdownText
  },
  computed: {
    ...mapState(useAuthStore, ['isLoggedIn']),
    peopleMembers() {
      const keys = ['memberOne', 'memberTwo', 'memberThree', 'memberFour', 'memberFive', 'memberSix']
      return keys.map(key => ({
        key,
        nameKey: `story.people.${key}.name`,
        roleKey: `story.people.${key}.role`,
        textKey: `story.people.${key}.text`,
        imageKey: `story.people.${key}.image`
      }))
    },
    financeLogos() {
      return [
        {
          srcKey: 'story.finance.logos.provincieOverijssel.src',
          altKey: 'story.finance.logos.provincieOverijssel.alt'
        },
        {
          srcKey: 'story.finance.logos.twentseNoabers.src',
          altKey: 'story.finance.logos.twentseNoabers.alt'
        },
        {
          srcKey: 'story.finance.logos.twentseNoabersFonds.src',
          altKey: 'story.finance.logos.twentseNoabersFonds.alt'
        }
      ]
    }
  },
  methods: {
    handleJoin() {
      this.$router.push({ name: 'signup' })
    },
    resolveStoryImage(keypath) {
      return resolveImageUrl(this.$t(keypath))
    }
  }
}
</script>

<style scoped>
.story-page {
  min-height: 100vh;
}

.story-section {
  scroll-margin-top: 6rem;
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

/* Blue Zones Section */
.blue-zones-section {
  padding: 5rem 0;
  background: rgb(var(--color-background));
}

.blue-zones-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .blue-zones-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .blue-zones-container {
    padding: 0 2rem;
  }
}

.blue-zones-header {
  text-align: center;
  margin-bottom: 3rem;
}

.blue-zones-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.blue-zones-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.blue-zones-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

.info-card {
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.info-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.7;
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

/* People Section */
.people-section {
  padding: 5rem 0;
}

.people-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .people-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .people-container {
    padding: 0 2rem;
  }
}

.people-header {
  text-align: center;
  margin-bottom: 3rem;
}

.people-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.people-subtitle {
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.people-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

.person-card {
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

.person-photo {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  background: rgb(var(--color-background));
}

.person-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

@media (min-width: 768px) {
  .person-card {
    flex-direction: row;
    align-items: center;
  }

  .person-photo {
    width: 220px;
    height: 220px;
    flex-shrink: 0;
  }
}

.person-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.person-role {
  color: rgb(var(--color-primary));
  font-weight: 600;
  margin: 0;
}

.person-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
  margin: 0;
}

.partners-section {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.partners-header {
  text-align: center;
}

.partners-header h3 {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.partners-subtitle {
  margin-top: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.partners-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  align-items: center;
}

.partner-card {
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  text-align: center;
}

.partner-logo {
  width: 100%;
  max-width: 220px;
  height: 80px;
  object-fit: contain;
}

.partner-name {
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
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

/* Finance Section */
.finance-section {
  padding: 5rem 0;
  background: rgb(var(--color-background));
}

.finance-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .finance-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .finance-container {
    padding: 0 2rem;
  }
}

.finance-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
  padding: 2.5rem;
  text-align: center;
}

.finance-card h2 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 1rem;
}

.finance-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.7;
  max-width: 48rem;
  margin: 0 auto;
}

.finance-logos {
  margin-top: 2rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  align-items: center;
}

.finance-logo-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  padding: 0.75rem;
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
