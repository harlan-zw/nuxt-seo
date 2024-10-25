<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  class?: any
}>()

const slots = useSlots()
// const { ui, attrs } = useUI('content.codeGroup', undefined, config, toRef(props, 'class'), true)

const selectedIndex = ref(0)

// Computed

const tabs = computed(() => slots.default?.().map((slot, index) => {
  return {
    label: slot.props?.filename || slot.props?.label || `${index}`,
    icon: slot.props?.icon,
    component: slot,
  }
}) || [])

const selectedTab = computed(() => tabs.value.find((_, index) => index === selectedIndex.value))
</script>

<template>
  <div>
    <div>
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        tabindex="-1"
        @click="selectedIndex = index"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <component :is="selectedTab?.component" v-if="selectedTab" hide-header />
  </div>
</template>
