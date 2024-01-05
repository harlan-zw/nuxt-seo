<script setup lang="ts">
import { useModuleList } from '~/utils/data'

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

provide('navigation', navigation)

const modules = useModuleList()
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

    <footer class="text-sm text-gray-700 dark:text-gray-200 mt-20">
      <div class="border-t border-gray-200 dark:border-gray-800">
        <UContainer>
          <div class="py-10 grid xl:grid-cols-3 lg:gap-20 gap-10">
            <div>
              <div class="mb-5">
                <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
                  <Logo />
                  <span class="hidden sm:block">Nuxt</span><span class="sm:text-primary-500 dark:sm:text-primary-400">SEO</span>
                </NuxtLink>
              </div>
              <nav>
                <ul class="space-y-6">
                  <li>
                    <NuxtLink to="/nuxt-seo/getting-started/what-is-nuxt-seo">
                      What is Nuxt SEO?
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/nuxt-seo/getting-started/installation">
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
                      <Icon :name="module.icon" />
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
                    Hey <Icon name="noto:waving-hand" /> My name is <a href="https://harlanzw.com" target="_blank" class="underline">Harlan</a> and I'm the author and maintainer of Nuxt SEO.
                  </div>
                  <div>
                    I'd love to have your <a href="https://github.com/sponsors/harlan-zw" class="underline">support</a>!
                  </div>
                </div>
                <div class="gap-3">
                  <img loading="lazy" src="https://avatars.githubusercontent.com/u/5326365?v=4" class="mx-auto rounded-full w-10 h-10 mb-3">
                  <div class="flex justify-center items-center opacity-70">
                    <UButton color="white" variant="ghost" href="https://twitter.com/harlan_zw" target="_blank">
                      <Icon name="i-logos-twitter" class="text-xl" />
                    </UButton>
                    <UButton color="white" variant="ghost" href="https://github.com/harlan-zw" target="_blank">
                      <Icon name="i-logos-github-icon" class="text-xl" />
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
  </div>
</template>
