<script lang="ts" setup>
import { useRoute, watch } from '#imports'
import { ref } from 'vue'
import { isLoading, moduleVersion, refreshAll } from './composables/data'
import './composables/rpc'

const route = useRoute()

const activeTab = ref('overview')

watch(() => route.path, (p) => {
  if (p === '/keywords')
    activeTab.value = 'keywords'
  else if (p === '/pages')
    activeTab.value = 'pages'
  else if (p === '/docs')
    activeTab.value = 'docs'
  else
    activeTab.value = 'overview'
}, { immediate: true })

const navItems = [
  { value: 'overview', to: '/', icon: 'carbon:dashboard', label: 'Overview' },
  { value: 'keywords', to: '/keywords', icon: 'carbon:text-mining-applier', label: 'Keywords' },
  { value: 'pages', to: '/pages', icon: 'carbon:document-multiple', label: 'Pages' },
  { value: 'docs', to: '/docs', icon: 'carbon:book', label: 'Docs' },
]
</script>

<template>
  <DevtoolsLayout
    v-model:active-tab="activeTab"
    module-name="nuxt-seo-pro-devtools"
    title="SEO Pro"
    icon="carbon:analytics"
    :version="moduleVersion"
    :nav-items="navItems"
    github-url="https://github.com/harlan-zw/nuxt-seo"
    :loading="isLoading"
    @refresh="refreshAll"
  >
    <NuxtPage />
  </DevtoolsLayout>
</template>
