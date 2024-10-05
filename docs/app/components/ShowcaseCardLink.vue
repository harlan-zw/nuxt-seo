<script lang="ts" setup>
import type { NuxtSEOModule } from '../../../src/const'

defineProps<Partial<NuxtSEOModule>>()
</script>

<template>
  <div class="relative h-full">
    <div class="h-full">
      <div class="group relative border dark:border-gray-500/30 hover:border-blue-400 transition rounded-xl overflow-hidden h-full">
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

        <div class="p-4">
          <NuxtLink
            class="group"
            :to="to"
            :title="label"
          >
            <h3 class="font-semibold group-hover:underline">
              <div>{{ label }}</div>
            </h3>
            <p class="text-sm mt-1 text-gray-400">
              {{ description }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
