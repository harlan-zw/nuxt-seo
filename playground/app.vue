<script setup lang="ts">
import { refreshSources } from '../packages/shared/src/layer-devtools/composables/state'

const navItems = [
  { value: 'components', to: '/', icon: 'carbon:assembly-cluster', label: 'Components' },
  { value: 'styles', to: '/styles', icon: 'carbon:color-palette', label: 'Styles' },
  { value: 'states', to: '/states', icon: 'carbon:flow', label: 'States' },
  { value: 'debug', to: '/debug', icon: 'carbon:debug', label: 'Debug', devOnly: true },
  { value: 'docs', to: '/docs', icon: 'carbon:book', label: 'Docs' },
]

const route = useRoute()
const currentTab = computed(() => route.path.split('/')[1] || 'components')
</script>

<template>
  <DevtoolsLayout
    title="Playground"
    icon="carbon:view"
    version="0.1.2"
    :nav-items="navItems"
    :active-tab="currentTab"
    github-url="https://github.com/harlan-zw/nuxt-seo"
    @refresh="refreshSources"
  >
    <NuxtPage />
  </DevtoolsLayout>
</template>
