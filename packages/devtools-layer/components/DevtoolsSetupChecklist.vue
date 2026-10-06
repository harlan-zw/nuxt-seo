<script setup lang="ts">
import { getSetupChecklist } from '../composables/checklist'

const { currentModule } = defineProps<{
  currentModule?: string
}>()

const { results, loading, evaluated, evaluate } = getSetupChecklist()

// Evaluate on mount if not already done
if (!evaluated.value)
  evaluate()
</script>

<template>
  <div class="setup-checklist">
    <UButton class="self-end" icon="carbon:renew" variant="ghost" size="xs" :loading="loading" @click="evaluate()">
      Refresh
    </UButton>
    <!-- Loading state -->
    <DevtoolsLoading v-if="loading" />

    <!-- Per-module sections -->
    <template v-else-if="evaluated">
      <DevtoolsSection
        v-for="result of results"
        :key="result.moduleSlug"
        :icon="result.moduleIcon"
        :text="result.moduleLabel"
        :open="result.requiredPending > 0 || result.moduleSlug === currentModule"
        :padding="false"
      >
        <template #actions>
          <DevtoolsChecklistBadge
            :required-pending="result.requiredPending"
            :recommended-pending="result.recommendedPending"
            :status="result.status"
          />
        </template>
        <div class="setup-checklist-items">
          <DevtoolsChecklistItem
            v-for="item of result.items.filter(item => item.status !== 'not-applicable' && (item.level === 'required' || item.status === 'passed'))"
            :key="item.id"
            :item="item"
          />
          <template v-if="result.recommendedPending > 0">
            <h3 class="px-2 pt-3 pb-1 text-xs font-medium text-[var(--color-text-muted)]">
              Optional tips
            </h3>
            <DevtoolsChecklistItem
              v-for="item of result.items.filter(item => item.level === 'recommended' && item.status === 'failed')"
              :key="item.id"
              :item="item"
            />
          </template>
        </div>
      </DevtoolsSection>
    </template>
  </div>
</template>

<style scoped>
.setup-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.setup-checklist-items {
  display: flex;
  flex-direction: column;
  padding: 0.125rem 0.25rem;
}
</style>
