<template>
  <component
    :is="tag"
    v-if="isMarkdown"
    :class="mergedClass"
    v-html="renderedHtml"
  />
  <component
    :is="tag"
    v-else
    :class="mergedClass"
    v-html="plainHtml"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOverrideFormat } from '@/i18n/overrides'
import { renderMarkdown, renderMarkdownInline, renderPlainTextWithLinks } from '@/utils/markdown'

const props = defineProps({
  keypath: { type: String, required: true },
  tag: { type: String, default: 'div' },
  inline: { type: Boolean, default: false },
  forceMarkdown: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const { t } = useI18n()
const text = computed(() => t(props.keypath))
const format = computed(() => (props.forceMarkdown ? 'markdown' : getOverrideFormat(props.keypath)))
const isMarkdown = computed(() => format.value === 'markdown')
const renderedHtml = computed(() =>
  props.inline ? renderMarkdownInline(text.value) : renderMarkdown(text.value)
)
const plainHtml = computed(() => renderPlainTextWithLinks(text.value))
const mergedClass = computed(() =>
  props.className ? `markdown-text ${props.className}` : 'markdown-text'
)
</script>
