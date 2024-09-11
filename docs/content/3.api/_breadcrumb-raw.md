```vue [components/Breadcrumbs.vue]
<script lang="ts" setup>
const links = useBreadcrumbItems() // uses the current route
</script>

<template>
  <nav aria-label="Breadcrumbs">
    <ul>
      <li v-for="(item, key) in items" :key="key">
        <NuxtLink v-bind="item">
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
```
