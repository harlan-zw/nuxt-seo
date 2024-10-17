<script setup lang="ts">
import key from '../.keys'
import { copiedKey } from './.keys'

const tweet = inject(key)

const tweetUrl = computed(() => (tweet?.value ? getTweetUrl(tweet.value) : ''))
const { copy, copied } = useClipboard({ source: tweetUrl })

provide(copiedKey, copied)
</script>

<template>
  <button v-if="tweet" @click="copy()">
    <slot :copied="copied">
      <LegoTweetActionCopyIcon />

      <span>
        {{ copied ? "Copied!" : "Copy link" }}
      </span>
    </slot>
  </button>
</template>
