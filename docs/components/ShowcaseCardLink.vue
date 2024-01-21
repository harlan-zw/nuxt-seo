<script lang="ts" setup>
import type { NuxtSeoModule } from '~/utils/data'

defineProps<NuxtSeoModule>()
</script>

<template>
  <div class="showcase-card relative h-full">
    <div class="h-full">
      <div class="group relative border hover:border-blue-400 transition rounded-xl overflow-hidden h-full">
        <div
          class="h-48 relative flex items-center justify-center bg-no-repeat bg-cover border-b-2 border-gray-100/30 dark:border-gray-900/10"
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

          <div v-if="repo" class="flex text-gray-500 items-center justify-between mt-5">
            <NuxtLink :to="`https://github.com/${repo}`" title="GitHub" class="hover:opacity-70 transition text-sm">
              {{ repo }}
            </NuxtLink>
            <div v-if="stars" class="items-center inline-flex justify-center px-1 ">
              <Icon name="uil:star" class="text-sm text-blue-300 group-hover:op75" />
              <div class="px-1 text-sm">
                {{ stars }}
              </div>
            </div>
          </div>

          <NuxtLink v-if="tag" :to="tag.to" class="flex items-center space-x-2 group z-20 absolute top-4 right-4">
            <div class="text-gray-600 dark:text-gray-400 text-xs font-light font-mono">
              {{ tag.label }}
            </div>
            <UBadge v-if="tag.new" size="sm" color="purple" class="hover:shadow transition" variant="outline">
              New
            </UBadge>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
