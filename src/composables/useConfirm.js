import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const confirmText = ref('Confirm')
const cancelText = ref('Cancel')
const type = ref('question')
const showCancel = ref(true)
let resolvePromise = null

export function useConfirm() {
  const confirm = (options) => {
    return new Promise((resolve) => {
      title.value = options.title || 'Confirm'
      message.value = options.message || ''
      confirmText.value = options.confirmText || 'Confirm'
      cancelText.value = options.cancelText || 'Cancel'
      type.value = options.type || 'question'
      showCancel.value = options.showCancel !== false
      isOpen.value = true
      resolvePromise = resolve
    })
  }

  const alert = (options) => {
    return confirm({
      ...options,
      showCancel: false,
      confirmText: options.confirmText || 'OK',
      type: options.type || 'info'
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    if (resolvePromise) resolvePromise(true)
  }

  const handleCancel = () => {
    isOpen.value = false
    if (resolvePromise) resolvePromise(false)
  }

  const handleClose = () => {
    isOpen.value = false
    if (resolvePromise) resolvePromise(false)
  }

  return {
    // State
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    type,
    showCancel,

    // Methods
    confirm,
    alert,
    handleConfirm,
    handleCancel,
    handleClose
  }
}
