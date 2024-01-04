<script lang="ts" setup>
import { schemaAutoImports } from '@unhead/schema-org/vue'

const nodes = schemaAutoImports.filter(s => s !== 'useSchemaOrg')
</script>

<template>
  <ul>
    <li v-for="(node, key) in nodes" :key="key">
      <a :href="node">
        {{ node }}
      </a>
    </li>
  </ul>
</template>
