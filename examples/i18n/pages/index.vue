<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('home'),
  description: () => t('homeDescription'),
})

defineOgImage('NuxtSeo')
</script>

<template>
  <div>
    <h1>{{ t('home') }}</h1>
    <p>{{ t('welcome') }}</p>
  </div>
</template>
