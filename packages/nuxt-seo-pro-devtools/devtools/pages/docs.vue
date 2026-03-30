<script setup lang="ts">
const links = [
  {
    title: 'Pro Dashboard',
    description: 'View your full SEO analytics dashboard',
    url: 'https://nuxtseo.com/pro/dashboard',
    icon: 'carbon:dashboard',
  },
  {
    title: 'Nuxt SEO Pro Docs',
    description: 'Learn about Pro features and configuration',
    url: 'https://nuxtseo.com/pro',
    icon: 'carbon:book',
  },
  {
    title: 'Nuxt SEO Docs',
    description: 'Documentation for all Nuxt SEO modules',
    url: 'https://nuxtseo.com',
    icon: 'carbon:document',
  },
  {
    title: 'GitHub',
    description: 'Report issues or contribute',
    url: 'https://github.com/harlan-zw/nuxt-seo',
    icon: 'carbon:logo-github',
  },
]
</script>

<template>
  <div class="devtools-main-content space-y-5 p-5">
    <div class="grid gap-3">
      <a
        v-for="link in links"
        :key="link.url"
        :href="link.url"
        target="_blank"
        class="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
      >
        <span class="text-lg text-muted group-hover:text-primary transition-colors" :class="link.icon" />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">
            {{ link.title }}
          </div>
          <div class="text-xs text-muted">
            {{ link.description }}
          </div>
        </div>
        <span class="i-carbon-launch text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  </div>
</template>
