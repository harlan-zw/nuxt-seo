<script setup lang="ts">
import { gscMetricColors } from '../composables/colors'
import { calcTrendPercent, fmtGscMetric } from '../composables/formatting'

const { totals, prevTotals } = defineProps<{
  totals: { clicks: number, impressions: number, ctr: number, position: number } | null
  prevTotals?: { clicks: number, impressions: number, ctr: number, position: number } | null
}>()

const metrics = computed(() => {
  if (!totals)
    return []

  const items = [
    { key: 'clicks' as const, label: 'Clicks', inverted: false },
    { key: 'impressions' as const, label: 'Impressions', inverted: false },
    { key: 'ctr' as const, label: 'CTR', inverted: false },
    { key: 'position' as const, label: 'Position', inverted: true },
  ]

  return items.map(({ key, label, inverted }) => ({
    dotColor: gscMetricColors[key].dot,
    value: fmtGscMetric(totals[key], key),
    label,
    trend: prevTotals ? calcTrendPercent(totals[key], prevTotals[key], inverted) : null,
    trendInverted: inverted,
  }))
})
</script>

<template>
  <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
    <template v-for="(item, i) in metrics" :key="i">
      <div v-if="i > 0" class="w-px self-stretch bg-[var(--color-border)] hidden sm:block" />
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="size-2.5 rounded-full" :class="item.dotColor" />
        <span class="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
          {{ item.value }}
        </span>
        <div class="flex flex-col">
          <span class="text-[10px] font-semibold text-muted uppercase tracking-[0.12em]">
            {{ item.label }}
          </span>
          <span
            v-if="item.trend != null && item.trend !== 0"
            class="text-xs tabular-nums"
            :class="item.trend > 0 ? 'text-green-400' : 'text-red-400'"
          >
            {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
