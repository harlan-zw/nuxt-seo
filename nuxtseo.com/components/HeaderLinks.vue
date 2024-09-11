<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const isDialogOpen = useVModel(props, 'modelValue', emit)

const items = useModuleList()
  .filter(m => !['seo-kit', 'site-config'].includes(m.id))

const route = useRoute()
const isSetup = computed(() => {
  return route.path.startsWith('/nuxt-seo')
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
  <div class="flex items-center justify-between gap-2 h-16">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" title="Home" aria-label="Title" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
          <Logo />
        </NuxtLink>
      </div>
      <div class="lg:space-x-5 space-x-2 lg:mr-5 pr-2 flex">
        <UPopover class="hidden md:block" mode="hover" :items="[items]" :popper="{ placement: 'bottom' }">
          <template #panel>
            <div class="p-4 space-y-4 dark:bg-[#1b2335]">
              <UButton to="/nuxt-seo/getting-started/what-is-nuxt-seo" :variant="!isSetup ? 'ghost' : 'outline'" class="md:block hover:bg-green-100 transition hidden space-x-2">
                <span class="text-gray-700 dark:text-gray-200">What is Nuxt SEO?</span>
              </UButton>
            </div>
          </template>
          <UButton label="Learn" variant="ghost" color="none" class="hover:bg-green-100 dark:hover:bg-green-950 transition" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UPopover>

        <UPopover class="hidden md:block" mode="hover" :items="[items]" :popper="{ placement: 'bottom' }">
          <template #panel>
            <div class="p-4 space-y-4 dark:bg-[#1b2335]">
              <div class="">
                <div>
                  <div class="font-semibold text-sm ml-3 text-gray-600 dark:text-gray-400 mb-3">
                    SEO Modules
                  </div>
                  <div class="lg:grid grid-cols-2 gap-1">
                    <NuxtLink v-for="(item, index) in items" :key="index" :to="item.to" class="flex gap-3 ring-1 ring-transparent px-3 py-1.5 hover:bg-blue-500/10 hover:ring-blue-500 rounded text-left">
                      <UIcon :name="item.icon" dynamic class="mt-1 text-blue-300 flex-shrink-0 h-6 w-6" />
                      <div>
                        <div class="font-semibold truncate mb-0.5">
                          {{ item.label }}
                        </div>
                        <div class="text-xs opacity-60 max-w-xs">
                          {{ item.description }}
                        </div>
                      </div>
                      <div>
                        {{ item.tag.version }}
                      </div>
                    </NuxtLink>
                  </div>
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
          </template>

          <UButton label="Modules" variant="ghost" color="none" class="hover:bg-green-100 dark:hover:bg-green-950 transition" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UPopover>
        <UPopover class="hidden md:block" mode="hover" :items="[items]" :popper="{ placement: 'bottom' }">
          <template #panel>
            <div class="p-4 space-y-4 dark:bg-[#1b2335]">
              <UPageLinks title="Community" :links="communityLinks" />
            </div>
          </template>
          <UButton label="Support" variant="ghost" color="none" class="hover:bg-green-100 dark:hover:bg-green-950 transition" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UPopover>
        <UPopover class="hidden md:block" mode="hover" :items="[items]" :popper="{ placement: 'bottom' }">
          <template #panel>
            <div class="p-4 space-y-4 dark:bg-[#1b2335]">
              <UPageLinks title="Ecosystem" :links="ecosystemLinks" />
            </div>
          </template>
          <UButton label="Ecosystem" variant="ghost" color="none" class="hover:bg-green-100 dark:hover:bg-green-950 transition" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UPopover>
      </div>
    </div>

    <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
      <LegoGithubStar v-slot="{ stars }" repo="harlan-zw/nuxt-seo" class="hidden lg:flex mr-5 group border dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 hover:bg-gray-200 dark:bg-gray-900 bg-gray-100 transition rounded-lg text-sm justify-center">
        <div class="flex items-center transition rounded-l px-2 py-1 space-x-1">
          <UIcon name="i-uil-star" class="group-hover:op75 " />
          <div>Star</div>
        </div>
        <div class="px-2 py-1 dark:bg-black/20 bg-white rounded-r-lg">
          {{ stars }}
        </div>
      </LegoGithubStar>

      <div class="flex items-center lg:gap-1.5">
        <UColorModeButton />

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
          :icon="isDialogOpen ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-bars-3-20-solid'"
          @click="isDialogOpen = !isDialogOpen"
        />
      </div>
    </div>
  </div>
</template>
