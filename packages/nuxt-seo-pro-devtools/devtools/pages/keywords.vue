<script setup lang="ts">
import { path } from 'nuxtseo-layer-devtools/composables/state'
import { isConnected, isPageDataLoading, pageKeywords, proKeyConfigured } from '../composables/data'

const currentPath = computed(() => path.value || '/')
const searchQuery = ref('')

const filteredRows = computed(() => {
  if (!searchQuery.value)
    return pageKeywords.value
  const q = searchQuery.value.toLowerCase()
  return pageKeywords.value.filter(r =>
    (r.queryCanonical || r.query || '').toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="devtools-main-content space-y-5 p-5">
    <ProSetupGuide v-if="!proKeyConfigured || !isConnected" />

    <template v-else>
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="i-carbon-page text-muted" />
          <span class="text-muted">Keywords for:</span>
          <code class="font-mono text-xs bg-muted/30 px-2 py-0.5 rounded">{{ currentPath }}</code>
        </div>
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            placeholder="Search keywords..."
            icon="i-carbon-search"
            size="sm"
            class="w-48"
          />
        </div>
      </div>

      <DevtoolsPanel :title="`All Keywords (${filteredRows.length})`" icon="carbon:text-mining-applier">
        <ProKeywordsTable
          :rows="filteredRows"
          :loading="isPageDataLoading"
        />
      </DevtoolsPanel>
    </template>
  </div>
</template>
