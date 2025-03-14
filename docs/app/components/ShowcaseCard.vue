<script lang="ts" setup>
import type { NuxtSEOModule } from '../../../src/const'

defineProps<Partial<NuxtSEOModule>>()
</script>

<template>
  <div class="showcase-card relative h-full">
    <div class="h-full">
      <div class="group relative border hover:border-blue-400 transition rounded-xl overflow-hidden h-full">
        <div
          class="h-48 relative flex items-center justify-center bg-no-repeat bg-cover border-b-2 border-neutral-100/30 dark:border-neutral-900/10"
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

        <div class="p-4">
          <h3 class="font-semibold">
            {{ label }}
          </h3>
          <p class="text-sm mt-1 text-neutral-400">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
