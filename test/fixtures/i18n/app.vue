<script lang="ts" setup>
import { updateSiteConfig, useBreadcrumbItems, useI18n, useRoute, useSiteConfig } from '#imports'

const i18n = useI18n()

function setLanguage(code: string) {
  i18n.setLocale(code)
}

const defaultLocale = i18n.defaultLocale

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

const languageOptions = [
  [
    { label: 'English', click() { setLanguage('en') } },
    { label: 'French', click() { setLanguage('fr') } },
  ],
]
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
      <UContainer class="py-3">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl text-gray-900 dark:text-white">
            <Icon name="logos:nuxt-icon" class="w-8 h-8" />
            Nuxt
            <div class="text-primary-500 dark:text-primary-400">
              {{ siteConfig.name }}
            </div>
            <div class="text-gray-300 ml-2 text-xs">
              {{ siteConfig.url }}
            </div>
          </NuxtLink>
          <UDropdown :items="languageOptions" :popper="{ placement: 'bottom-start' }">
            <UButton color="white" :label="defaultLocale" trailing-icon="i-heroicons-chevron-down" />
          </UDropdown>
        </div>
      </UContainer>
    </header>
    <main class="min-h-full h-full flex-grow">
      <UContainer class="mt-4">
        <div>
          <UBreadcrumb :links="items" />
        </div>
        <NuxtPage />
      </UContainer>
    </main>
    <footer class="text-sm text-gray-700 flex justify-center items-center py-5">
      Made by <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" class="w-5 h-5 mx-1" /> Harlan Wilton
    </footer>
  </div>
</template>
