<script setup lang="ts">
import { defu } from 'defu'
import { titleCase } from 'scule'

function mapPath(data) {
  return data.map((item) => {
    if (item.children?.length && !item.page) {
      item.title = titleCase(item.title)
      item.children = mapPath(item.children)
    }
    return {
      ...item,
      _path: item.path,
    }
  })
}

const { data: nav } = await useAsyncData(`docs-nav-learn`, () => queryCollectionNavigation('learn', [
  'icon',
]), {
  default: () => [],
  transform(res) {
    // firstly we need to merge the children on the path key
    const children = res[0].children
    // map as an object path => data, merge data
    const mappedChildren = children.reduce((acc, item) => {
      if (!acc[item.path]) {
        acc[item.path] = item
      }
      else {
        acc[item.path] = defu(acc[item.path], item)
        // filter the children, they shouldn't contain the item.path
      }
      return acc
    }, {})
    return mapPath(Object.values(mappedChildren)).map(item => item.children.map(c => ({ icon: 'i-ph-dot-outline-duotone', ...c })))
  },
})

const route = useRoute()
const breadcrumbs = useBreadcrumbItems({
  overrides: computed(() => {
    const segments = route.path.split('/')
    const parent = nav.value.flat().find(i => i.path === segments.slice(0, 3).join('/'))
    const currItem = nav.value.flat().find(i => i.path === route.path)
    return [
      null,
      {
        icon: 'i-ph-books-duotone',
        label: 'Learn SEO',
      },
      parent,
      { label: currItem?.title },
    ]
  }),
})
</script>

<template>
  <UMain class="relative mb-20">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-900/30 pointer-events-none absolute w-full top-[1px] transition-all text-(--ui-primary) flex-shrink-0 opacity-100 duration-[400ms] opacity-30 z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="px-10">
      <UPage :ui="{ left: 'lg:col-span-3', center: 'lg:col-span-6' }">
        <template #left>
          <UPageAside class="max-w-[300px]">
            <div class="mb-10 relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-5 py-3 gap-1">
              <div class="z-1 flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-ph-books-duotone" class="text-blue-300" />Learn SEO
                    </div>
                  </div>
                </div>
              </div>
              <div class="space-y-5">
                <div v-for="(section, key) in nav" :key="key">
                  <UContentNavigation :navigation="section" />
                </div>
              </div>
            </div>
          </UPageAside>
        </template>
        <UBreadcrumb :items="breadcrumbs" class="mt-10" />
        <slot />
      </UPage>
    </div>
  </UMain>
</template>
