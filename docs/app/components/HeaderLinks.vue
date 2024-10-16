<script setup lang="ts">
import {
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from 'radix-vue'
import { ref } from 'vue'
import { fetchStats } from '~/composables/stats'
import NavigationMenuListItem from './NavigationMenuListItem.vue'

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits(['update:modelValue'])

const modules = inject('modules')

const currentTrigger = ref(null)

const isDialogOpen = useVModel(props, 'modelValue', emit)

const items = modules
  .filter(m => !['seo-kit', 'site-config'].includes(m.id))

const route = useRoute()
const isSetup = computed(() => {
  return route.path.startsWith('/nuxt-seo')
})

const { data: stats } = await useAsyncData('stats', () => fetchStats())
const nuxtSeoStars = computed(() => {
  // nicely format like github stars, show k
  const stars = stats.value?.modules.find(m => m.id === 'seo')?.stars || 0
  return Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(stars)
})

const communityLinks = computed(() => [
  {
    icon: 'i-ph-chat-centered-text-duotone',
    label: 'Discord Support',
    to: 'https://discord.gg/275MBUBvgP',
    target: '_blank',
  },
  {
    icon: 'i-ph-hand-heart-duotone',
    label: 'Become a Sponsor',
    to: 'https://github.com/sponsors/harlan-zw',
    target: '_blank',
  },
])

const ecosystemLinks = [
  {
    label: 'Zhead',
    to: 'https://zhead.dev',
    target: '_blank',
  },
  {
    label: 'Request Indexing',
    to: 'https://requestindexing.com',
    target: '_blank',
  },
  {
    label: 'Unlighthouse',
    to: 'https://unlighthouse.dev',
    target: '_blank',
  },
  {
    label: 'Unhead',
    to: 'https://unhead.unjs.io',
    target: '_blank',
  },
]
</script>

<template>
  <div class="flex items-center justify-between gap-2 h-16 px-10">
    <div class="flex items-center gap-10">
      <div class="flex items-center gap-3">
        <UButton variant="ghost" to="/" title="Home" aria-label="Title" class="py-2 flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
          <Logo />
        </UButton>
      </div>
      <NavigationMenuRoot
        v-model="currentTrigger"
        class="relative z-[1] flex w-full justify-center"
      >
        <NavigationMenuList class="center shadow-green-700/10 m-0 flex list-none rounded-[6px] p-1 shadow-[0_2px_5px]">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              class="hover:bg-green-500/25 group-data-[state=open]:bg-green-500/10 transition overflow-hidden focus:shadow-green-500 group flex select-none items-center justify-between gap-2 rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
            >
              <span class="transition">Docs</span>
              <div class="relative w-4">
                <UIcon
                  name="i-ph-caret-down-light"
                  class="right-0 -top-[7px] absolute transition-transform duration-[250ms] ease-in group-data-[state=open]:translate-y-10"
                />
                <UIcon
                  name="i-ph-caret-up-light"
                  class="right-0 -top-[7px] absolute transition-transform duration-[250ms] ease-in -translate-y-10 group-data-[state=open]:translate-y-0 "
                />
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent
              class="data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight absolute top-0 left-0 w-full sm:w-auto"
            >
              <div class="p-4 space-y-4 dark:bg-[#1b2335]">
                <div class="">
                  <div>
                    <div class="font-semibold text-sm ml-3 text-gray-600 dark:text-gray-400 mb-3">
                      SEO Modules
                    </div>
                    <div class="lg:grid grid-cols-2 gap-1">
                      <NuxtLink v-for="(item, index) in items" :key="index" :to="`/docs/${item.slug}/getting-started/installation`" class="flex gap-3 ring-1 ring-transparent px-3 py-1.5 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
                        <UIcon :name="item.icon" dynamic class="mt-1 text-blue-300 flex-shrink-0 h-6 w-6" />
                        <div>
                          <div class="font-semibold truncate mb-0.5">
                            {{ item.label }}
                          </div>
                          <div class="text-xs opacity-60 max-w-xs">
                            {{ item.description }}
                          </div>
                        </div>
                        <!--                        <div> -->
                        <!--                          {{ item.tag.version }} -->
                        <!--                        </div> -->
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="font-semibold text-sm ml-3 text-gray-600 dark:text-gray-400 mb-3">
                    Other Modules
                  </div>
                  <div class="flex flex-col gap-2">
                    <NuxtLink to="/docs/nuxt-seo/getting-started/installation" class="flex gap-3 ring-1 ring-transparent group items-center mb-2 px-3 py-2 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
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
                      <NuxtLink to="/docs/site-config/getting-started/installation" class="flex gap-3 ring-1 ring-transparent group items-center mb-2 px-3 py-2 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
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
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger
              class="text-grass11 hover:bg-green3 focus:shadow-green7 group flex select-none items-center justify-between gap-[2px] rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
            >
              Overview
              <UIcon
                name="radix-icons:caret-down"
                class="text-green10 relative top-[1px] transition-transform duration-[250ms] ease-in group-data-[state=open]:-rotate-180"
              />
            </NavigationMenuTrigger>
            <NavigationMenuContent class="data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight absolute top-0 left-0 w-full sm:w-auto">
              <ul class="m-0 grid list-none gap-x-[10px] p-[22px] sm:w-[600px] sm:grid-flow-col sm:grid-rows-3">
                <NavigationMenuListItem
                  title="Introduction"
                  href="/docs/primitives/overview/introduction"
                >
                  Build high-quality, accessible design systems and web apps.
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  title="Getting started"
                  href="/docs/primitives/overview/getting-started"
                >
                  A quick tutorial to get you up and running with Radix Primitives.
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  title="Styling"
                  href="/docs/primitives/guides/styling"
                >
                  Unstyled and compatible with any styling solution.
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  title="Animation"
                  href="/docs/primitives/guides/animation"
                >
                  Use CSS keyframes or any animation library of your choice.
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  title="Accessibility"
                  href="/docs/primitives/overview/accessibility"
                >
                  Tested in a range of browsers and assistive technologies.
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  title="Releases"
                  href="/docs/primitives/overview/releases"
                >
                  Radix Primitives releases and their changelogs.
                </NavigationMenuListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              class="text-grass11 hover:bg-green3 focus:shadow-green7 block select-none rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none no-underline outline-none focus:shadow-[0_0_0_2px]"
              href="https://github.com/radix-vue"
            >
              Github
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuIndicator
            class="data-[state=hidden]:opacity-0 duration-200 data-[state=visible]:animate-fadeIn data-[state=hidden]:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[all,transform_250ms_ease]"
          >
            <div class="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-white dark:bg-[#1b2335]" />
          </NavigationMenuIndicator>
        </NavigationMenuList>

        <div class="perspective-[2000px] absolute top-full left-0 flex w-full justify-center">
          <NavigationMenuViewport
            class="data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] w-full dark:bg-[#1b2335] origin-[top_center] overflow-hidden rounded-[10px] bg-white transition-[width,_height] duration-300 sm:w-[var(--radix-navigation-menu-viewport-width)]"
          />
        </div>
      </NavigationMenuRoot>
    </div>

    <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
      <NuxtLink to="https://github.com/harlan-zw/nuxt-seo" target="_blank" aria-label="Star Nuxt SEO on GitHub" class="hidden lg:flex mr-5 group border dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 hover:bg-gray-200 dark:bg-gray-900 bg-gray-100 transition rounded-lg text-sm justify-center">
        <div class="flex items-center transition rounded-l px-2 py-1 space-x-1">
          <UIcon name="i-uil-star" class="group-hover:op75 " />
          <div>Star</div>
        </div>
        <div class="px-2 py-1 dark:bg-black/20 bg-white rounded-r-lg">
          {{ nuxtSeoStars }}
        </div>
      </NuxtLink>

      <div class="flex items-center lg:gap-1.5">
        <ColorModeButton />

        <UButton
          title="Twitter"
          aria-label="Twitter"
          to="https://twitter.com/harlan_zw"
          target="_blank"
          color="gray"
          variant="ghost"
          class="hidden lg:inline-flex transition"
          icon="i-simple-icons-x"
        />

        <UButton
          title="GitHub"
          aria-label="GitHub"
          to="https://github.com/harlan-zw/nuxt-seo"
          target="_blank"
          color="gray"
          variant="ghost"
          class="hidden lg:inline-flex transition"
          icon="i-simple-icons-github"
        />

        <UButton
          color="gray"
          variant="ghost"
          class="lg:hidden"
          :aria-label="isDialogOpen ? 'Close Menu' : 'Open Menu'"
          :icon="isDialogOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          @click="isDialogOpen = !isDialogOpen"
        />
      </div>
    </div>
  </div>
</template>
