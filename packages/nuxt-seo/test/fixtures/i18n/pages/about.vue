<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ (t as Function)('welcome') }}</h1>
  </div>
</template>
