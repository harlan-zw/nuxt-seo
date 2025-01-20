<script lang="ts" setup>
import { updateSiteConfig, useBreadcrumbItems, useI18n, useRoute, useSiteConfig } from '#imports'

const i18n = useI18n()

function setLanguage(code: string) {
  i18n.setLocale(code)
}

const items = useBreadcrumbItems({
  path: `/${i18n.locale.value}/blog/my-post`,
  prepend: [
    {
      to: '/',
      label: 'Prepend',
    },
  ],
  overrides: [
    false,
    undefined,
    {
      to: '/content',
      label: 'Override',
    },
  ],
  append: [
    {
      to: '/content',
      label: 'Append',
    },
  ],
})

const route = useRoute()
if (route.query.name) {
  updateSiteConfig({
    name: route.query.name as string,
  })
}

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 w-full backdrop-blur flex-none border-b border-gray-900/10 dark:border-gray-50/[0.06] bg-white/75 dark:bg-gray-900/75">
      <div class="py-3">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl text-gray-900 dark:text-white">
            Nuxt
            <div class="text-primary-500 dark:text-primary-400">
              {{ siteConfig.name }}
            </div>
            <div class="text-gray-300 ml-2 text-xs">
              {{ siteConfig.url }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </header>
    <main class="min-h-full h-full flex-grow">
      <div class="mt-4">
        <div>
          <UBreadcrumb :links="items" />
        </div>
        <NuxtPage />
      </div>
    </main>
  </div>
</template>
