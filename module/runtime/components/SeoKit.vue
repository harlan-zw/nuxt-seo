<script lang="ts" setup>
import { useSeoKit } from '#imports'

const props = defineProps<{
  siteUrl?: string
  siteName?: string
  siteDescription?: string
  siteImage?: string
  titleSeparator?: string
  language?: string
}>()

useSeoKit(props)
</script>

<template>
  <div />
</template>
