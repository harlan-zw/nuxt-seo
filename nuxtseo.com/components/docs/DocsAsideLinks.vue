<script setup lang="ts">
import type { NavItem } from '@nuxt/content'
import { useModuleList } from '~/utils/data'

const children = inject<Ref<NavItem[]>>('docsAsideLinks')
const module = inject('module')

function mapContentLinks(links: NavItem[]) {
  return links?.map(link => ({ label: link.asideTitle || link.title, icon: link.icon, to: link._path, badge: link.badge })) || []
}

const items = useModuleList()
  .filter(m => !['seo-kit', 'site-config'].includes(m.id))
</script>

<template>
  <div>
    <UPageLinks title="Community" :links="communityLinks" />
    <UPageLinks title="Ecosystem" :links="ecosystemLinks" />
    <div v-if="children && module" class="space-y-8 mb-8">
      <div>
        <div class="text-gray-400 flex items-center gap-1">
          <UIcon v-if="module.slug !== 'nuxt-seo'" dynamic :name="module.icon" class="w-5 h-5 transition-all" />
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
    <div class="lg:flex lg:space-x-7 space-y-5">
      <div>
        <div class="font-semibold text-sm ml-3 text-gray-600 dark:text-gray-400 mb-3">
          SEO Modules
        </div>
        <div class="lg:grid grid-cols-2 md:gap-2">
          <NuxtLink v-for="(item, index) in items" :key="index" :to="item.to" class="flex gap-3 ring-1 ring-transparent group items-center px-3 py-2 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
            <UIcon :name="item.icon" dynamic class="text-blue-300 flex-shrink-0 group-hover:text-blue-700 h-6 w-6 dark:text-gray-500" />
            <div>
              <div class="font-semibold truncate">
                {{ item.label }}
              </div>
              <div class="text-xs opacity-60">
                {{ item.description }}
              </div>
            </div>
            <div>
              {{ item }}
            </div>
          </NuxtLink>
        </div>
      </div>
      <div>
        <div class="font-semibold text-sm ml-3 text-gray-600 dark:text-gray-400 mb-3">
          Other Modules
        </div>
        <div class="flex flex-col gap-2">
          <NuxtLink to="/nuxt-seo/getting-started/installation" class="flex gap-3 ring-1 ring-transparent group items-center mb-2 px-3 py-2 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
            <UIcon name="i-logos-nuxt-icon" class="text-blue-300 flex-shrink-0 group-hover:text-blue-700 h-6 w-6 dark:text-gray-500" />
            <div>
              <div class="font-semibold truncate">
                Nuxt SEO - All In One
              </div>
              <div class="text-xs opacity-60">
                All the above SEO modules combined into one.
              </div>
            </div>
          </NuxtLink>
          <div>
            <NuxtLink to="/site-config/getting-started/installation" class="flex gap-3 ring-1 ring-transparent group items-center mb-2 px-3 py-2 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
              <UIcon name="i-carbon-settings-check" class="text-blue-300 flex-shrink-0 group-hover:text-blue-700 h-6 w-6 dark:text-gray-500" />
              <div>
                <div class="font-semibold truncate">
                  Site Config
                </div>
                <div class="text-xs opacity-60">
                  Shared site configuration for Nuxt modules.
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
