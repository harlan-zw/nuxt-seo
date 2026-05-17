<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('about'),
  description: () => t('aboutDescription'),
})
</script>

<template>
  <div>
    <h1>{{ t('about') }}</h1>
    <p>{{ t('aboutBody') }}</p>
  </div>
</template>
