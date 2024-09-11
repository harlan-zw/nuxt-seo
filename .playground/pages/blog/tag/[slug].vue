<script setup>
import { useBreadcrumbItems } from '#imports'

const links = useBreadcrumbItems()
</script>

<template>
  <pre>{{ links }}</pre>
</template>
