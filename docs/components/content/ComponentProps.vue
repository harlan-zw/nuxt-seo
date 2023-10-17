<script setup lang="ts">
import { camelCase, upperFirst } from 'scule'

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

const meta = await fetchComponentMeta(name)
</script>

<template>
  <div>
    <FieldGroup>
      <ComponentPropsField v-for="prop in meta?.meta?.props" :key="prop.name" :prop="prop" />
    </FieldGroup>
  </div>
</template>
