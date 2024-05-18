```vue [components/Breadcrumbs.vue]
<script lang="ts" setup>
const links = useBreadcrumbItems() // uses the current route
</script>

<template>
  <nav aria-label="Breadcrumbs">
    <ul>
      <li v-for="(link, key) in links" :key="key">
        <NuxtLink v-bind="link">
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
```
