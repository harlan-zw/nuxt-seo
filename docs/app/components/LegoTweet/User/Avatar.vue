<script setup lang="ts">
import key from '../.keys'

const tweet = inject(key)
const user = computed(() => tweet?.value?.user)
</script>

<template>
  <div v-if="user">
    <img
      :style="{
        'border-radius':
          user.profile_image_shape === 'Square' ? '5px' : '99999px',
      }"
      :src="user.profile_image_url_https"
      :alt="user.name"
    >
  </div>
</template>
