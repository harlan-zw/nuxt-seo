<script lang="ts" setup>
import { useBreadcrumbItems } from '#imports'

const links = useBreadcrumbItems()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 w-full backdrop-blur flex-none border-b border-gray-900/10 dark:border-gray-50/[0.06] bg-white/75 dark:bg-gray-900/75">
      <div class="py-3">
        <div class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white">
          <div class="text-primary-500 dark:text-primary-400">
            SEO
          </div>
        </div>
      </div>
    </header>
    <main class="min-h-full h-full flex-grow">
      <div class="mt-4">
        <UBreadcrumb :links="links" class="mb-5" />
        <div>
          <NuxtPage />
        </div>
      </div>
    </main>
  </div>
</template>
