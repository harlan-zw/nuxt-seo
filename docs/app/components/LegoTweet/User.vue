<script setup lang="ts">
import key from './.keys'

const tweet = inject(key)
const user = computed(() => tweet?.value?.user)
</script>

<template>
  <div v-if="user">
    <slot :user="user">
      <LegoTweetUserAvatar />
      <p>{{ user.name }}</p>
      <p>@{{ user.screen_name }}</p>
    </slot>
  </div>
</template>
