<script setup lang="ts">
import { titleCase } from 'scule'
import { menu } from '~/composables/nav'

const navigation = computed(() => {
  return menu.value[1].children.map((item) => {
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

function mapPath(data, node = 0) {
  if (node < 1) {
    return mapPath(data[0].children, node + 1)
  }
  return data.map((item) => {
    if (item.children?.length && !item.page) {
      item.title = titleCase(item.title)
      item.children = mapPath(item.children, node + 1)
    }
    return {
      ...item,
      _path: item.path,
    }
  })
}

const { data: nav } = await useAsyncData(`docs-nav-learn`, () => queryCollectionNavigation('learn'), {
  default: () => [],
  transform(res) {
    const nav = mapPath(res, 0)
    return nav
  },
})

const route = useRoute()
const isOnSubPage = computed(() => {
  return route.path.split('/').length > 3 || route.path.startsWith('/learn/controlling-crawlers')
})
const subPageNav = computed(() => {
  if (!isOnSubPage.value) {
    return []
  }
  // find the nav that starts with the current path
  const currentPath = route.path.split('/').slice(0, 3).join('/')
  return [
    {
      title: 'Introduction',
      to: currentPath,
    },
    ...nav.value.find(item => item.path === currentPath)?.children || [],
  ]
})
</script>

<template>
  <UMain class="relative mb-20">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-900/30 pointer-events-none absolute w-full top-[1px] transition-all text-primary flex-shrink-0 opacity-100 duration-[400ms] opacity-30 z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="px-10">
      <UPage :ui="{ left: 'lg:col-span-3', center: 'lg:col-span-6' }">
        <template #left>
          <UPageAside class="max-w-[300px]">
            <div v-if="!isOnSubPage" class="mb-10 relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-5 py-3 gap-1">
              <div class="z-1 flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-ph-books-duotone" class="text-blue-300" />Learn
                    </div>
                  </div>
                </div>
              </div>
              <UContentNavigation :navigation="navigation" />
            </div>
            <div v-else class="relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-5 py-3 gap-1">
              <div class="z-1 flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-ph-books-duotone" class="text-blue-300" />Controlling Web Crawlers
                    </div>
                  </div>
                </div>
              </div>
              <UContentNavigation :navigation="subPageNav" />
            </div>
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </div>
  </UMain>
</template>
