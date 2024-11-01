<script setup lang="ts">
import { VisArea, VisXYContainer } from '@unovis/vue'

defineProps<{
  value: number[]
  width: number
}>()
</script>

<template>
  <VisXYContainer :height="40" :width="width" :data="value" class="transition-all opacity-50 group-hover:opacity-100 rounded overflow-hidden">
    <VisArea curve-type="basis" color="#057A55" :x="(d, i) => i" :y="d => d" :data="value" />
  </VisXYContainer>
</template>
