<script setup lang="ts">
// @ts-expect-error
import { transformContent } from '@nuxt/content/transformers'
import { camelCase, upperFirst } from 'scule'
import * as config from '#ui/ui.config'

const props = defineProps({
  slug: {
    type: String,
    default: null,
  },
})

const route = useRoute()

const slug = props.slug || route.params.slug[route.params.slug.length - 1]
const camelName = camelCase(slug)
const name = `S${upperFirst(camelName)}`

const preset = config[camelName]

const { data: ast } = await useAsyncData(`${name}-preset`, () => transformContent('content:_markdown.md', `
\`\`\`json
${JSON.stringify(preset, null, 2)}
\`\`\`\
`, {
  highlight: {
    theme: {
      light: 'material-theme-lighter',
      default: 'material-theme',
      dark: 'material-theme-palenight',
    },
  },
}))
</script>

<template>
  <ContentRenderer :value="ast" />
</template>
