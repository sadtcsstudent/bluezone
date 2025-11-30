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
          <span>{{ attendees }} attending</span>
        </div>
      </div>
      <button class="event-card__button" @click="handleViewDetails">
        View Details
        <ArrowRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script>
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-vue-next'
import ImageWithFallback from './ImageWithFallback.vue'

export default {
  name: 'EventCard',
  components: {
    ImageWithFallback,
    Calendar,
    Clock,
    MapPin,
    Users,
    ArrowRight
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
    onViewDetails: {
      type: Function,
      default: () => {}
    }
  },
  methods: {
    handleViewDetails() {
      this.onViewDetails()
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

.event-card__button {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  border: 2px solid rgb(var(--color-primary));
  background: transparent;
  color: rgb(var(--color-primary));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.event-card__button:hover {
  background: rgb(var(--color-primary));
  color: white;
}
</style>
