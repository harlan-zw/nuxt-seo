<script setup lang="ts">
import { ref } from 'vue'
import { menu } from '../composables/nav'

const stats = inject('stats', ref())

const module = useModule()
const _nav = await useDocsNav()
const nav = computed(() => {
  const { top, bottom } = _nav.value?.value || {}
  return {
    top,
    bottom,
  }
})

const nuxtSeoStars = computed(() => {
  const stars = stats.value?.modules.find(m => m.slug === 'nuxt-seo')?.stars || 0
  return Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(stars)
})

const navigation = computed(() => {
  return menu.value.map((item) => {
    return {
      ...item,
      title: item.label,
      children: item.children?.map((child) => {
        return {
          ...child,
          to: child.children?.length ? child.children[0].to : child.to,
          title: child.label,
        }
      }),
    }
  })
})
</script>

<template>
  <UHeader :ui="{ root: 'bg-transparent border-none', container: 'max-w-full w-full' }">
    <template #left>
      <div class="flex items-center justify-between gap-2 h-16 xl:pl-10 xl:pr-5">
        <div class="flex items-center gap-10">
          <div class="flex items-center gap-3">
            <UButton variant="ghost" to="/" title="Home" aria-label="Title" class="py-2 flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
              <Logo />
            </UButton>
          </div>
        </div>
      </div>
      <div class="w-[500px] hidden lg:block">
        <UNavigationMenu :ui="{ content: 'w-[500px]' }" :items="menu" class="justify-center" />
      </div>
    </template>

    <template #content>
      <div class="isolate rounded bg-white dark:bg-gray-900">
        <ModuleCard :key="module.slug" :module="module" :version="false" class="mb-2" />
      </div>
      <div class="flex items-center gap-1 mb-3">
        <USelectMenu :search-input="false" size="sm" :model-value="module.version" :items="module.versions" class="w-full" />
        <UButton
          title="GitHub"
          aria-label="GitHub"
          :to="`https://github.com/${module.repo}`"
          target="_blank"
          color="neutral"
          variant="ghost"
          class="hidden lg:inline-flex transition opacity-70"
          icon="i-simple-icons-github"
        />
        <UButton
          title="NPM"
          aria-label="NPM"
          :to="`https://npmjs.com/package/${module.npm}`"
          target="_blank"
          color="neutral"
          variant="ghost"
          class="hidden lg:inline-flex transition opacity-70"
          icon="i-simple-icons-npm"
        />
      </div>
      <nav aria-title="Documentation Navigation" class="mb-10">
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
      <UContentNavigation :navigation="navigation" />
    </template>

    <template #right>
      <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
        <UTooltip text="Star on GitHub">
        <UButton to="https://github.com/harlan-zw/nuxt-seo" target="_blank" color="primary" variant="ghost">
          <template #leading>
            <div class="flex items-center transition rounded-l py-1 space-x-1 dark:text-gray-200">
              <UIcon name="i-carbon-star" class="w-3 h-3 " />
              <div>Star</div>
            </div>
          </template>
          <div class="font-semibold font-mono">
            {{ nuxtSeoStars }}
          </div>
        </UButton>
        </UTooltip>

        <div class="flex items-center lg:gap-1.5">
          <ColorModeButton />

          <UTooltip text="Open on X" :kbds="['meta', 'X']">
            <UButton
              to="https://twitter.com/harlan_zw"
              target="_blank"
              color="neutral"
              variant="ghost"
              icon="i-simple-icons-x"
            />
          </UTooltip>

          <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
            <UButton
              to="https://github.com/harlan-zw/nuxt-seo"
              target="_blank"
              color="neutral"
              variant="ghost"
              class="hidden lg:inline-flex transition opacity-85"
              icon="i-simple-icons-github"
            />
          </UTooltip>
        </div>
      </div>
    </template>
  </UHeader>
</template>
