<script setup lang="ts">
import { computed } from 'vue'
import { useRenderCodeHighlight } from '../composables/shiki'

const props = withDefaults(
  defineProps<{
    code: string
    lang: 'json' | 'xml' | 'js'
    lines?: boolean
    transformRendered?: (code: string) => string
  }>(),
  {
    lines: false,
  },
)
const rendered = computed(() => {
  const code = useRenderCodeHighlight(props.code, props.lang)
  return props.transformRendered ? props.transformRendered(code.value || '') : code.value
})
</script>

<template>
  <pre
    class="code-block p-5"
    :class="lines ? 'code-block-lines' : ''"
    v-html="rendered"
  />
</template>
