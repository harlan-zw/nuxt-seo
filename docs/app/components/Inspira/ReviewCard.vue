<script lang="ts" setup>
defineProps({
  img: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  body: { type: String, required: true },
})
</script>

<template>
  <figure
    class="relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 border-neutral-950/[.1] bg-neutral-950/[.01] hover:bg-neutral-950/[.05] dark:border-neutral-50/[.1] dark:bg-neutral-50/[.10] dark:hover:bg-neutral-50/[.15]"
  >
    <div class="flex flex-row items-center gap-2">
      <NuxtImg :src="img" class="rounded-full" width="32" height="32" alt="" loading="lazy" />
      <div class="flex flex-col">
        <span class="text-sm font-medium dark:text-white">
          {{ name }}
        </span>
        <p class="text-xs font-medium dark:text-white/40">
          {{ username }}
        </p>
      </div>
    </div>
    <blockquote class="mt-2 text-sm">
      {{ body }}
    </blockquote>
  </figure>
</template>
