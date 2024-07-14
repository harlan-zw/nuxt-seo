<script lang="ts" setup>
defineProps<{ username: string, image: string, message: string }>()
</script>

<template>
  <div class="tweet max-w-[550px] mx-auto my-15 dark:bg-black bg-white p-4 rounded-xl border not-prose dark:border-gray-700 px-5 py-5 text-black dark:text-white relative">
    <UIcon name="i-logos-discord-icon" class="opacity-60 absolute top-3 right-4 w-6 h-6" />
    <div class="flex gap-3">
      <div><UAvatar class="mt-1" :src="image" :alt="`Discord user ${$username}`" /></div>
      <div class="opacity-90">
        <div class="font-semibold">
          {{ username }}
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
