<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { path } from 'nuxtseo-layer-devtools/composables/state'
import { gscMetricColors } from '../composables/colors'
import {
  dailyData,
  isConnected,
  isPageDataLoading,
  isPageDetailLoading,
  pageDataError,
  pageKeywords,
  pageTotals,
  proKeyConfigured,
} from '../composables/data'

const clickValues = computed(() => dailyData.value.map(d => d.clicks))
const currentPath = computed(() => path.value || '/')

const sparklineContainer = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(sparklineContainer)
const sparklineWidth = computed(() => Math.max(containerWidth.value - 100, 120))
</script>

<template>
  <div class="devtools-main-content space-y-5 p-5">
    <ProSetupGuide v-if="!proKeyConfigured || !isConnected" />

    <template v-else>
      <!-- Current page indicator -->
      <div class="flex items-center gap-2 text-sm">
        <span class="i-carbon-page text-muted" />
        <span class="text-muted">Viewing:</span>
        <code class="font-mono text-xs bg-muted/30 px-2 py-0.5 rounded">{{ currentPath }}</code>
      </div>

      <!-- Error state -->
      <DevtoolsAlert v-if="pageDataError" variant="error" icon="carbon:warning-alt">
        Failed to load traffic data. Check your Pro API key and GSC connection.
      </DevtoolsAlert>

      <!-- Metrics row -->
      <DevtoolsPanel title="Page Traffic" icon="carbon:analytics">
        <template v-if="isPageDataLoading">
          <div class="flex items-center gap-4">
            <div v-for="i in 4" :key="i" class="flex items-center gap-2">
              <div class="size-2.5 rounded-full bg-muted animate-pulse" />
              <div class="h-8 w-16 rounded bg-muted animate-pulse" />
              <div class="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </template>
        <template v-else-if="pageTotals">
          <ProMetricsRow :totals="pageTotals" />
        </template>
        <DevtoolsEmptyState v-else icon="carbon:chart-line">
          No traffic data for this page yet.
          <template #description>
            This page may not be indexed or may not have received any search traffic in the last 28 days.
          </template>
        </DevtoolsEmptyState>
      </DevtoolsPanel>

      <!-- Daily trend sparkline -->
      <DevtoolsPanel v-if="dailyData.length" title="28-Day Trend" icon="carbon:chart-line-smooth">
        <template v-if="isPageDetailLoading">
          <div class="h-8 w-full rounded bg-muted animate-pulse" />
        </template>
        <div v-else ref="sparklineContainer" class="flex items-center gap-4">
          <ProSparkline
            :values="clickValues"
            :color="gscMetricColors.clicks.hex"
            :width="sparklineWidth"
            :height="40"
          />
          <span class="text-xs text-muted whitespace-nowrap">Clicks / day</span>
        </div>
      </DevtoolsPanel>

      <!-- Top keywords for this page -->
      <DevtoolsPanel title="Top Keywords" icon="carbon:text-mining-applier">
        <ProKeywordsTable
          :rows="pageKeywords.slice(0, 10)"
          :loading="isPageDataLoading"
        />
      </DevtoolsPanel>
    </template>
  </div>
</template>
