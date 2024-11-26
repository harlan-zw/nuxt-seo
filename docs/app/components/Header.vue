<script setup lang="ts">
import { ref } from 'vue'
import { menu } from '../composables/nav'

const stats = inject('stats', ref())
const route = useRoute()

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
      <div class="hidden lg:block">
        <UNavigationMenu :ui="{ viewport: 'min-w-[600px]' }" :items="menu.slice(0, 3)" class="justify-center" />
      </div>
    </template>

    <template #content>
      <DocsSidebarHeader v-if="route.path.startsWith('/docs')" />
      <UContentNavigation :navigation="navigation" />
    </template>

    <template #right>
      <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
        <div class="hidden lg:block">
          <UNavigationMenu :items="menu.slice(3)" :ui="{ viewport: 'min-w-[500px] -left-full' }" class="justify-center" />
        </div>
        <UTooltip text="Star on GitHub">
          <UButton class="hidden sm:block" to="https://github.com/harlan-zw/nuxt-seo" target="_blank" color="primary" variant="ghost">
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

          <UTooltip text="Harlan's X">
            <UButton
              class="hidden sm:block"
              aria-label="Harlan's X"
              to="https://twitter.com/harlan_zw"
              target="_blank"
              color="neutral"
              variant="ghost"
              icon="i-carbon-logo-x"
            />
          </UTooltip>

          <UTooltip text="Open Nuxt SEO on GitHub">
            <UButton
              aria-label="Nuxt SEO on GitHub"
              to="https://github.com/harlan-zw/nuxt-seo"
              target="_blank"
              color="neutral"
              variant="ghost"
              class="hidden lg:inline-flex transition opacity-85"
              icon="i-carbon-logo-github"
            />
          </UTooltip>

          <UTooltip text="Join Harlan's Discord">
            <UButton
              aria-label="Harlan's Discord"
              to="https://discord.com/invite/275MBUBvgP"
              target="_blank"
              color="neutral"
              variant="ghost"
              class="hidden lg:inline-flex transition opacity-85"
              icon="i-carbon-logo-discord"
            />
          </UTooltip>
        </div>
      </div>
    </template>
  </UHeader>
</template>
