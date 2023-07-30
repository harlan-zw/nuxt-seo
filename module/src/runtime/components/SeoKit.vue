<script lang="ts" setup>
import type { SiteConfigInput } from 'nuxt-site-config-kit'
import { useSeoKit } from '#imports'

const props = defineProps<{
  /**
   * @deprecated use url
   */
  siteUrl?: string
  /**
   * @deprecated use name
   */
  siteName?: string
  /**
   * @deprecated use description
   */
  siteDescription?: string
  /**
   * @deprecated use image
   */
  siteImage?: string
  /**
   * @deprecated use defaultLocale
   */
  language?: string
} & SiteConfigInput>()

// convert to new props
useSeoKit({
  url: props.url || props.siteUrl,
  name: props.name || props.siteName,
  description: props.description || props.siteDescription,
  defaultLocale: props.defaultLocale || props.language,
  titleSeparator: props.titleSeparator,
  image: props.siteImage,
})
</script>

<template>
  <div />
</template>
