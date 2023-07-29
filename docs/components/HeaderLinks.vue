<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; links: { to: string; label: string }[] }>()
const emit = defineEmits(['update:modelValue'])

const isDialogOpen = useVModel(props, 'modelValue', emit)

const items = [useModuleList()]

const route = useRoute()
const isOgImage = computed(() => {
  return route.path.startsWith('/og-image')
})
const isExperiments = computed(() => {
  return route.path.startsWith('/experiments')
})
const isRobots = computed(() => {
  return route.path.startsWith('/robots')
})
const isSitemap = computed(() => {
  return route.path.startsWith('/sitemap')
})

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="flex items-center justify-between gap-3 h-16">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
          <svg height="25" width="25" class="d-inline-block mt-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#00DC82" d="M62.3,-53.9C74.4,-34.5,73.5,-9,67.1,13.8C60.6,36.5,48.7,56.5,30.7,66.1C12.7,75.7,-11.4,74.8,-31.6,65.2C-51.8,55.7,-67.9,37.4,-73.8,15.7C-79.6,-6,-75.1,-31.2,-61.1,-51C-47.1,-70.9,-23.6,-85.4,0.8,-86C25.1,-86.7,50.2,-73.4,62.3,-53.9Z" transform="translate(100 100)" />
          </svg>
          <span class="hidden sm:block">Nuxt</span><span class="sm:text-primary-500 dark:sm:text-primary-400">SEO</span>
        </NuxtLink>
      </div>
    </div>

    <!--    <div> -->
    <!--      <UDropdown mode="hover" :items="items" :popper="{ placement: 'bottom-start' }"> -->
    <!--        <UButton color="primary" label="Modules" variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid" /> -->
    <!--      </UDropdown> -->
    <!--    </div> -->

    <UBadge color="yellow" class="hidden sm:inline">
      Under construction
    </UBadge>

    <UButton to="/og-image/getting-started/installation" :variant="!isOgImage ? 'ghost' : 'outline'" class="md:block hidden">
      <span class="text-gray-700 dark:text-gray-200">OG Image</span>
    </UButton>

    <UButton to="/robots/getting-started/installation" :variant="!isRobots ? 'ghost' : 'outline'" class="md:block hidden">
      <span class="text-gray-700 dark:text-gray-200">Robots</span>
    </UButton>

    <UButton to="/sitemap/getting-started/installation" :variant="!isSitemap ? 'ghost' : 'outline'" class="md:block hidden">
      <span class="text-gray-700 dark:text-gray-200">Sitemap</span>
    </UButton>

    <UButton to="/experiments/getting-started/installation" :variant="!isExperiments ? 'ghost' : 'outline'" class="md:block hidden">
      <span class="text-gray-700 dark:text-gray-200">Experiments</span>
    </UButton>

    <div class="flex items-center justify-end -mr-1.5 gap-3">
      <DocsSearchButton class="ml-1.5 flex-1 lg:flex-none lg:w-48" />

      <div class="flex items-center lg:gap-1.5">
        <ColorModeButton />

        <UButton
          to="https://twitter.com/harlan_zw"
          target="_blank"
          color="gray"
          variant="ghost"
          class="hidden lg:inline-flex"
          icon="i-simple-icons-twitter"
        />

        <UButton
          to="https://github.com/harlan-zw"
          target="_blank"
          color="gray"
          variant="ghost"
          class="hidden lg:inline-flex"
          icon="i-simple-icons-github"
        />

        <UButton
          color="gray"
          variant="ghost"
          class="lg:hidden"
          :icon="isDialogOpen ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-bars-3-20-solid'"
          @click="isDialogOpen = !isDialogOpen"
        />
      </div>
    </div>
  </div>
</template>
