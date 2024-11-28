<script lang="ts" setup>
const module = {
  label: 'Magic Redirects',
  description: 'Never worry about a 404 again with zero-config redirects that feel like magic.',
  icon: 'i-carbon-direction-loop-right',
  scheduled: 'Q1 2025',
}

const route = useRoute()
const mdc = computed(() => route.path.startsWith('/pro')
  ? `More details coming soon`
  : `See [Nuxt SEO Pro](/pro) for more information.`)

const items = computed(() => [
  { slot: 'one', label: '⚡ Automatic 301 redirects when you move pages', mdc: mdc.value },
  { slot: 'two', label: '🌱 Get prompted to add redirects for deleted pages', mdc: mdc.value },
  { slot: 'two', label: '🔍  Analytics on production 404 links and redirect usages', mdc: mdc.value },
  { slot: 'four', label: '🔄 Safer redirects that avoid infinite loops and RegExp support', mdc: 'More details coming soon' },
])
</script>

<template>
  <ModuleFeaturesCard :module="module" :items="items" />
</template>
