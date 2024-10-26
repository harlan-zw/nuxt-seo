<script setup lang="ts">
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import { humanNumber } from '~/composables/format'

defineProps<{
  value: { downloads: number }[]
}>()
</script>

<template>
  <VisXYContainer :data="value" class="overflow-visible w-full h-height w-[250px] xl:w-[500px]" height="250" width="500">
    <VisLine curve-type="basis" color="#057A55" :x="(d, i) => i" :y="d => d.downloads" :data="value" />
    <VisAxis :grid-line="false" type="y" :y="(d) => humanNumber(d.downloads)" position="right" label="Downloads" />
  </VisXYContainer>
</template>
