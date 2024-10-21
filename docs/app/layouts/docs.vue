<script setup lang="ts">
const _nav = await useDocsNav()
const nav = computed(() => {
  const { top, bottom } = _nav.value?.value || {}
  return {
    top,
    bottom,
  }
})

const module = useModule()
const key = ref(0)
onMounted(() => {
  key.value = 1
})
</script>

<template>
  <UMain class="relative">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-900/30 pointer-events-none absolute w-full top-[1px] transition-all text-primary flex-shrink-0 opacity-100 duration-[400ms] opacity-30 z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="px-10 pt-1">
      <UPage :ui="{ left: 'lg:col-span-3', center: 'lg:col-span-6' }">
        <template #left>
          <UPageAside class="max-w-[300px] pt-0">
            <div class="isolate -ml-2.5 sticky pt-8 rounded bg-white dark:bg-gray-900 top-0 z-1">
              <ModuleCard :key="module.slug" :module="module" :version="false" class="mb-2" />
            </div>
            <div class="flex items-center gap-1 mb-3">
              <USelectMenu :search-input="false" size="sm" :model-value="module.version" :items="module.versions.map(v => ({ label: v, disabled: v !== module.version }))" class="w-full" />

              <UButton
                title="GitHub"
                aria-label="GitHub"
                :to="`https://github.com/${module.repo}`"
                target="_blank"
                color="neutral"
                variant="ghost"
                class="hidden lg:inline-flex transition opacity-70 hover:opacity-100"
                icon="i-simple-icons-github"
              />
              <UButton
                title="NPM"
                aria-label="NPM"
                :to="`https://npmjs.com/package/${module.npm}`"
                target="_blank"
                color="neutral"
                variant="ghost"
                class="hidden lg:inline-flex transition opacity-70 hover:opacity-100"
                icon="i-simple-icons-npm"
              />
            </div>
            <nav aria-title="Documentation Navigation">
              <ContentNavigation as="div" class="mb-5" default-open :collapsible="false" :navigation="nav.top" highlight :ui="{ listWithChildren: 'sm:ml-0 my-10' }">
                <template #link-leading="{ link, active }">
                  <div v-if="link.icon" class="rounded-md p-1 inline-flex ring-inset ring-1 bg-gray-100/50 dark:bg-gray-800/50 ring-gray-300 dark:ring-gray-700 group-hover:bg-primary group-hover:ring-primary group-hover:text-background" :class="active ? 'dark:bg-teal-700' : ''">
                    <UIcon :name="link.icon" class="w-4 h-4 text-primary-400 dark:text-sky-200" />
                  </div>
                </template>
              </ContentNavigation>
              <div class="bg-gray-800 h-[1px] my-5 mr-5" />
              <ContentNavigation as="div" default-open :collapsible="false" :navigation="nav.bottom" highlight :ui="{ listWithChildren: 'sm:ml-0 my-10' }">
                <template #link="{ link }">
                  <div v-if="!link.mdc" class="flex items-center gap-2">
                    <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-primary-400 dark:text-sky-200" />
                    <div :class="link.children?.length ? 'text-sm font-bold' : ''">
                      {{ link.title }}
                    </div>
                  </div>
                  <div v-else>
                    <MDC :value="link.title" unwrap="p" />
                  </div>
                </template>
              </ContentNavigation>
            </nav>
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </div>
    <Ads class="hidden w-[180px] lg:inline-block fixed bottom-5 right-5" />
  </UMain>
</template>
