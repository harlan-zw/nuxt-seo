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
          />
        </template>
        <div class="setup-checklist-items">
          <DevtoolsChecklistItem
            v-for="item of result.items"
            :key="item.id"
            :item="item"
          />
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
