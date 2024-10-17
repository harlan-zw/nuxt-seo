<script lang="ts" setup>
import { modules } from '../../../src/const'

const props = defineProps<{
  slug: typeof modules[number]['slug']
  size?: 'sm' | 'md' | 'lg'
}>()

const module = modules.find(m => m.slug === props.slug)

const textAttrs = computed(() => {
  switch(props.size) {
    case 'sm': return { class: 'text-sm' }
    case 'md': return { class: 'text-base' }
    case 'lg': return { class: 'text-lg' }
    default: return {}
  }
})

const iconAttrs = computed(() => {
  switch(props.size) {
    case 'sm': return { class: 'w-4 h-4' }
    case 'md': return { class: 'w-6 h-6' }
    case 'lg': return { class: 'w-8 h-8' }
    default: return {}
  }
})
</script>

<template>
  <div class="flex items-center gap-1 font-bold">
    <UIcon :name="module.icon" class="text-blue-300" v-bind="iconAttrs" />
    <div v-bind="textAttrs">{{ module.label }}</div>
  </div>
</template>
