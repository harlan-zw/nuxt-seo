<script lang="ts" setup>
const module = {
  label: 'SEO Analyze',
  description: 'Get real-time feedback on your SEO efforts with validations and suggestions on your SEO tags.',
  icon: 'i-carbon-list-checked',
  scheduled: 'Q2 2025',
}
const items = [
  { label: '✅ Validates for broken and missing SEO Tags' },
  { label: '⏱️ Real-time feedback and build-time feedback.' },
  { label: '🖼️ Ensures OG Images can be shown correctly' },
]
</script>

<template>
  <ModuleFeaturesCard :module="module" :items="items" />
</template>
