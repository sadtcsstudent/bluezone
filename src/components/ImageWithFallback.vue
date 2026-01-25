<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :class="className"
    @error="handleError"
  />
</template>

<script>
const getInitialSrc = (src, fallbackSrc) => {
  if (typeof src !== 'string' || src.trim() === '') {
    return fallbackSrc
  }
  return src
}

export default {
  name: 'ImageWithFallback',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    fallbackSrc: {
      type: String,
      default: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80'
    }
  },
  data() {
    return {
      currentSrc: getInitialSrc(this.src, this.fallbackSrc),
      hasError: false
    }
  },
  watch: {
    src(newSrc) {
      this.currentSrc = getInitialSrc(newSrc, this.fallbackSrc)
      this.hasError = false
    }
  },
  methods: {
    handleError() {
      if (!this.hasError) {
        this.hasError = true
        this.currentSrc = this.fallbackSrc
      }
    }
  }
}
</script>
