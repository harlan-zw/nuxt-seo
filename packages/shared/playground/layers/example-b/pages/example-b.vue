<script setup lang="ts">
const navItems = [{ value: 'overview', to: '/example-b', icon: 'carbon:dashboard', label: 'Overview' }]
</script>

<template>
  <DevtoolsLayout module-name="example-b" title="Example B" icon="carbon:plug" :nav-items="navItems" active-tab="overview">
    <NuxtPage />
  </DevtoolsLayout>
</template>
