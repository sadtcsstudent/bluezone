<template>
  <div class="newsletter-page">
    <div class="newsletter-container">
      <!-- Header -->
      <div class="newsletter-header">
        <div class="newsletter-badge">
          <Mail :size="16" class="badge-icon" />
          <MarkdownText keypath="newsletterPage.badge" tag="span" inline class-name="badge-text" />
        </div>
        <MarkdownText keypath="newsletterPage.title" tag="h1" inline />
        <MarkdownText keypath="newsletterPage.subtitle" class-name="newsletter-subtitle" />
      </div>

      <!-- Subscribe Section -->
      <div class="subscribe-section">
        <div class="subscribe-content">
          <MarkdownText keypath="newsletterPage.subscribeTitle" tag="h2" inline class-name="subscribe-title" />
          <MarkdownText keypath="newsletterPage.subscribeDesc" class-name="subscribe-description" />

          <form v-if="!subscribed" @submit.prevent="handleSubscribe" class="subscribe-form">
            <input
              type="email"
              v-model="email"
              :placeholder="$t('newsletterPage.emailPlaceholder')"
              required
              class="subscribe-input"
            />
            <button type="submit" class="subscribe-button">
              <MarkdownText keypath="newsletterPage.subscribeButton" tag="span" inline />
              <ArrowRight :size="20" />
            </button>
          </form>

          <div v-else class="subscribed-message">
            <CheckCircle :size="24" />
            <MarkdownText keypath="newsletterPage.successMessage" tag="span" inline />
          </div>

          <div class="privacy-container">
            <div class="privacy-text">
              <MarkdownText keypath="newsletterPage.privacyText" tag="span" inline />
              <button v-if="subscribed" @click="handleUnsubscribe" class="unsubscribe-link">
                <MarkdownText keypath="newsletterPage.unsubscribe" tag="span" inline />
              </button>
              <span v-else>
                <MarkdownText keypath="newsletterPage.unsubscribeText" tag="span" inline />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- What You'll Receive -->
      <div class="benefits-section">
        <MarkdownText keypath="newsletterPage.benefits.title" tag="h2" inline class-name="benefits-title" />
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon benefit-icon--primary">
              <Calendar :size="24" />
            </div>
            <MarkdownText keypath="newsletterPage.benefits.highlightTitle" tag="h4" inline />
            <MarkdownText keypath="newsletterPage.benefits.highlightDesc" class-name="benefit-text" />
          </div>
          <div class="benefit-card">
            <div class="benefit-icon benefit-icon--secondary">
              <Mail :size="24" />
            </div>
            <MarkdownText keypath="newsletterPage.benefits.tipsTitle" tag="h4" inline />
            <MarkdownText keypath="newsletterPage.benefits.tipsDesc" class-name="benefit-text" />
          </div>
          <div class="benefit-card">
            <div class="benefit-icon benefit-icon--accent">
              <CheckCircle :size="24" />
            </div>
            <MarkdownText keypath="newsletterPage.benefits.storiesTitle" tag="h4" inline />
            <MarkdownText keypath="newsletterPage.benefits.storiesDesc" class-name="benefit-text" />
          </div>
        </div>
      </div>

      <!-- Past Newsletters -->
      <div v-if="latestNewsletter" class="latest-section">
        <MarkdownText keypath="newsletterPage.latestTitle" tag="h2" inline class-name="latest-title" />
        <div class="latest-card">
          <div class="latest-media">
            <ImageWithFallback
              :src="latestNewsletter.imageUrl"
              :alt="latestNewsletter.title"
              class-name="latest-image"
            />
          </div>
          <div class="latest-content">
            <h3>{{ latestNewsletter.title }}</h3>
            <div class="newsletter-date">
              <Calendar :size="16" />
              <span>{{ latestNewsletter.date }}</span>
            </div>
            <p class="latest-description">
              {{ latestNewsletter.description }}
            </p>
            <div class="newsletter-topics">
              <span
                v-for="(topic, topicIndex) in latestNewsletter.topics"
                :key="topicIndex"
                class="topic-tag"
              >
                {{ topic }}
              </span>
            </div>
            <button class="download-button" @click="openNewsletter(latestNewsletter)">
              <Eye :size="20" />
              <span>{{ $t('newsletterPage.download') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="olderNewsletters.length" class="archive-section">
        <MarkdownText keypath="newsletterPage.archiveTitle" tag="h2" inline class-name="archive-title" />
        <div class="archive-list">
          <div
            v-for="(newsletter, index) in olderNewsletters"
            :key="index"
            class="newsletter-item"
          >
            <div class="newsletter-content">
              <div class="newsletter-media">
                <ImageWithFallback
                  :src="newsletter.imageUrl"
                  :alt="newsletter.title"
                  class-name="newsletter-image"
                />
              </div>
              <div class="newsletter-info">
                <h3>{{ newsletter.title }}</h3>
                <div class="newsletter-date">
                  <Calendar :size="16" />
                  <span>{{ newsletter.date }}</span>
                </div>
                <p class="newsletter-description">
                  {{ newsletter.description }}
                </p>
                <div class="newsletter-topics">
                  <span
                    v-for="(topic, topicIndex) in newsletter.topics"
                    :key="topicIndex"
                    class="topic-tag"
                  >
                    {{ topic }}
                  </span>
                </div>
              </div>
              <button class="download-button" @click="openNewsletter(newsletter)">
                <Eye :size="20" />
                <span>{{ $t('newsletterPage.download') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Newsletter Modal -->
    <div v-if="activeNewsletter" class="newsletter-modal" @click.self="closeNewsletter">
      <div class="newsletter-modal__content">
        <button class="newsletter-modal__close" @click="closeNewsletter">
          <X :size="20" />
        </button>
        <div class="newsletter-modal__header">
          <h3>{{ activeNewsletter.title }}</h3>
          <div class="newsletter-date">
            <Calendar :size="16" />
            <span>{{ activeNewsletter.date }}</span>
          </div>
        </div>
        <div class="newsletter-modal__media">
          <ImageWithFallback
            :src="activeNewsletter.imageUrl"
            :alt="activeNewsletter.title"
            class-name="newsletter-modal__image"
          />
        </div>
        <div v-if="activeNewsletter.fileUrl" class="newsletter-modal__frame">
          <iframe :src="activeNewsletter.fileUrl" title="Newsletter preview"></iframe>
        </div>
        <p v-else class="newsletter-modal__text">
          {{ activeNewsletter.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Mail, Calendar, ArrowRight, CheckCircle, Eye, X } from 'lucide-vue-next'
import api from '@/services/api'
import MarkdownText from '../components/MarkdownText.vue'
import ImageWithFallback from '../components/ImageWithFallback.vue'
import { resolveImageUrl } from '@/utils/resolveImageUrl'

export default {
  name: 'NewsletterView',
  components: {
    Mail,
    Calendar,
    ArrowRight,
    CheckCircle,
    Eye,
    X,
    MarkdownText,
    ImageWithFallback
  },
  data() {
    return {
      email: '',
      subscribed: false,
      pastNewsletters: [],
      activeNewsletter: null
    }
  },
  computed: {
    latestNewsletter() {
      return this.pastNewsletters[0] || null
    },
    olderNewsletters() {
      return this.pastNewsletters.slice(1)
    }
  },
  async created() {
    const data = await api.get('/newsletter/past')
    this.pastNewsletters = data.newsletters?.map((n) => ({
      ...n,
      date: new Date(n.publishedAt).toLocaleDateString(),
      imageUrl: resolveImageUrl(n.imageUrl || ''),
      fileUrl: resolveImageUrl(n.fileUrl || '')
    })) || []
  },
  methods: {
    async handleSubscribe() {
      try {
        await api.post('/newsletter/subscribe', { email: this.email })
        this.subscribed = true
        // Keep subscribed state true for UI feedback
      } catch (err) {
        console.error('Subscribe failed', err)
      }
    },
    async handleUnsubscribe() {
      if (!confirm('Are you sure you want to unsubscribe?')) return
      try {
        await api.post('/newsletter/unsubscribe', { email: this.email })
        this.subscribed = false
        this.email = ''
        alert('You have been unsubscribed.')
      } catch (err) {
        console.error('Unsubscribe failed', err)
      }
    },
    openNewsletter(newsletter) {
      this.activeNewsletter = newsletter
    },
    closeNewsletter() {
      this.activeNewsletter = null
    }
  }
}
</script>

<style scoped>
.newsletter-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.newsletter-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .newsletter-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .newsletter-container {
    padding: 0 2rem;
  }
}

/* Header */
.newsletter-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.newsletter-badge {
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

.badge-icon {
  color: rgb(var(--color-primary));
}

.badge-text {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.newsletter-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
}

.newsletter-subtitle {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
  max-width: 42rem;
  margin: 0 auto;
}

/* Subscribe Section */
.subscribe-section {
  background: linear-gradient(135deg,
    rgb(var(--color-primary)) 0%,
    rgb(var(--color-primary-dark)) 100%
  );
  color: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  .subscribe-section {
    padding: 3rem;
  }
}

.subscribe-content {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subscribe-title {
  font-size: 2rem;
  font-weight: 600;
  color: white;
}

.subscribe-description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.subscribe-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .subscribe-form {
    flex-direction: row;
  }
}

.subscribe-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 9999px;
  border: 2px solid white;
  font-size: 1rem;
  color: white;
  background: transparent;
}

.subscribe-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.subscribe-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.subscribe-button {
  padding: 1rem 2rem;
  border-radius: 9999px;
  background: white;
  color: rgb(var(--color-primary));
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.subscribe-button:hover {
  background: rgba(255, 255, 255, 0.9);
}

.subscribed-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  margin-top: 2rem;
}

.privacy-container {
  margin-top: 1rem;
}

.privacy-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.unsubscribe-link {
  background: none;
  border: none;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.unsubscribe-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* Benefits Section */
.benefits-section {
  margin-bottom: 4rem;
}

.benefits-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.benefit-card {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benefit-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-icon--primary {
  background: rgba(var(--color-primary), 0.2);
  color: rgb(var(--color-primary));
}

.benefit-icon--secondary {
  background: rgba(var(--color-secondary), 0.2);
  color: rgb(var(--color-secondary));
}

.benefit-icon--accent {
  background: rgba(var(--color-accent), 0.3);
  color: rgb(var(--color-primary-dark));
}

.benefit-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.benefit-text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
}

/* Latest News */
.latest-section {
  margin-bottom: 4rem;
}

.latest-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 2rem;
}

.latest-card {
  display: grid;
  gap: 2rem;
  padding: 2.5rem;
  border-radius: 1.25rem;
  background: white;
  border: 1px solid rgb(var(--color-border));
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

@media (min-width: 768px) {
  .latest-card {
    grid-template-columns: 1fr 1.4fr;
    align-items: center;
  }
}

.latest-media {
  border-radius: 1rem;
  overflow: hidden;
  height: 100%;
  min-height: 220px;
}

.latest-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.latest-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.latest-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin: 0;
}

.latest-description {
  color: rgb(var(--color-text-secondary));
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0;
}

/* Archive Section */
.archive-section {
  margin-bottom: 4rem;
}

.archive-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 2rem;
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.newsletter-item {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.newsletter-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.newsletter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .newsletter-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.newsletter-media {
  width: 100%;
  max-width: 220px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
  flex-shrink: 0;
}

.newsletter-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.newsletter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.newsletter-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.newsletter-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.newsletter-description {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
}

.newsletter-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.download-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  width: fit-content;
}

.download-button:hover {
  background: rgb(var(--color-primary));
  color: white;
}

.newsletter-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 9999;
}

.newsletter-modal__content {
  background: white;
  border-radius: 1rem;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.newsletter-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: rgb(var(--color-background));
  border-radius: 9999px;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.newsletter-modal__close:hover {
  background: rgb(var(--color-border));
}

.newsletter-modal__header h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: rgb(var(--color-text));
}

.newsletter-modal__media {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
}

.newsletter-modal__image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.newsletter-modal__frame iframe {
  width: 100%;
  height: 60vh;
  border: none;
}

.newsletter-modal__text {
  color: rgb(var(--color-text-secondary));
  line-height: 1.6;
  margin: 0;
}
</style>
