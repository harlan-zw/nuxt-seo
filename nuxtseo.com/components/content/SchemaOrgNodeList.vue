<script lang="ts" setup>
const paths = [
  'Nodes',
  'Article',
  'Book',
  'Breadcrumb',
  'Comment',
  'Course',
  'Event',
  'Food Establishment',
  'How To',
  'Image',
  'Item List',
  'Job Posting',
  'Local Business',
  'Movie',
  'Organization',
  'Person',
  'Product',
  'Question',
  'Recipe',
  'Software App',
  'Video',
  'Webpage',
  'Website',
]

function normaliseToPath(s: string) {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
</script>

<template>
  <ul>
    <li v-for="(node, key) in paths" :key="key">
      <a :href="`https://unhead.unjs.io/schema-org/schema/${normaliseToPath(node)}`">
        {{ node }}
      </a>
    </li>
  </ul>
</template>
