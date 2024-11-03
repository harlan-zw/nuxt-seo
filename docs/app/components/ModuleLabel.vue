<script lang="ts" setup>
import type { modules } from '../../../src/const'
import { useModule } from '~/composables/module'

const props = defineProps<{
  slug: typeof modules[number]['slug']
  size?: 'sm' | 'md' | 'lg'
}>()

const module = useModule(ref(props.slug))

const textAttrs = computed(() => {
  switch (props.size || 'md') {
    case 'sm': return { class: 'text-sm' }
    case 'md': return { class: 'text-base' }
    case 'lg': return { class: 'text-lg' }
    default: return {}
  }
})

const iconAttrs = computed(() => {
  switch (props.size || 'md') {
    case 'sm': return { class: 'w-4 h-4' }
    case 'md': return { class: 'w-6 h-6' }
    case 'lg': return { class: 'w-5 h-5' }
    default: return {}
  }
})
</script>

<template>
  <NuxtLink :to="`/docs/${module.slug}/getting-started/introduction`" class="relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-3 py-2 gap-1">
    <div class="z-1 flex flex-col justify-between h-full">
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1" v-bind="textAttrs">
            <UIcon :name="module.icon" class="text-blue-500 dark:text-blue-300" v-bind="iconAttrs" />{{ module.label }}
            <slot />
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
