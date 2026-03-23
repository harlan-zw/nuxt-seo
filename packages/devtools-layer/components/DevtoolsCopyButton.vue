<script setup lang="ts">
import { useCopy } from '../composables/clipboard'

const { text } = defineProps<{
  text: string
}>()

const { copy, copied } = useCopy()
</script>

<template>
  <UTooltip :text="copied ? 'Copied!' : 'Copy'">
    <UButton
      :icon="copied ? 'carbon:checkmark' : 'carbon:copy'"
      :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
      :class="copied ? 'text-[var(--seo-green)]' : ''"
      @click="copy(text)"
    />
  </UTooltip>
</template>
