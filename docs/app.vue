<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

provide('navigation', navigation)
</script>

<template>
  <div>
    <Header />

    <UContainer>
      <NuxtPage />
    </UContainer>

    <ClientOnly>
      <DocsSearch />
    </ClientOnly>

  </div>
</template>
