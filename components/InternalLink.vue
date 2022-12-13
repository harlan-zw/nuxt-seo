<script lang="ts" setup>
const props = defineProps<{ to: string }>()
const to = resolveTrailingSlash(props.to)
</script>

<template>
  <NuxtLink v-bind="$attrs" :to="to">
    <slot />
  </NuxtLink>
</template>
