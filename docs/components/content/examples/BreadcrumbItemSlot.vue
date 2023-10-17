<script lang="ts" setup>
const items = useBreadcrumbItems()
</script>

<template>
  <SBreadcrumb :items="items" :ui="useBreadcrumbsUi()">
    <template #item="{ to, label }">
      <NuxtLink :to="to" class="text-gray-600 dark:text-gray-400 hover:underline hover:text-gray-700">
        {{ label }}
      </NuxtLink>
    </template>
  </SBreadcrumb>
</template>
