<script lang="ts" setup>
import type { modules } from '../../../src/const'

const { module, size = 'md' } = defineProps<{
  module?: typeof modules[number] & { scheduled: string }
  size?: 'sm' | 'md' | 'lg'
}>()

const textAttrs = computed(() => {
  switch (size) {
    case 'sm': return { class: 'text-sm' }
    case 'md': return { class: 'text-base' }
    case 'lg': return { class: 'text-lg' }
    default: return {}
  }
})

const iconAttrs = computed(() => {
  switch (size) {
    case 'sm': return { class: 'w-4 h-4' }
    case 'md': return { class: 'w-6 h-6' }
    case 'lg': return { class: 'w-5 h-5' }
    default: return {}
  }
})

const route = useRoute()
const as = computed(() => route.path.startsWith('/pro') ? 'div' : 'NuxtLink')
</script>

<template>
  <component :is="as" to="/pro" class="group hover:shadow-[0_0_15px_5px_rgba(20,255,209,0.05)] transition-all relative min-w-[250px] inline-flex transition-all flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-3 py-2 gap-1">
    <div class="z-1 flex flex-col justify-between h-full">
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="flex flex-col gap-1" v-bind="textAttrs">
            <div class="flex items-center gap-2">
              <UIcon v-if="module.icon" dynamic :name="module.icon" class="text-blue-500 dark:text-blue-300" v-bind="iconAttrs" />{{ module.label }}
            </div>
            <div class="text-balance text-xs text-gray-500 dark:text-gray-400 font-normal">
              {{ module.description }}
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div>
              <div class="whitespace-nowrap justify-end dark:bg-purple-700/20 dark:text-purple-500 text-xs px-1 py-0.5 text-xs rounded ring-purple-700/30  ring bg-purple-50 text-purple-700/75 inline-flex items-center gap-[2px] text-sm ml-2">
                Pro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>
