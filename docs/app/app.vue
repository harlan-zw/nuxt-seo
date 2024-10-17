<script setup lang="ts">
import { fetchStats } from '~/composables/stats'
import { modules } from '../../src/const'
import { queryCollectionNavigation } from '#imports'
import { titleCase } from 'scule'

function mapPath(data, node = 0) {
  console.log(node, data)
  return data.map((item) => {
    if (item.page && item.children?.length) {
      console.log('??', item)
    }
    if (item.children?.length && !item.page) {
      item.title = titleCase(item.title)
      item.children = mapPath(item.children, node + 1)
    }
    return {
      ...item,
      _path: item.path,
    }
  })
}
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'), {
  default: () => [],
  transform: mapPath,
})
const { data: stats } = await useAsyncData('stats', () => fetchStats())

const route = useRoute()
const appConfig = useAppConfig()
const colorMode = useColorMode()
const segment = computed(() => route.path.split('/')[1])
const children = computed(() => {
  return navigation!.value!.find(i => i._path === `/${segment.value}`)?.children || []
})

provide('stats', stats)
provide('navigation', navigation)
provide('docsAsideLinks', children)
provide('modules', modules)
// provide('module', computed(() => {
//   const m = modules.find(l => l?.slug === segment.value)
//   const stats = (publicRuntimeConfig.moduleStats || []).find(m2 => m2.id === m?.id)?.stats || {}
//   return m
// }))

useSeoMeta({
  ogTitle: 'Nuxt SEO · All the boring SEO work for Nuxt done.',
  // twitterTitle: 'Nuxt SEO - All the boring SEO work for Nuxt done.',
})

const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius}rem; }`)

useHead({
  style: [
    { innerHTML: radius, id: 'nuxt-ui-radius', tagPriority: -2 },
  ],
})
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Banner />
    <Header />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly />

    <footer class="relative z-10 antialiased font-sans bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 mt-20">
      <div class="border-t border-gray-200 dark:border-gray-800">
        <UContainer>
          <div class="py-10 grid xl:grid-cols-3 lg:gap-20 gap-10">
            <div>
              <div class="mb-5">
                <NuxtLink to="/" title="Home" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
                  <Logo />
                </NuxtLink>
              </div>
              <nav>
                <ul class="space-y-6">
                  <li>
                    <NuxtLink to="/docs/nuxt-seo/getting-started/what-is-nuxt-seo">
                      What is Nuxt SEO?
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/docs/nuxt-seo/getting-started/installation">
                      Install Nuxt SEO
                    </NuxtLink>
                  </li>
                </ul>
              </nav>
            </div>
            <div>
              <h3 class="font-bold mb-5">
                Modules
              </h3>
              <nav>
                <ul class="grid grid-cols-2 gap-6">
                  <li v-for="(module, key) in modules" :key="key">
                    <NuxtLink :to="module.to">
                      <UIcon dynamic :name="module.icon" />
                      {{ module.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </nav>
            </div>
            <div>
              <div class="bg-gray-50 dark:bg-gray-800 flex rounded-xl shadow p-5">
                <div>
                  <div class="mb-2">
                    Hey <UIcon name="i-noto-waving-hand" /> My name is <a href="https://harlanzw.com" target="_blank" class="underline">Harlan</a> and I'm the author and maintainer of Nuxt SEO.
                  </div>
                  <div>
                    I'd love to have your <a href="https://github.com/sponsors/harlan-zw" class="underline">support</a>!
                  </div>
                </div>
                <div class="gap-3">
                  <img alt="Harlan Wilton" loading="lazy" src="https://avatars.githubusercontent.com/u/5326365?v=4" class="mx-auto rounded-full w-10 h-10 mb-3">
                  <div class="flex justify-center items-center opacity-70">
                    <UButton title="Twitter" variant="ghost" to="https://twitter.com/harlan_zw" target="_blank">
                      <UIcon name="i-logos-twitter" class="text-xl" />
                    </UButton>
                    <UButton title="GitHub" aria-label="GitHub" variant="ghost" to="https://github.com/harlan-zw" target="_blank">
                      <UIcon name="i-logos-github-icon" class="text-xl" />
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UContainer>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-800">
        <UContainer>
          <div class="py-10">
            Copyright © 2023-{{ new Date().getFullYear() }} Harlan Wilton - <a href="https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE">MIT License</a>
          </div>
        </UContainer>
      </div>
    </footer>
    <NuxtLoadingIndicator />
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

@theme {
  --font-family-sans: 'Public Sans', sans-serif;
  --font-family-mono: 'Fira Code', monospace;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

:root {
  --container-width: 90rem;
}
</style>
