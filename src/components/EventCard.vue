<template>
  <div class="event-card">
    <div class="event-card__image-wrapper">
      <ImageWithFallback
        :src="imageUrl"
        :alt="title"
        class-name="event-card__image"
      />
      <div class="event-card__category">{{ category }}</div>
    </div>
    <div class="event-card__content">
      <h3 class="event-card__title">{{ title }}</h3>
      <p class="event-card__description">{{ description }}</p>
      <div class="event-card__details">
        <div class="event-card__detail">
          <Calendar :size="16" />
          <span>{{ date }}</span>
        </div>
        <div class="event-card__detail">
          <Clock :size="16" />
          <span>{{ time }}</span>
        </div>
        <div class="event-card__detail">
          <MapPin :size="16" />
          <span>{{ location }}</span>
        </div>
        <div class="event-card__detail">
          <Users :size="16" />
          <span>{{ attendees }} {{ $t('components.eventCard.attending') }}</span>
        </div>
      </div>
      <div class="event-card__actions">
        <button class="event-card__button event-card__button--outline" @click.stop="handleViewDetails">
          {{ $t('components.eventCard.viewDetails') }}
        </button>
        <button
          class="event-card__button event-card__button--primary"
          :class="{
            'event-card__button--registered': status === 'registered',
            'event-card__button--interested': status === 'interested'
          }"
          @click.stop="handleRegister"
        >
          <Check v-if="status === 'registered'" :size="16" />
          <Star v-else-if="status === 'interested'" :size="16" />
          <span>{{ status === 'registered' ? $t('components.eventCard.registered') : status === 'interested' ? $t('components.eventCard.interested') : $t('components.eventCard.register') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Calendar, Clock, MapPin, Users, Check, Star } from 'lucide-vue-next'
import ImageWithFallback from './ImageWithFallback.vue'

export default {
  name: 'EventCard',
  components: {
    ImageWithFallback,
    Calendar,
    Clock,
    MapPin,
    Users,
    Check,
    Star
  },
  props: {
    title: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    attendees: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: null
    },
    onRegister: {
      type: Function,
      default: () => {}
    },
    onViewDetails: {
      type: Function,
      default: () => {}
    }
  },
  methods: {
    handleViewDetails() {
      this.onViewDetails()
    },
    handleRegister() {
      this.onRegister()
    }
  }
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.event-card__image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-card__image {
  transform: scale(1.05);
}

.event-card__category {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-primary));
}

.event-card__content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.event-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.event-card__description {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.event-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
}

.event-card__detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.event-card__detail svg {
  color: rgb(var(--color-primary));
}

.event-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.event-card__button {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.event-card__button--outline {
  border: 1px solid rgb(var(--color-border));
  background: transparent;
  color: rgb(var(--color-text));
}

.event-card__button--outline:hover {
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

.event-card__button--primary {
  border: 1px solid rgb(var(--color-primary));
  background: rgb(var(--color-primary));
  color: white;
}

.event-card__button--primary:hover {
  background: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-dark));
}

.event-card__button--registered {
  background: #16a34a; /* Solid green */
  border-color: #16a34a;
  color: white;
}

.event-card__button--registered:hover {
  background: #15803d; /* Darker green */
  border-color: #15803d;
}

.event-card__button--interested {
  background: #f59e0b; /* Solid amber */
  border-color: #f59e0b;
  color: white;
}

.event-card__button--interested:hover {
  background: #d97706; /* Darker amber */
  border-color: #d97706;
}
</style>
