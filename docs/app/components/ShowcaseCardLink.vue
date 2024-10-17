<script lang="ts" setup>
import type { NuxtSEOModule } from '../../../src/const'

defineProps<Partial<NuxtSEOModule>>()
</script>

<template>
  <div class="relative h-full">
    <div class="h-full">
      <div class="group relative border-transparent dark:border-gray-500/30 hover:border-blue-400 transition h-full">
        <div
          class="h-32 relative flex items-center justify-center bg-no-repeat bg-cover border-b-2 border-gray-100/30 dark:border-gray-900/10"
          style="background-image: url('/grid.png')"
        >
          <div
            class="blur-overlay w-full h-full absolute pointer-events-none"
          />
          <div class="z-10 text-blue-200 group-hover:scale-110 w-full h-full flex items-center justify-center group-hover:text-blue-500 transition-all relative">
            <slot />
          </div>
          <slot name="teleport" />
        </div>

        <div class="">
          <NuxtLink
            class="group"
            :to="`/docs/${slug}/getting-started/installation`"
            :title="label"
          >
            <p class="font-semibold group-hover:underline">
              {{ label }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
