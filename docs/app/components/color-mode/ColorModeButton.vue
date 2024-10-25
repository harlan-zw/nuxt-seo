<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const colorMode = useColorMode()
const appConfig = useAppConfig()

// Computed

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UTooltip :text="`Change to ${isDark ? 'light' : 'dark'} mode`">
      <UButton
        :icon="isDark ? appConfig.ui.icons.dark : appConfig.ui.icons.light"
        color="neutral"
        class="cursor-pointer"
        variant="ghost"
        v-bind="{
          ...$attrs,
        }"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        @click="isDark = !isDark"
      />
    </UTooltip>
    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>
