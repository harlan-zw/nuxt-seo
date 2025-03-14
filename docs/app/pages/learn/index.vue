<script lang="ts" setup>
definePageMeta({
  layout: 'learn',
})

const { data: nav } = await useAsyncData(`learn`, () => queryCollectionNavigation('learn', [
  'description',
  'icon',
]), {
  default: () => [],
})
</script>

<template>
  <div class="max-w-[66ch]">
    <UPageHeader title="Learn SEO" description="Learn more about the SEO fundamentals that power Nuxt SEO." :ui="{ title: 'text-center text-balance xl:leading-normal min-w-full', description: 'text-center ' }" />
    <UPageBody prose class="pb-0">
      <Ads />
      <div class="space-y-5">
        <div v-for="(item, key) in nav[0].children" :key="key">
          <NuxtLink :to="item.path" class="relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-5 py-3 gap-1">
            <div class="z-1 flex flex-col justify-between h-full">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-1">
                    <UIcon :name="item.icon || 'i-ph-books'" class="text-blue-300" />{{ item.title }}
                  </div>
                </div>
              </div>
              <div class="text-sm font-light text-neutral-400">
                {{ item.description }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </UPageBody>
  </div>
</template>
