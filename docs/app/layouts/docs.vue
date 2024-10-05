<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const nav = inject<Ref<NavItem[]>>('navigation')
const { navDirFromPath } = useContentHelpers()

const route = useRoute()
const navigation = computed(() => navDirFromPath(route.path.split('/').slice(0, 3).join('/'), nav?.value || []))
</script>

<template>
  <UMain>
    <UContainer>
      <UPage :ui="{ left: 'lg:col-span-3', center: 'lg:col-span-6' }">
        <template #left>
            <UPageAside class="max-w-[300px]">
              <UContentNavigation :navigation="navigation" highlight :collapsible="false" />
            </UPageAside>
        </template>

        <slot />
      </UPage>
    </UContainer>
    <Ads class="hidden w-[180px] lg:inline-block fixed bottom-5 right-5" />
  </UMain>
</template>
