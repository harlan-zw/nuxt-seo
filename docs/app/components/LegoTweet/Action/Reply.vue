<script setup lang="ts">
import key from '../.keys'
import { getReplyUrl } from '../utils'

const tweet = inject(key)
</script>

<template>
  <a
    v-if="tweet"
    :href="getReplyUrl(tweet)"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Reply to this Tweet on Twitter"
  >
    <slot>
      <LegoTweetActionReplyIcon />
      <span>Reply</span>
    </slot>
  </a>
</template>
