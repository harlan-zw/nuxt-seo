<script lang="ts" setup>
import { defineBreadcrumbItems, useBreadcrumbsUi } from '#imports'

const items = defineBreadcrumbItems([
  { to: '/', ariaLabel: 'Home', icon: 'material-symbols:home-outline-rounded' },
  { to: '/blog', label: 'Blog', ariaLabel: 'Blog', icon: 'material-symbols:book-outline' },
  { to: '/blog/my-awesome-article', label: 'My Awesome Article', current: true },
])

const ui = useBreadcrumbsUi()
</script>

<template>
  <SBreadcrumb :items="items" :ui="ui" />
</template>
