<script lang="ts" setup>
const module = {
  label: 'Google Search Console',
  description: 'Integrate your site with Google Search Console and see alerts and stats directly in your Nuxt app.',
  icon: 'i-carbon-cloud-data-ops',
  scheduled: 'Q1 2025',
}
const items = [
  { slot: 'one', label: '📄 Page Indexing reports for all of your pages', mdc: '<img src="/gsc-indexing.png" loading="lazy">' },
  { slot: 'two', label: '🔑 See the keywords generating traffic to your pages', mdc: '<img src="/gsc-keywords.png" loading="lazy">' },
  { slot: 'three', label: '📉 Find pages that are growing or declining in traffic', mdc: 'More details coming soon' },
  { slot: 'four', label: '⚔️ See pages with keywords competing with each other', mdc: 'More details coming soon' },
]
</script>

<template>
  <ModuleFeaturesCard :module="module" :items="items" />
</template>
