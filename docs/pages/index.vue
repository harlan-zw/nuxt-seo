<script setup lang="ts">
import { useModuleList } from '~/utils/data'
import { useFps } from '#imports'

const modules = useModuleList()

const robotState = ref({
  hover: false,
  robots: [''], // start with 1
})
// empty array of 10 entries
provide('robots', robotState)

const { pause, resume } = useIntervalFn(() => {
  // cap it at 30 bots
  if (robotState.value.robots.length >= 30)
    return

  robotState.value.robots.push('')
}, 750, {
  immediate: false,
})
watch(() => robotState.value.hover, () => {
  if (robotState.value.hover) {
    resume()
  }
  else {
    pause()
    robotState.value.robots = ['']
  }
}, {
  deep: true,
})

// avoid dropping frames
const fps = useFps()
const interval = computed(() => 1000 / fps.value)
</script>

<template>
  <section class="py-5 sm:py-10 xl:py-20">
    <div class="xl:grid gap-8 lg:grid-cols-12 mx-auto w-full sm:px-6 lg:px-0 px-0">
      <div class="col-span-6 lg:mr-10 mb-10 lg:mb-0 flex flex-col justify-center">
        <p v-if="$slots.top" class="mb-2 text-center lg:text-left">
          <ContentSlot :use="$slots.top" unwrap="p" />
        </p>

        <h1 class="font-title text-gray-900 dark:text-gray-100 text-center text-4xl leading-25 font-extrabold tracking-tight sm:text-5xl lg:text-left lg:text-6xl" style="line-height: 1.3;">
          <span class="max-w-2xl">All the boring SEO stuff for Nuxt done.</span>
        </h1>
        <p class="text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
          Nuxt SEO is a collection of hand-crafted  <Icon name="logos:nuxt-icon" /> Nuxt Modules to help you rank higher in search engines.
        </p>

        <div class="mt-6 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6 lg:justify-start">
          <UButton size="lg" to="/">
            Get started
          </UButton>
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
      <ShowcaseCard v-for="(module, key) in modules" v-bind="module" :key="key" class="group">
        <template v-if="module.icon">
          <Icon :name="module.icon" size="150" :class="module.label === 'Robots' ? ['transition group-hover:opacity-0'] : []" />
        </template>
        <template #teleport>
          <!--        todo -->
          <!--          <template v-if="module.label === 'OG Image'"> -->
          <!--          <img :src="`${module.to}/__og_image__/og.png`" height="150" width="300" class="hidden group-hover:block fixed z-100 group-hover:scale-150 transition transform h-[150px] w-[300px] rounded-lg shadow-xl" alt=""> -->
          <!--          </template> -->
          <template v-if="module.label === 'Robots'">
            <BouncingBots v-for="(_, k) in robotState.robots" :key="k" icon="noto:robot" :interval="interval" />
          </template>
        </template>
      </ShowcaseCard>
    </div>
  </section>
</template>
