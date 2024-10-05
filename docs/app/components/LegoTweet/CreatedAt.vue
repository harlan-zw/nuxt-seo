<script setup lang="ts">
import key from './.keys'
import { getTweetUrl } from './utils'

const tweet = inject(key)
const createdAt = computed(() =>
  tweet?.value.created_at ? new Date(tweet.value.created_at) : undefined,
)
const formatted = useDateFormat(createdAt, 'h:mm a · MMM D, YYYY')
</script>

<template>
  <a
    v-if="tweet?.created_at"
    :href="getTweetUrl(tweet)"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="formatted"
  >
    <slot :created_at="createdAt">
      <time :dateTime="createdAt?.toISOString()">
        {{ formatted }}
      </time>
    </slot>
  </a>
</template>
