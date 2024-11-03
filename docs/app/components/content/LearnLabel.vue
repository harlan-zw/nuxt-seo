<script lang="ts" setup>
const props = defineProps<{
  to: string
  label: string
  icon: string
  size?: 'sm' | 'md' | 'lg'
}>()

const textAttrs = computed(() => {
  switch (props.size || 'md') {
    case 'sm': return { class: 'text-sm' }
    case 'md': return { class: 'text-base' }
    case 'lg': return { class: 'text-lg' }
    default: return {}
  }
})

const iconAttrs = computed(() => {
  switch (props.size || 'md') {
    case 'sm': return { class: 'w-4 h-4' }
    case 'md': return { class: 'w-8 h-8' }
    case 'lg': return { class: 'w-5 h-5' }
    default: return {}
  }
})
</script>

<template>
  <div class="flex justify-center">
    <NuxtLink :to="to" class="mx-auto relative inline-flex transition-all hover:shadow-lg flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-3 py-2 gap-1">
      <div class="z-1 flex flex-col justify-between h-full">
        <div>
          <div class=" items-center justify-between mb-1">
            <div class="flex gap-1 flex gap-2" v-bind="textAttrs">
              <UIcon :name="icon" class="text-blue-500 dark:text-blue-300 mt-1" v-bind="iconAttrs" />
              <div>
                <div>{{ label }}</div>
                <div class="text-xs font-light mb-2">
                  10 min read
                </div>
              </div>
            </div>
            <div class="text-xs font-light max-w-[300px]">
              Being able to tell crawlers what to do can help with your SEO strategy, learn how to do it in Vue and Nuxt.
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
