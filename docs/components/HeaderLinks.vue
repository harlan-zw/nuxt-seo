<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; links: { to: string; label: string }[] }>()
const emit = defineEmits(['update:modelValue'])

const isDialogOpen = useVModel(props, 'modelValue', emit)

const items = useModuleList()
  .filter(m => !!m.to)
  .map((m) => {
    return {
      label: m.label,
      to: m.to,
      icon: m.icon,
    }
  })

const route = useRoute()
const isSetup = computed(() => {
  return route.path.startsWith('/nuxt-seo')
})
const isUiElements = computed(() => {
  return route.path.startsWith('/ui-elements')
})
// const isOgImage = computed(() => {
//   return route.path.startsWith('/og-image')
// })
// const isExperiments = computed(() => {
//   return route.path.startsWith('/experiments')
// })
// const isRobots = computed(() => {
//   return route.path.startsWith('/robots')
// })
// const isSitemap = computed(() => {
//   return route.path.startsWith('/sitemap')
// })
// const isSchemaOrg = computed(() => {
//   return route.path.startsWith('/schema-org')
// })
// const isLinkChecker = computed(() => {
//   return route.path.startsWith('/link-checker')
// })
</script>

<template>
  <div class="flex items-center justify-between gap-2 h-16">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
          <Logo />
          <span class="hidden sm:block">Nuxt</span><span class="sm:text-primary-500 dark:sm:text-primary-400">SEO</span>
        </NuxtLink>
      </div>
      <UBadge color="yellow" class="hidden sm:inline">
        WIP
      </UBadge>
    </div>

    <div class="space-x-5 flex">
      <UButton to="/nuxt-seo/getting-started/installation" :variant="!isSetup ? 'ghost' : 'outline'" class="md:block hidden">
        <span class="text-gray-700 dark:text-gray-200">Setup</span>
      </UButton>

      <UDropdown mode="hover" :items="[items]" :popper="{ placement: 'bottom-start' }">
        <template #item="{ item }">
          <span class="truncate">{{ item.label }}</span>
          <Icon :name="item.icon" class="flex-shrink-0 group-hover:text-blue-500 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
        </template>
        <UButton label="Modules" variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid" />
      </UDropdown>

      <UButton to="/ui-elements" :variant="!isUiElements ? 'ghost' : 'outline'" class="md:block hidden">
        <span class="text-gray-700 dark:text-gray-200">UI Elements</span>
      </UButton>

      <UButton to="https://unlighthouse.dev" target="_blank" variant="ghost" class="md:block hidden flex space-x-2 items-center">
        <span class="text-gray-700 dark:text-gray-200">Validate SEO</span>
        <Icon name="heroicons-outline:external-link" class="w-4 h-4 mb-1 text-gray-600" />
      </UButton>

    <!--    <UButton to="/experiments/getting-started/installation" :variant="!isExperiments ? 'outline' : 'outline'" color="purple" class="md:block relative hidden"> -->
    <!--      Become a Nuxt SEO Pro -->
    <!--    </UButton> -->
    </div>

    <div class="flex items-center justify-end -mr-1.5 gap-3">
      <DocsSearchButton class="ml-1.5 flex-1 lg:flex-none lg:w-48" />

      <div class="flex items-center lg:gap-1.5">
        <UColorModeButton />

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
