<script lang="ts" setup>
import { defineBreadcrumbItems, useBreadcrumbsUi } from '#imports'

const items = defineBreadcrumbItems([
  { to: '/', icon: 'material-symbols:home-outline-rounded' },
  { to: '/blog', label: 'Blog', icon: 'material-symbols:book-outline' },
  { to: '/blog/categories', label: 'Categories' },
  { to: '/blog/categories/tech', label: 'Technology Articles' },
  { to: '/blog/categories/tech/my-awesome-article', label: 'My Awesome Article Title', current: true },
])
const breadcrumbUi = useBreadcrumbsUi()
</script>

<template>
  <div>
    <SBreadcrumb label="Visible Items Example" :items="items" :ui="breadcrumbUi" />
  </div>
</template>
