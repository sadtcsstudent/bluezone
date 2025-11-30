<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-info">
          <div class="profile-avatar">
            <User :size="48" />
          </div>
          <div class="profile-details">
            <h1>Anna van der Berg</h1>
            <p class="profile-meta">Member since November 2024</p>
            <p class="profile-location">Enschede, Twente</p>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn--outline-primary">
            <Edit :size="16" />
            <span>Edit Profile</span>
          </button>
          <button class="btn btn--icon">
            <Settings :size="20" />
          </button>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <!-- Quick Stats -->
          <div class="sidebar-card">
            <h3>Quick Stats</h3>
            <div class="stats-list">
              <div class="stat-item">
                <span class="stat-label">Events Attended</span>
                <span class="stat-value">12</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Groups Joined</span>
                <span class="stat-value">3</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Forum Posts</span>
                <span class="stat-value">28</span>
              </div>
            </div>
          </div>

          <!-- Interests -->
          <div class="sidebar-card">
            <div class="card-header">
              <h3>My Interests</h3>
              <button class="icon-btn">
                <Edit :size="16" />
              </button>
            </div>
            <div class="interests-list">
              <span
                v-for="interest in interests"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="sidebar-card">
            <button class="action-btn">
              <Settings :size="20" />
              <span>Account Settings</span>
            </button>
            <button @click="handleLogout" class="action-btn action-btn--danger">
              <LogOut :size="20" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="profile-main">
          <!-- Upcoming Events -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <Calendar :size="20" class="title-icon" />
                <h3>My Upcoming Events</h3>
              </div>
              <button @click="navigate('events')" class="link-btn">
                View All
              </button>
            </div>
            <div class="event-list">
              <div
                v-for="(event, index) in upcomingEvents"
                :key="index"
                class="event-item"
              >
                <div class="event-content">
                  <h4>{{ event.title }}</h4>
                  <p class="event-meta">{{ event.date }} • {{ event.time }}</p>
                </div>
                <span :class="['event-status', event.status === 'Registered' ? 'event-status--registered' : 'event-status--interested']">
                  {{ event.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- My Groups -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <MessageCircle :size="20" class="title-icon" />
                <h3>My Groups</h3>
              </div>
              <button @click="navigate('forum')" class="link-btn">
                Browse More
              </button>
            </div>
            <div class="group-list">
              <div
                v-for="(group, index) in myGroups"
                :key="index"
                class="group-item"
              >
                <div class="group-content">
                  <h4>{{ group.name }}</h4>
                  <p class="group-meta">{{ group.category }} • {{ group.members }} members</p>
                </div>
                <span class="group-role">{{ group.role }}</span>
              </div>
            </div>
          </div>

          <!-- Saved Initiatives -->
          <div class="content-card">
            <div class="content-card-header">
              <div class="content-card-title">
                <Heart :size="20" class="title-icon" />
                <h3>Saved Initiatives</h3>
              </div>
              <button @click="navigate('map')" class="link-btn">
                View Map
              </button>
            </div>
            <div class="initiative-grid">
              <div class="initiative-item">
                <h5>Enschede Community Garden</h5>
                <p class="initiative-location">Hengelosestraat 32, Enschede</p>
              </div>
              <div class="initiative-item">
                <h5>Weekly Farmers Market</h5>
                <p class="initiative-location">Oldenzaal Town Square</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Calendar, MessageCircle, Heart, Settings, LogOut, Edit } from 'lucide-vue-next'

export default {
  name: 'ProfileView',
  components: {
    User,
    Calendar,
    MessageCircle,
    Heart,
    Settings,
    LogOut,
    Edit
  },
  data() {
    return {
      upcomingEvents: [
        {
          title: 'Community Garden Workshop',
          date: 'December 7, 2025',
          time: '10:00 - 13:00',
          status: 'Registered',
        },
        {
          title: 'Healthy Cooking Class',
          date: 'December 10, 2025',
          time: '18:00 - 20:30',
          status: 'Interested',
        },
        {
          title: 'Nature Walk & Meditation',
          date: 'December 14, 2025',
          time: '09:00 - 11:00',
          status: 'Registered',
        },
      ],
      myGroups: [
        {
          name: 'Community Garden Members',
          category: 'Gardening',
          members: 24,
          role: 'Member',
        },
        {
          name: 'Walking Group Hengelo',
          category: 'Health',
          members: 18,
          role: 'Member',
        },
        {
          name: 'Healthy Cooking Enthusiasts',
          category: 'Food & Nutrition',
          members: 32,
          role: 'Moderator',
        },
      ],
      interests: [
        'Gardening',
        'Healthy Cooking',
        'Walking Groups',
        'Sustainability',
        'Local Food',
        'Community Events',
      ]
    }
  },
  methods: {
    navigate(page) {
      this.$router.push({ name: page })
    },
    handleLogout() {
      // Emit logout event to parent (App.vue)
      this.$emit('logout')
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 3rem 0;
}

.profile-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .profile-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .profile-container {
    padding: 0 2rem;
  }
}

/* Header */
.profile-header {
  background: linear-gradient(135deg,
    rgba(var(--color-primary), 0.1) 0%,
    rgba(var(--color-accent), 0.1) 100%
  );
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  background: linear-gradient(135deg,
    rgb(var(--color-primary)) 0%,
    rgb(var(--color-primary-dark)) 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-details h1 {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.profile-meta,
.profile-location {
  color: rgb(var(--color-text-secondary));
  margin: 0.25rem 0;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

/* Grid Layout */
.profile-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr 2fr;
  }
}

/* Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-primary));
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.icon-btn:hover {
  background: rgb(var(--color-background));
}

/* Stats */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  color: rgb(var(--color-text-secondary));
}

.stat-value {
  font-weight: 600;
  color: rgb(var(--color-text));
}

/* Interests */
.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  font-size: 0.875rem;
}

/* Action Buttons */
.action-btn {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgb(var(--color-text));
}

.action-btn:hover {
  background: rgb(var(--color-background));
}

.action-btn--danger {
  color: rgb(196, 113, 102);
}

.action-btn--danger:hover {
  background: rgba(196, 113, 102, 0.1);
}

/* Main Content */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
}

.content-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.content-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: rgb(var(--color-primary));
}

.content-card-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.link-btn {
  background: transparent;
  border: none;
  color: rgb(var(--color-primary));
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: rgb(var(--color-primary-dark));
}

/* Events */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: start;
  justify-content: space-between;
  transition: border-color 0.2s ease;
}

.event-item:hover {
  border-color: rgb(var(--color-primary));
}

.event-content {
  flex: 1;
}

.event-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.event-meta {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  white-space: nowrap;
}

.event-status--registered {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.event-status--interested {
  background: rgba(var(--color-accent), 0.2);
  color: rgb(var(--color-primary-dark));
}

/* Groups */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: start;
  justify-content: space-between;
  transition: border-color 0.2s ease;
}

.group-item:hover {
  border-color: rgb(var(--color-primary));
}

.group-content {
  flex: 1;
}

.group-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.group-meta {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

.group-role {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgb(var(--color-background));
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

/* Initiatives */
.initiative-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .initiative-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.initiative-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.initiative-item h5 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.initiative-location {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn--outline-primary {
  border: 1px solid rgb(var(--color-primary));
  color: rgb(var(--color-primary));
  background: transparent;
}

.btn--outline-primary:hover {
  background: rgb(var(--color-primary));
  color: white;
}

.btn--icon {
  padding: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  background: transparent;
  color: rgb(var(--color-text));
}

.btn--icon:hover {
  background: white;
}
</style>
