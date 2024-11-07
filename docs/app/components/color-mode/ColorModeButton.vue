<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const colorMode = useColorMode()

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
  <UTooltip :text="`Change to ${isDark ? 'light' : 'dark'} mode`">
    <UButton
      color="neutral"
      class="cursor-pointer"
      variant="ghost"
      v-bind="{
        ...$attrs,
      }"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      @click="isDark = !isDark"
    >
      <UIcon v-if="isDark" name="i-ph-moon-stars-duotone" class="w-5 h-5" />
      <UIcon v-else name="i-ph-sun-dim-duotone" class="w-5 h-5" />
    </UButton>
  </UTooltip>
</template>
