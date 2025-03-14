<script setup lang="ts">
import type { NuxtError } from '#app'
import { modules } from '../../src/const'

const props = defineProps<{
  error: NuxtError
}>()

const appConfig = useAppConfig()

useSeoMeta({
  title: props.error.message,
  description: 'We are sorry but this page could not be found.',
})

// Provide
provide('modules', modules)
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Header class="z-100" />
    <NuxtLayout>
      <UContainer>
        <UMain class="flex flex-col items-center justify-center">
          <div class="mb-14">
            <h1>{{ error.statusCode === 404 ? 'Oops... we can\'t find that.' : 'Uh oh, looks like an error :(' }}</h1>
            <div v-if="error.statusCode !== 404">
              {{ error.message }}
            </div>
            <div v-else>
              Go back <NuxtLink to="/" class="underline">
                home
              </NuxtLink>.
            </div>
          </div>
        </UMain>
      </UContainer>
    </NuxtLayout>

    <ClientOnly />

    <Footer />
  </UApp>
</template>
