<script setup lang="ts">
import {useModuleList} from "~/utils/data";

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

  <footer class="text-sm text-gray-700 dark:text-gray-200 py-10 bg-[#8881]">
    <UContainer>
      <div class="grid xl:grid-cols-3 gap-10">
        <div>
          <div class="mb-10">
            <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
              <Logo />
              <span class="hidden sm:block">Nuxt</span><span class="sm:text-primary-500 dark:sm:text-primary-400">SEO</span>
            </NuxtLink>
          </div>
        </div>
        <div>
          <h3 class="font-bold mb-5">Modules</h3>
          <nav>
            <ul class="grid grid-cols-3 gap-5">
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
          <h3 class="font-bold mb-5">Support</h3>
          <div class="mb-2">
            Hey :wave: Nuxt SEO and all of its module were built by me in my free time.
          </div>
          <div>
            It's been a lot of work and I'd love to have your support on the project financially.
          </div>
          <div class="mb-2">
            - Harlan Wilton
            <UButton to="https://harlanzw.com" variant="ghost" :padded="false" class="ml-2">
              <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" class="w-5 h-5" />
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </footer>

  <NuxtLoadingIndicator />
</div>
</template>
