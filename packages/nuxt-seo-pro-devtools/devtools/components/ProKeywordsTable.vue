<script setup lang="ts">
import type { GscdumpDataRow } from '../composables/types'
import { gscMetricColors } from '../composables/colors'
import { formatCtr, formatNumber } from '../composables/formatting'

const { rows, loading = false } = defineProps<{
  rows: GscdumpDataRow[]
  loading?: boolean
}>()

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

const sortedRows = computed(() => {
  const col = sortColumn.value as keyof GscdumpDataRow
  const dir = sortDir.value === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = (a[col] as number) ?? 0
    const bv = (b[col] as number) ?? 0
    return (av - bv) * dir
  })
})

function sortIcon(col: string) {
  if (sortColumn.value !== col)
    return 'i-carbon-arrows-vertical'
  return sortDir.value === 'desc' ? 'i-carbon-arrow-down' : 'i-carbon-arrow-up'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs text-muted uppercase tracking-wider">
          <th class="pb-2 pr-4 font-medium">
            Keyword
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
            @click="toggleSort('ctr')"
          >
            <span class="inline-flex items-center gap-1">
              <span class="size-1.5 rounded-full" :class="gscMetricColors.ctr.dot" />
              CTR
              <span class="text-[10px]" :class="sortIcon('ctr')" />
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
        <template v-if="loading">
          <tr v-for="i in 5" :key="i">
            <td class="py-2 pr-4">
              <div class="h-4 rounded bg-muted animate-pulse" :style="{ width: `${60 + i * 15}px` }" />
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
            <td class="py-2 px-2 text-right">
              <div class="h-4 w-8 rounded bg-muted animate-pulse ml-auto" />
            </td>
          </tr>
        </template>
        <template v-else-if="sortedRows.length">
          <tr
            v-for="row in sortedRows"
            :key="row.queryCanonical || row.query"
            class="border-t border-border/50 hover:bg-muted/30 transition-colors"
          >
            <td class="py-2 pr-4 font-mono text-xs truncate max-w-[200px]" :title="row.queryCanonical || row.query">
              {{ row.queryCanonical || row.query }}
            </td>
            <td class="py-2 px-2 text-right tabular-nums">
              {{ formatNumber(row.clicks) }}
            </td>
            <td class="py-2 px-2 text-right tabular-nums text-muted">
              {{ formatNumber(row.impressions) }}
            </td>
            <td class="py-2 px-2 text-right tabular-nums text-muted">
              {{ formatCtr(row.ctr) }}
            </td>
            <td class="py-2 px-2 text-right">
              <ProPositionBadge :position="row.position" />
            </td>
          </tr>
        </template>
        <tr v-else>
          <td colspan="5" class="py-8 text-center text-muted text-sm">
            No keyword data for this page
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
