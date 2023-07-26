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

    <footer class="text-sm text-gray-700 flex justify-center items-center py-10">
      Made by
      <UButton to="https://harlanzw.com" variant="ghost" :padded="false" class="ml-2">
        <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" class="w-5 h-5" /> Harlan Wilton
      </UButton>
    </footer>

    <NuxtLoadingIndicator />
  </div>
</template>
