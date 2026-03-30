<script setup lang="ts">
import { path } from 'nuxtseo-layer-devtools/composables/state'
import { gscMetricColors } from '../composables/colors'
import { isConnected, isSitePagesLoading, proKeyConfigured, sitePagesError, siteTotals, topPages } from '../composables/data'
import { formatNumber, getPath } from '../composables/formatting'

const currentPath = computed(() => path.value || '/')
const searchQuery = ref('')

const sortColumn = ref<string>('clicks')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(col: string) {
  if (sortColumn.value === col) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  }
  else {
    sortColumn.value = col
    sortDir.value = 'desc'
  }
}

function sortIcon(col: string) {
  if (sortColumn.value !== col)
    return 'i-carbon-arrows-vertical'
  return sortDir.value === 'desc' ? 'i-carbon-arrow-down' : 'i-carbon-arrow-up'
}

const sortedPages = computed(() => {
  let pages = topPages.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    pages = pages.filter(r => (r.page || '').toLowerCase().includes(q))
  }
  const col = sortColumn.value as keyof (typeof pages)[number]
  const dir = sortDir.value === 'desc' ? -1 : 1
  return [...pages].sort((a, b) => {
    const av = (a[col] as number) ?? 0
    const bv = (b[col] as number) ?? 0
    return (av - bv) * dir
  })
})
</script>

<template>
  <div class="devtools-main-content space-y-5 p-5">
    <ProSetupGuide v-if="!proKeyConfigured || !isConnected" />

    <template v-else>
      <!-- Site totals -->
      <DevtoolsPanel v-if="siteTotals" title="Site Traffic (28d)" icon="carbon:analytics">
        <ProMetricsRow :totals="siteTotals" />
      </DevtoolsPanel>

      <DevtoolsAlert v-if="sitePagesError" variant="error" icon="carbon:warning-alt">
        Failed to load page data. Check your Pro API key and GSC connection.
      </DevtoolsAlert>

      <div class="flex items-center justify-between gap-4">
        <h3 class="text-sm font-medium">
          Top Pages
        </h3>
        <UInput
          v-model="searchQuery"
          placeholder="Search pages..."
          icon="i-carbon-search"
          size="sm"
          class="w-48"
        />
      </div>

      <DevtoolsPanel>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-muted uppercase tracking-wider">
                <th class="pb-2 pr-4 font-medium">
                  Page
                </th>
                <th
                  class="pb-2 px-2 font-medium cursor-pointer select-none text-right whitespace-nowrap"
                  @click="toggleSort('clicks')"
                >
                  <span class="inline-flex items-center gap-1">
                    <span class="size-1.5 rounded-full" :class="gscMetricColors.clicks.dot" />
                    Clicks
                    <span class="text-[10px]" :class="sortIcon('clicks')" />
                  </span>
                </th>
                <th
                  class="pb-2 px-2 font-medium cursor-pointer select-none text-right whitespace-nowrap"
                  @click="toggleSort('impressions')"
                >
                  <span class="inline-flex items-center gap-1">
                    <span class="size-1.5 rounded-full" :class="gscMetricColors.impressions.dot" />
                    Impr.
                    <span class="text-[10px]" :class="sortIcon('impressions')" />
                  </span>
                </th>
                <th
                  class="pb-2 px-2 font-medium cursor-pointer select-none text-right whitespace-nowrap"
                  @click="toggleSort('position')"
                >
                  <span class="inline-flex items-center gap-1">
                    <span class="size-1.5 rounded-full" :class="gscMetricColors.position.dot" />
                    Pos.
                    <span class="text-[10px]" :class="sortIcon('position')" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isSitePagesLoading">
                <tr v-for="i in 8" :key="i">
                  <td class="py-2 pr-4">
                    <div class="h-4 rounded bg-muted animate-pulse" :style="{ width: `${80 + i * 20}px` }" />
                  </td>
                  <td class="py-2 px-2 text-right">
                    <div class="h-4 w-8 rounded bg-muted animate-pulse ml-auto" />
                  </td>
                  <td class="py-2 px-2 text-right">
                    <div class="h-4 w-10 rounded bg-muted animate-pulse ml-auto" />
                  </td>
                  <td class="py-2 px-2 text-right">
                    <div class="h-4 w-8 rounded bg-muted animate-pulse ml-auto" />
                  </td>
                </tr>
              </template>
              <template v-else-if="sortedPages.length">
                <tr
                  v-for="row in sortedPages"
                  :key="row.page"
                  class="border-t border-border/50 hover:bg-muted/30 transition-colors"
                  :class="{ 'bg-primary/5': getPath(row.page || '') === currentPath }"
                >
                  <td class="py-2 pr-4 font-mono text-xs truncate max-w-[250px]" :title="row.page">
                    <span v-if="getPath(row.page || '') === currentPath" class="text-primary font-medium">
                      {{ getPath(row.page || '') }}
                    </span>
                    <span v-else>{{ getPath(row.page || '') }}</span>
                  </td>
                  <td class="py-2 px-2 text-right tabular-nums">
                    {{ formatNumber(row.clicks) }}
                  </td>
                  <td class="py-2 px-2 text-right tabular-nums text-muted">
                    {{ formatNumber(row.impressions) }}
                  </td>
                  <td class="py-2 px-2 text-right">
                    <ProPositionBadge :position="row.position" />
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-8 text-center text-muted text-sm">
                  No page data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DevtoolsPanel>
    </template>
  </div>
</template>
