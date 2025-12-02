<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast--${toast.type}`"
      >
        <div class="toast-icon">
          <CheckCircle v-if="toast.type === 'success'" :size="20" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" />
          <Info v-else :size="20" />
        </div>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="toastStore.remove(toast.id)">
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  padding: 1rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgb(var(--color-border));
  animation: slideIn 0.3s ease;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  color: rgb(var(--color-text));
  font-weight: 500;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

/* Variants */
.toast--success {
  border-left: 4px solid #10b981;
}
.toast--success .toast-icon { color: #10b981; }

.toast--error {
  border-left: 4px solid #ef4444;
}
.toast--error .toast-icon { color: #ef4444; }

.toast--warning {
  border-left: 4px solid #f59e0b;
}
.toast--warning .toast-icon { color: #f59e0b; }

.toast--info {
  border-left: 4px solid #3b82f6;
}
.toast--info .toast-icon { color: #3b82f6; }

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
