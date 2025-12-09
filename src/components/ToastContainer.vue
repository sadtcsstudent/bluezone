<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast-item glass"
        :class="`toast--${toast.type}`"
      >
        <div class="toast-icon-wrapper">
          <CheckCircle v-if="toast.type === 'success'" :size="24" class="toast-icon" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="24" class="toast-icon" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="24" class="toast-icon" />
          <Info v-else :size="24" class="toast-icon" />
        </div>
        <div class="toast-content">
          <h4 class="toast-title">{{ getTitle(toast.type) }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="toastStore.remove(toast.id)">
          <X :size="18" />
        </button>
        <div class="toast-progress" :style="{ animationDuration: `${toast.duration || 3000}ms` }"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()

const getTitle = (type) => {
  switch (type) {
    case 'success': return 'Success'
    case 'error': return 'Error'
    case 'warning': return 'Warning'
    default: return 'Info'
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 10000;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  width: 380px;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.toast-icon-wrapper {
  padding: 0.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  padding-top: 0.125rem;
}

.toast-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 0.25rem 0;
  color: rgb(var(--color-text));
  line-height: 1.2;
}

.toast-message {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0.6;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

/* Progress Bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  width: 100%;
  animation: progress linear forwards;
  transform-origin: left;
}

@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Variants */
.toast--success .toast-icon-wrapper {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}
.toast--success .toast-progress { background: #059669; }

.toast--error .toast-icon-wrapper {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}
.toast--error .toast-progress { background: #dc2626; }

.toast--warning .toast-icon-wrapper {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}
.toast--warning .toast-progress { background: #d97706; }

.toast--info .toast-icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}
.toast--info .toast-progress { background: #2563eb; }

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: all 0.4s ease;
}

/* Dark mode support stub - purely class based if implemented */
:global(.dark) .toast-item {
  background: rgba(30, 30, 30, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
}
:global(.dark) .toast-title { color: #fff; }
:global(.dark) .toast-message { color: #aaa; }
</style>
