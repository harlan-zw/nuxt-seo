<script setup lang="ts">
import { useModuleList } from '~/utils/data'

const modules = useModuleList()
</script>

<template>
<section class="py-5 sm:py-10 xl:py-20">
  <div class="xl:grid gap-8 lg:grid-cols-12 mx-auto w-full sm:px-6 lg:px-0 px-0">
    <div class="col-span-6 mb-10 lg:mb-0 flex flex-col justify-center">
      <p v-if="$slots.top" class="mb-2 text-center lg:text-left">
        <ContentSlot :use="$slots.top" unwrap="p" />
      </p>

      <h1 class="font-title text-gray-900 dark:text-gray-100 text-center text-4xl leading-25 font-extrabold tracking-tight sm:text-5xl lg:text-left lg:text-6xl" style="line-height: 1.3;">
        <span class="max-w-2xl">All the boring SEO stuff for Nuxt done.</span>
      </h1>

      <p class="text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
        Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.
      </p>

      <div class="mt-6 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6 lg:justify-start">
        <UButton size="lg" to="/get-started">
          Get started
        </UButton>

        <a href="/secondary" class="u-text-gray-500 hover:u-text-gray-700 py-px font-medium">
          Secondary
        </a>
      </div>
    </div>

    <Placeholder class="block-hero__right xl:col-span-6 max-w-full" />
  </div>
</section>
<section class="py-5 sm:py-10 xl:py-20">
  <h2 class="mb-10 text-3xl font-title">
    Modules
  </h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <ShowcaseCard v-for="(module, key) in modules" v-bind="module" :key="key">
      <div class="text-blue-300 group-hover:text-[1.25rem] group-hover:text-blue-500 transition-all relative">
        <template v-if="module.label === 'OG Image'">
        <div class="w-full h-full">
          <img :src="`${module.to}/__og_image__/og.png`" height="150" width="300" class="group-hover:scale-110 transition transform h-[150px] w-[300px] rounded-lg shadow-xl" alt="">
        </div>
        </template>
        <template v-else-if="module.label === 'Experiments'">
        <div class="w-full h-full">
          <img :src="`${module.to}/__og_image__/og.png`" height="150" width="300" class="group-hover:scale-110 transition transform h-[150px] w-[300px] rounded-lg shadow-xl" alt="">
        </div>
        </template>
        <template v-else>
        Coming soon
        </template>
      </div>
    </ShowcaseCard>
  </div>
</section>
</template>
