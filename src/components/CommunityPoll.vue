<template>
  <section class="pulse-card">
    <div class="pulse-header">
      <div class="pulse-eyebrow">
        <Activity :size="16" />
        <span>{{ t('components.poll.title') }}</span>
      </div>
      <button
        v-if="polls.length > 1"
        class="ghost-btn"
        type="button"
        @click="nextPoll"
      >
        {{ t('components.poll.nextPoll') }}
        <ArrowRight :size="16" />
      </button>
    </div>

    <div v-if="loading" class="pulse-loading">
      <div class="shimmer title"></div>
      <div class="shimmer bar"></div>
      <div class="shimmer bar"></div>
      <div class="shimmer bar"></div>
    </div>

    <div v-else-if="currentPoll" class="poll-body">
      <h3 class="poll-question">{{ currentPoll.question }}</h3>
      <div v-if="currentPoll.allowMultiple || currentPoll.allowChangeVote" class="poll-badges">
        <span v-if="currentPoll.allowMultiple" class="badge">Multi-select</span>
        <span v-if="currentPoll.allowChangeVote && !currentPoll.allowMultiple" class="badge">Changeable</span>
      </div>
      <div class="poll-options">
        <button
          v-for="option in currentPoll.options"
          :key="option.id"
          class="poll-option"
          :class="{ selected: isSelected(option.id) }"
          type="button"
          :disabled="isDisabled(option.id)"
          @click="handleVote(option.id)"
        >
          <div class="option-row">
            <span>{{ option.text }}</span>
            <span class="option-percent">{{ option.percentage }}%</span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              :style="{ width: `${option.percentage}%` }"
            ></div>
          </div>
        </button>
      </div>

      <div class="poll-footer">
        <span class="vote-count">
          {{ currentPoll.totalVotes }} {{ t('components.poll.votes', { count: currentPoll.totalVotes }) }}
        </span>
        <button
          v-if="!isLoggedIn"
          class="link-btn"
          type="button"
          @click="goToLogin"
        >
          {{ t('components.poll.signInToVote') }}
        </button>
      </div>
    </div>

    <div v-else class="poll-empty">
      <p>{{ t('components.poll.noPolls') }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Activity, ArrowRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const polls = ref([])
const loading = ref(false)
const voting = ref(null)
const currentIndex = ref(0)

const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentPoll = computed(() => polls.value[currentIndex.value] || null)

const fetchPolls = async () => {
  loading.value = true
  try {
    const data = await api.get('/polls')
    polls.value = data.polls || []
    currentIndex.value = 0
  } catch (err) {
    console.error('Failed to load polls', err)
    toast.error('Could not load polls')
  } finally {
    loading.value = false
  }
}

const isSelected = (optionId) => {
  return currentPoll.value?.userVotedOptionIds?.includes(optionId) || currentPoll.value?.userVotedOptionId === optionId
}

const isDisabled = (optionId) => {
  if (voting.value === optionId) return true
  if (!isLoggedIn.value) return false // Allow click to prompt login
  
  const poll = currentPoll.value
  const hasVoted = poll.userVotedOptionIds?.length > 0 || !!poll.userVotedOptionId

  if (poll.allowMultiple) return false // Can always toggle in multi-select
  
  if (hasVoted) {
    if (!poll.allowChangeVote) return true // Locked
    if (isSelected(optionId)) return true // Already selected this one
  }
  
  return false
}

const handleVote = async (optionId) => {
  if (!currentPoll.value) return
  if (!isLoggedIn.value) {
    goToLogin()
    return
  }

  // Pre-check for single choice locked votes (double check)
  if (!currentPoll.value.allowMultiple && 
      !currentPoll.value.allowChangeVote && 
      (currentPoll.value.userVotedOptionIds?.length > 0 || currentPoll.value.userVotedOptionId)) {
    toast.info('You already voted on this poll')
    return
  }

  try {
    voting.value = optionId
    const response = await api.post('/polls/vote', {
      pollId: currentPoll.value.id,
      optionId
    })

    if (response?.poll) {
      polls.value.splice(currentIndex.value, 1, response.poll)
      if (currentPoll.value.allowMultiple) {
         // No toast for toggles usually, or maybe a subtle one
      } else {
         toast.success('Vote recorded')
      }
    } else {
      await fetchPolls()
    }
  } catch (err) {
    console.error('Vote failed', err)
    toast.error(err?.response?.data?.message || err.message || 'Could not submit vote')
  } finally {
    voting.value = null
  }
}

const nextPoll = () => {
  if (!polls.value.length) return
  currentIndex.value = (currentIndex.value + 1) % polls.value.length
}

const goToLogin = () => {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

onMounted(fetchPolls)
</script>

<style scoped>
.pulse-card {
  background: linear-gradient(135deg, rgba(var(--color-primary), 0.08), white 60%);
  border: 1px solid rgb(var(--color-border));
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.pulse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.pulse-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  color: rgb(var(--color-text));
  font-weight: 600;
}

.poll-body {
  display: grid;
  gap: 1rem;
}

.poll-question {
  font-size: 1.25rem;
  color: rgb(var(--color-text));
  margin: 0;
}

.poll-options {
  display: grid;
  gap: 0.75rem;
}

.poll-option {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.poll-option:hover:not(:disabled) {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 8px 20px rgba(var(--color-primary), 0.12);
}

.poll-option.selected {
  border-color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.06);
}

.option-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.option-percent {
  color: rgb(var(--color-text-secondary));
}

.progress {
  background: rgba(var(--color-primary), 0.08);
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 0.5rem;
  height: 8px;
}

.progress-bar {
  background: linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-primary-dark)));
  height: 100%;
  transition: width 0.3s ease;
}

.poll-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgb(var(--color-text-secondary));
  font-size: 0.9rem;
}

.vote-count {
  font-weight: 600;
}

.link-btn {
  background: none;
  border: none;
  color: rgb(var(--color-primary));
  font-weight: 600;
  cursor: pointer;
}

.pulse-loading .shimmer {
  background: linear-gradient(90deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.pulse-loading .title {
  height: 22px;
  width: 60%;
}

.pulse-loading .bar {
  height: 16px;
}

.poll-empty {
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.poll-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}
</style>
