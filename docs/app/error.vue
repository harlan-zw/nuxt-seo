<script setup lang="ts">
import type { NuxtError } from '#app'
import { modules } from '../../src/const'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.',
})

const { data: navigation } = await useLazyAsyncData('navigation', () => fetchContentNavigation(), {
  default: () => [],
  // transform: (navigation) => {
  //   navigation = navigation.find(link => link._path === prefix.value)?.children || []
  //
  //   return prefix.value === '/main' ? removePrefixFromNavigation(navigation) : navigation
  // }
})

// Provide
provide('modules', modules)
provide('navigation', navigation)
</script>

<template>
  <div>
    <Header />

    <UContainer>
      <UMain>
        <UPage>
          {{ error }}
        </UPage>
      </UMain>
    </UContainer>
  </div>
</template>
