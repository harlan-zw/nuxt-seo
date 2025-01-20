<script setup lang="ts">
import { modules } from '../../src/const'

const { data: stats } = await useFetch('/api/stats')

const appConfig = useAppConfig()

provide('stats', stats)
provide('modules', modules)
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Header />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly />

    <Footer />
  </UApp>
</template>
