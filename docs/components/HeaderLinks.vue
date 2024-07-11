<script setup lang="ts">
const props = defineProps<{ modelValue: boolean, links: { to: string, label: string }[] }>()
const emit = defineEmits(['update:modelValue'])

const isDialogOpen = useVModel(props, 'modelValue', emit)

const items = useModuleList()
  .filter(m => !['seo-kit', 'site-config'].includes(m.id))

const route = useRoute()
const isSetup = computed(() => {
  return route.path.startsWith('/nuxt-seo')
})
</script>

<template>
  <div class="flex items-center justify-between gap-2 h-16">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" title="Home" aria-label="Title" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
          <Logo />
        </NuxtLink>
      </div>
    </div>

    <div class="lg:space-x-5 space-x-2 lg:mr-5 pr-2 flex">
      <UButton to="/nuxt-seo/getting-started/what-is-nuxt-seo" :variant="!isSetup ? 'ghost' : 'outline'" class="md:block hover:bg-green-100 transition hidden space-x-2">
        <span class="text-gray-700 dark:text-gray-200">What is Nuxt SEO?</span>
      </UButton>

      <UPopover class="hidden md:block" mode="hover" :items="[items]" :popper="{ placement: 'bottom-start' }">
        <template #panel>
          <div class="p-4">
            <div class="lg:flex lg:space-x-7">
              <div class="flex flex-col gap-2">
                <NuxtLink to="/nuxt-seo/getting-started/installation" class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-950 rounded-lg">
                  <div class="flex font-semibold gap-1 mb-2 items-center">
                    <Logo />
                  </div>
                  <div class="text-xs opacity-60 ">
                    All the SEO modules combined into one.
                  </div>
                </NuxtLink>
                <NuxtLink to="/site-config/getting-started/installation" class="flex justify-start flex-col items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-950 rounded-lg text-left">
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
                  <NuxtLink v-for="(item, index) in items" :key="index" :to="item.to" class="flex items-start justify-start space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-950 rounded-lg">
                    <Icon :name="item.icon" class="text-blue-300 flex-shrink-0 group-hover:text-blue-500 h-6 w-6 dark:text-gray-500 ms-auto" />
                    <span class="truncate">{{ item.label }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </template>

        <UButton label="Modules" variant="ghost" color="none" class="hover:bg-green-100 dark:hover:bg-green-950 transition" trailing-icon="i-heroicons-chevron-down-20-solid" />
      </UPopover>
    </div>

    <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
      <LegoGithubStar v-slot="{ stars }" repo="harlan-zw/nuxt-seo" class="hidden lg:flex mr-5 group border dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 hover:bg-gray-200 dark:bg-gray-900 bg-gray-100 transition rounded-lg text-sm justify-center">
        <div class="flex items-center transition rounded-l px-2 py-1 space-x-1">
          <Icon name="uil:star" class="group-hover:op75 " />
          <div>Star</div>
        </div>
        <div class="px-2 py-1 dark:bg-black/20 bg-white rounded-r-lg">
          {{ stars }}
        </div>
      </LegoGithubStar>
      <DocsSearchButton class="ml-1.5 flex-1 lg:flex-none lg:w-48" />

      <div class="flex items-center lg:gap-1.5">
        <UColorModeButton />

        <UButton
          title="Twitter"
          aria-label="Twitter"
          to="https://twitter.com/harlan_zw"
          target="_blank"
          color="gray"
          variant="ghost"
          class="hidden lg:inline-flex"
          icon="i-simple-icons-twitter"
        />

        <UButton
          title="GitHub"
          aria-label="GitHub"
          to="https://github.com/harlan-zw/nuxt-seo"
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
          :aria-label="isDialogOpen ? 'Close Menu' : 'Open Menu'"
          :icon="isDialogOpen ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-bars-3-20-solid'"
          @click="isDialogOpen = !isDialogOpen"
        />
      </div>
    </div>
  </div>
</template>
