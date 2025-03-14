<script setup lang="ts">
// convert to typescript props
withDefaults(defineProps<{
  colorMode?: 'dark' | 'light'
  title?: string
  description?: string
  icon?: string | boolean
  version?: string
  moduleName?: string
  theme?: string
  publishedOn?: string
}>(), {
  colorMode: 'dark',
  theme: '#00dc82',
  title: 'title',
})
</script>

<template>
  <div
    class="w-full h-full flex justify-between relative p-[60px] bg-neutral-900 text-neutral-100"
  >
    <div class="h-full w-full relative">
      <div class="flex flex-row justify-between items-center">
        <div class="text-[40px] flex items-center gap-3 flex-row">
          <UIcon mode="svg" class="text-blue-300 w-20 h-20" name="i-ph-robot-duotone" />
          <div>
            <div class="text-[36px] font-mono text-neutral-300">
              Controlling Web Crawlers
            </div>
          </div>
        </div>
      </div>
      <div class="flex-grow flex items-center justify-start">
        <div class="max-w-[800px] flex justify-center gap-7 flex-col">
          <div class="flex flex-row items-center">
            <UIcon mode="svg" class="text-blue-300 w-27 h-20" name="i-logos-nuxt-icon" />
            <UIcon mode="svg" class="text-blue-300 w-25 h-20" name="i-logos-vue" />
          </div>
          <div class="text-[100px] justify-center max-w-[700px] font-bold m-0 flex flex-row flex-wrap gap-4">
            Robots.txt
          </div>
          <div v-if="publishedOn" class="text-[25px] font-bold leading-[45px] max-w-[800px] opacity-70 m-0">
            {{ new Date(publishedOn).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
