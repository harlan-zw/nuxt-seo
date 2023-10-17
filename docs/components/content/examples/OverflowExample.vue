<script lang="ts" setup>
import { defineBreadcrumbItems, useBreadcrumbsUi } from '#imports'

const items = defineBreadcrumbItems([
  { to: '/', icon: 'material-symbols:home-outline-rounded' },
  { to: '/blog', label: 'Blog', icon: 'material-symbols:book-outline' },
  { to: '/blog/my-awesome-article', label: 'My Awesome Article Title that Is so long that it needs to be truncated at some point or else!' },
])
const breadcrumbUi = useBreadcrumbsUi()
</script>

<template>
  <div>
    <SBreadcrumb label="Overflow Example" :items="items" :ui="breadcrumbUi" />
  </div>
</template>
