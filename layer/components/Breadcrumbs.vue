<script lang="ts" setup>
const breadcrumbs = useBreadcrumbs()
const schemaBreadcrumbs = computed(() => breadcrumbs.value.map(breadcrumb => breadcrumb.schema))

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: schemaBreadcrumbs,
  }),
])
</script>

<template>
  <ul
    v-if="breadcrumbs.length > 1"
    aria-label="Breadcrumb"
  >
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
</template>
