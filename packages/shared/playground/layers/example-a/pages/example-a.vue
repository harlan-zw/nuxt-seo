<script setup lang="ts">
const navItems = [{ value: 'overview', to: '/example-a', icon: 'carbon:dashboard', label: 'Overview' }]
</script>

<template>
  <DevtoolsLayout module-name="example-a" title="Example A" icon="carbon:bot" :nav-items="navItems" active-tab="overview">
    <NuxtPage />
  </DevtoolsLayout>
</template>
