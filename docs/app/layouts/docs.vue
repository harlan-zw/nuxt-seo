<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const nav = inject<Ref<NavItem[]>>('navigation')
// const { navDirFromPath } = useContentHelpers()

const route = useRoute()
function navDirFromPath(path: string, tree: NavItem[]): NavItem[] | undefined {
  for (const file of tree) {
    if (file.path === path) { return file.children }

    if (file.children) {
      const result = navDirFromPath(path, file.children)
      if (result) { return result }
    }
  }
}
function transformNav(tree: NavItem[]) {
  // we flatten the first children on to the start of the tree
  const children = tree[0]?.children
  tree[0] = false
  if (children) {
    tree = [...children, ...tree]
  }
  return tree.filter(Boolean)
}
const navigation = computed(() => {
  const tree = navDirFromPath(route.path.split('/').slice(0, 3).join('/'), nav?.value?.[0]?.children)
  return transformNav([...(tree || [])])
})
</script>

<template>
  <UMain>
    <div class="">
      <UPage :ui="{ left: 'lg:col-span-3', center: 'lg:col-span-6' }">
        <template #left>
          <UPageAside class="max-w-[300px]">
            <UContentNavigation :navigation="navigation" highlight :collapsible="false" />
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </div>
    <Ads class="hidden w-[180px] lg:inline-block fixed bottom-5 right-5" />
  </UMain>
</template>
