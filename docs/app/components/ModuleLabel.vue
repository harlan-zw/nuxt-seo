<script lang="ts" setup>
import { modules } from '../../../src/const'

const props = defineProps<{
  slug: typeof modules[number]['slug']
}>()

const module = modules.find(m => m.slug === props.slug)
</script>

<template>
  <div class="flex items-center gap-1 font-bold">
    <UIcon :name="module.icon" class="text-blue-300" />
    {{ module.label }}
  </div>
</template>
