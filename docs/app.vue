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

    <footer class="text-sm text-gray-700 dark:text-gray-200 py-10 bg-[#8881] mt-20">
      <UContainer>
        <div class="grid xl:grid-cols-3 gap-20">
          <div>
            <div class="mb-5">
              <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
                <Logo />
                <span class="hidden sm:block">Nuxt</span><span class="sm:text-primary-500 dark:sm:text-primary-400">SEO</span>
              </NuxtLink>
            </div>
            <div class="mb-2">
              Hey <i class="i-noto-waving-hand"></i> I built Nuxt SEO to solve SEO for Nuxt once and for all.
            </div>
            <div>
              It's been on-going work for the last year and I'd love to have your <a href="https://github.com/sponsors/harlan-zw">support</a>!
            </div>
            <div class="mt-3 flex items-center opacity-80">
              - <a href="https://twitter.com/harlan_zw">Harlan Wilton</a>
              <UButton to="https://harlanzw.com" variant="ghost" :padded="false" class="ml-2">
                <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" class="w-5 h-5" />
              </UButton>
            </div>
          </div>
          <div class="col-span-2">
            <h3 class="font-bold mb-5">
              Modules
            </h3>
            <nav>
              <ul class="grid grid-cols-3 gap-6">
                <li v-for="(module, key) in modules" :key="key">
                  <NuxtLink :to="module.to">
                    <Icon :name="module.icon" />
                    {{ module.label }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </UContainer>
    </footer>

    <NuxtLoadingIndicator />
  </div>
</template>
