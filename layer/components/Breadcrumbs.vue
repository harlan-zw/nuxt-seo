<script lang="ts" setup>
interface BreadcrumbsProps {
  showAtRoot?: boolean
}

defineProps<BreadcrumbsProps>()
const breadcrumbs = useBreadcrumbs()
const schemaBreadcrumbs = computed(() => breadcrumbs.value.map(breadcrumb => breadcrumb.schema))

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: schemaBreadcrumbs,
  }),
])
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ul v-if="showAtRoot || breadcrumbs.length > 1">
      <template
        v-for="(item, key) in breadcrumbs"
        :key="key"
      >
        <li>
          <slot name="breadcrumb" :to="item.to" :title="item.title" :last="key === breadcrumbs.length - 1" :first="key === 0">
            <NuxtLink :to="item.to">
              {{ item.title }}
            </NuxtLink>
          </slot>
        </li>
      </template>
    </ul>
  </nav>
</template>
