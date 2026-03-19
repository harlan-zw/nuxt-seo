<script setup lang="ts">
const { t } = useI18n()
// @ts-expect-error uses default component
defineOgImage()
</script>

<template>
  <div>
    <h1>{{ (t as Function)('welcome') }}</h1>
  </div>
</template>
