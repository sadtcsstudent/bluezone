<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="confirm-overlay" @click.self="handleCancel">
        <div class="confirm-modal">
          <div class="confirm-icon" :class="`confirm-icon--${type}`">
            <AlertCircle v-if="type === 'warning'" :size="28" />
            <Info v-else-if="type === 'info'" :size="28" />
            <CheckCircle v-else-if="type === 'success'" :size="28" />
            <XCircle v-else-if="type === 'error'" :size="28" />
            <HelpCircle v-else :size="28" />
          </div>

          <div class="confirm-content">
            <h3 class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>

          <div class="confirm-actions">
            <button
              v-if="showCancel"
              type="button"
              class="btn btn--ghost"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              :class="confirmButtonClass"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { AlertCircle, Info, CheckCircle, XCircle, HelpCircle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirm'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'question',
    validator: (value) => ['question', 'warning', 'info', 'success', 'error'].includes(value)
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'warning':
    case 'error':
      return 'btn--danger'
    case 'success':
      return 'btn--success'
    default:
      return 'btn--primary'
  }
})

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.confirm-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.confirm-icon--question {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.confirm-icon--warning {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.confirm-icon--info {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.confirm-icon--success {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.confirm-icon--error {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.confirm-content {
  text-align: center;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 0.5rem;
}

.confirm-message {
  font-size: 0.9375rem;
  color: rgb(var(--color-text-secondary));
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.confirm-actions .btn {
  flex: 1;
}

.btn--danger {
  background: rgb(239, 68, 68);
  color: white;
}

.btn--danger:hover {
  background: rgb(220, 38, 38);
}

.btn--success {
  background: rgb(34, 197, 94);
  color: white;
}

.btn--success:hover {
  background: rgb(22, 163, 74);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .confirm-modal,
.modal-leave-active .confirm-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-modal,
.modal-leave-to .confirm-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
