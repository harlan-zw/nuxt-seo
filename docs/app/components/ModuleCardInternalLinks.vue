<script lang="ts" setup>
const module = {
  label: 'Internal Links',
  description: 'Get automatic suggestions on internal links to implement right in your DevTools.',
  icon: 'i-carbon-link',
  scheduled: 'Q2 2025',
}
const items = [
  { label: '🔗 Live suggestions for internal links' },
  { label: '📑 Suggestions on pillar and cluster page content' },
  { label: '➕ Add-on for the Link Checker module.' },
]
</script>

<template>
  <ModuleFeaturesCard :module="module" :items="items" />
</template>
