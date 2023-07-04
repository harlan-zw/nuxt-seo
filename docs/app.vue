<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

provide('navigation', navigation)

// Head
useServerHead({
  link: [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: 'antialiased font-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900',
  },
})

useServerSeoMeta({
  viewport: {
    width: 'device-width',
    initialScale: '1',
    maximumScale: '1',
  },
  themeColor: [
    { content: '#18181b', media: '(prefers-color-scheme: dark)' },
    { content: 'white', media: '(prefers-color-scheme: light)' },
  ],
  ogImage: '/social-preview.jpg',
  twitterImage: '/social-preview.jpg',
  twitterCard: 'summary_large_image',
})
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

    <UNotifications />
  </div>
</template>
