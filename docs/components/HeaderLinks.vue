<script setup lang="ts">
const props = defineProps<{ modelValue: boolean, links: { to: string, label: string }[] }>()
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
const githubStars = useRuntimeConfig().public.moduleStats.find(m => m.id === 'seo-kit')?.stats?.stars
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
        <span class="text-gray-700 dark:text-gray-200">Nuxt SEO Module</span>
      </UButton>

      <UDropdown mode="hover" :items="[items]" :popper="{ placement: 'bottom-start' }">
        <template #item="{ item }">
          <span class="truncate">{{ item.label }}</span>
          <Icon :name="item.icon" class="flex-shrink-0 group-hover:text-blue-500 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
        </template>
        <UButton label="Modules" variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid" />
      </UDropdown>

    <!--    <UButton to="/experiments/getting-started/installation" :variant="!isExperiments ? 'outline' : 'outline'" color="purple" class="md:block relative hidden"> -->
    <!--      Become a Nuxt SEO Pro -->
    <!--    </UButton> -->
    </div>

    <div class="flex items-center justify-end -mr-1.5 gap-3">
      <LegoGithubStar v-slot="{ stars }" repo="harlan-zw/nuxt-seo-kit" class="hidden md:flex mr-5 group border dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 hover:bg-gray-200 dark:bg-gray-900 bg-gray-100 transition rounded-lg text-sm justify-center">
        <div class="flex items-center transition rounded-l px-2 py-1 space-x-1">
          <Icon name="uil:star" class="group-hover:op75 " />
          <div>Star</div>
        </div>
        <div class="px-2 py-1 dark:bg-black/20 bg-white rounded-r-lg">
          {{ githubStars || stars }}
        </div>
      </LegoGithubStar>
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
