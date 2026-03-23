<script setup lang="ts">
import { hostname, host, path, base, refreshTime, previewSource, productionUrl, hasProductionUrl, isProductionMode } from '../../packages/shared/src/layer-devtools/composables/state'

const stateItems = computed(() => [
  { label: 'hostname', value: hostname, type: 'string' as const },
  { label: 'host', value: host.value, type: 'string' as const },
  { label: 'path', value: path.value, type: 'string' as const },
  { label: 'base', value: base.value, type: 'string' as const },
  { label: 'refreshTime', value: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(refreshTime.value), type: 'string' as const },
  { label: 'previewSource', value: previewSource.value, type: 'string' as const },
  { label: 'productionUrl', value: productionUrl.value || '(empty)', type: productionUrl.value ? 'string' as const : 'muted' as const },
  { label: 'hasProductionUrl', value: hasProductionUrl.value, type: 'boolean' as const },
  { label: 'isProductionMode', value: isProductionMode.value, type: 'boolean' as const },
])
</script>

<template>
  <div class="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
    <!-- Page header -->
    <div class="animate-fade-up">
      <h2 class="text-xl font-semibold tracking-tight mb-1">
        State
      </h2>
      <p class="text-sm text-[var(--color-text-muted)]">
        Reactive composable values from the devtools layer.
      </p>
    </div>

    <div class="card overflow-hidden animate-fade-up" style="animation-delay: 50ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:data-table" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">composables/state.ts</span>
      </div>
      <div class="divide-y divide-[var(--color-border-subtle)]">
        <div
          v-for="item in stateItems"
          :key="item.label"
          class="flex items-center justify-between px-5 py-3 group hover:bg-[var(--color-surface-sunken)] transition-colors"
        >
          <span class="text-sm font-mono text-[var(--color-text-muted)]">{{ item.label }}</span>
          <span
            class="text-sm font-mono"
            :class="{
              'text-[var(--seo-green)]': item.type === 'boolean' && item.value === true,
              'text-[oklch(65%_0.15_25)]': item.type === 'boolean' && item.value === false,
              'text-[var(--color-text-subtle)]': item.type === 'muted',
            }"
          >
            {{ item.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
