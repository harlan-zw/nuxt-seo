<script setup lang="ts">
import type { NavItem } from '@nuxt/content/dist/runtime/types'
import { useModuleList } from '~/utils/data'

const navigation: Ref<NavItem[]> = inject('navigation')

function mapContentLinks(links: NavItem[]) {
  return links?.map(link => ({ label: link.asideTitle || link.title, icon: link.icon, to: link._path, badge: link.badge })) || []
}

const route = useRoute()
const segment = computed(() => route.path.split('/')[1])
const children = computed(() => {
  // first segment
  switch (segment.value) {
    case 'nuxt-seo':
      return navigation.value[0].children
    case 'robots':
      return navigation.value[1].children
    case 'sitemap':
      return navigation.value[2].children
    case 'og-image':
      return navigation.value[3].children
    case 'schema-org':
      return navigation.value[4].children
    case 'link-checker':
      return navigation.value[5].children
    case 'experiments':
      return navigation.value[6].children
    case 'site-config':
      return navigation.value[7].children
  }
})

const items = useModuleList()
  .filter(m => !['seo-kit', 'site-config'].includes(m.id))

const module = computed(() => {
  return useModuleList().find(l => l.slug === segment.value)
})
</script>

<template>
  <div>
    <div v-if="children" class="space-y-8 mb-8">
      <div>
        <div class="text-gray-400 flex items-center gap-1">
          <Icon v-if="module.slug !== 'nuxt-seo'" :name="module.icon" class="w-5 h-5 transition-all" />
          <Logo v-else />
          <div>{{ module.label }}</div>
        </div>
      </div>
      <div v-for="(group, index) in children" :key="index" class="space-y-3">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate leading-6">
          {{ group.title }}
        </p>

        <UVerticalNavigation
          :links="mapContentLinks(group.children)"
          class="mt-1"
          :ui="{
            wrapper: 'border-l border-gray-200 dark:border-gray-800 space-y-2',
            base: 'group block border-l -ml-px lg:leading-6 flex items-center gap-2',
            padding: 'pl-4',
            rounded: '',
            font: '',
            ring: '',
            active: 'text-primary-500 dark:text-primary-400 border-current',
            inactive: 'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
          }"
        >
          <template #badge="{ link }">
            <UBadge v-if="link.badge" size="xs" :ui="{ rounded: 'rounded-full' }">
              {{ link.badge }}
            </UBadge>
          </template>
        </UVerticalNavigation>
      </div>
    </div>
    <div class="lg:flex lg:space-x-7">
      <div class="flex flex-col gap-2">
        <NuxtLink to="/nuxt-seo/getting-started/installation" class="px-3 py-2 hover:bg-gray-100">
          <div class="flex font-semibold gap-1 items-center">
            <Logo />
            <span class="truncate">Nuxt SEO Module</span>
          </div>
          <div class="text-xs opacity-60 ">
            All the SEO modules combined into one.
          </div>
        </NuxtLink>
        <NuxtLink to="/site-config/getting-started/installation" class="flex justify-start flex-col items-start px-3 py-2 hover:bg-gray-100 text-left">
          <div class="flex font-semibold gap-1 items-center">
            <Icon name="carbon:settings-check" class="text-blue-300 flex-shrink-0 group-hover:text-blue-500 h-6 w-6 dark:text-gray-500 ms-auto" />
            <span class="truncate">Site Config</span>
          </div>
          <div class="text-xs opacity-60 ">
            Shared site configuration for Nuxt modules.
          </div>
        </NuxtLink>
      </div>
      <div>
        <div class="lg:grid grid-cols-2 md:gap-2">
          <NuxtLink v-for="(item, index) in items" :key="index" :to="item.to" class="block space-x-2 px-3 py-2 hover:bg-gray-100">
            <Icon :name="item.icon" class="text-blue-300 flex-shrink-0 group-hover:text-blue-500 h-6 w-6 dark:text-gray-500 ms-auto" />
            <span class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
