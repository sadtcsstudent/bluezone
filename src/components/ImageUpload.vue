<template>
  <div class="image-upload">
    <div
      class="upload-area"
      :class="{ 'has-image': previewUrl || currentImage, 'dragging': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <img
        v-if="previewUrl || currentImage"
        :src="previewUrl || currentImage"
        alt="Preview"
        class="preview-image"
      />
      <div v-else class="placeholder">
        <UploadCloud :size="32" class="upload-icon" />
        <p>{{ $t('components.imageUpload.clickToUpload') }}</p>
        <span class="sub-text">{{ $t('components.imageUpload.maxSize') }}</span>
      </div>
      
      <div v-if="previewUrl || currentImage" class="overlay">
        <Camera :size="24" />
        <span>{{ $t('components.imageUpload.changeImage') }}</span>
      </div>
    </div>
    
    <input
      type="file"
      ref="fileInput"
      class="hidden-input"
      accept="image/jpeg,image/png,image/webp"
      @change="handleFileChange"
    />
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UploadCloud, Camera } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentImage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:image', 'error'])

const fileInput = ref(null)
const previewUrl = ref('')
const isDragging = ref(false)
const error = ref('')

const triggerFileInput = () => {
  fileInput.value.click()
}

const validateFile = (file) => {
  if (!file) return false
  
  if (!file.type.startsWith('image/')) {
    error.value = t('components.imageUpload.errors.fileType')
    emit('error', error.value)
    return false
  }
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = t('components.imageUpload.errors.fileSize')
    emit('error', error.value)
    return false
  }
  
  error.value = ''
  return true
}

const processFile = (file) => {
  if (validateFile(file)) {
    previewUrl.value = URL.createObjectURL(file)
    emit('update:image', file)
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  processFile(file)
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  processFile(file)
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed rgb(var(--color-border));
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgb(var(--color-background));
}

.upload-area:hover, .upload-area.dragging {
  border-color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.05);
}

.upload-area.has-image {
  border-style: solid;
  padding: 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  text-align: center;
}

.upload-icon {
  color: rgb(var(--color-primary));
}

.sub-text {
  font-size: 0.75rem;
  opacity: 0.7;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  gap: 0.5rem;
}

.upload-area:hover .overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}
</style>
