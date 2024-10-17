```vue [components/Breadcrumbs.vue]
<script lang="ts" setup>
const links = useBreadcrumbItems() // uses the current route
</script>

<template>
  <UBreadcrumb :links="links" />
</template>
```
