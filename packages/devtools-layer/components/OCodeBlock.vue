<script setup lang="ts">
import { loadShiki, useRenderCodeHighlight } from '../composables/shiki'

const { code, lang, lines = false, transformRendered } = defineProps<{
  code: string
  lang: 'json' | 'xml' | 'js'
  lines?: boolean
  transformRendered?: (code: string) => string
}>()

// pages aren't required to call loadShiki() themselves — blocks render plain
// until the highlighter resolves, then re-render highlighted
loadShiki()

const rendered = computed(() => {
  const highlight = useRenderCodeHighlight(code, lang)
  return transformRendered ? transformRendered(highlight.value || '') : highlight.value
})
</script>

<template>
  <pre
    class="code-block p-5"
    :class="lines ? 'code-block-lines' : ''"
    v-html="rendered"
  />
</template>
