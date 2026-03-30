<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { onClickOutside, useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { getSetupChecklist } from '../composables/checklist'
import { moduleCatalog, showModuleSplash, switchToModule } from '../composables/modules'
import { isConnected } from '../composables/state'

const props = defineProps<{
  currentModule?: string
}>()

const panelRef = ref<HTMLElement>()
onClickOutside(panelRef, () => {
  showModuleSplash.value = false
})

const allModules = computed(() => moduleCatalog.value)

const selectedForInstall = ref(new Set<string>())

const installCommand = computed(() => {
  if (!selectedForInstall.value.size)
    return ''
  const names = Array.from(selectedForInstall.value, name => moduleCatalog.value.find(m => m.name === name)?.npm).filter(Boolean)
  return `npx nuxt module add ${names.join(' ')}`
})

const { copy, copied } = useClipboard({ source: installCommand })

const { summary, evaluated, evaluate, getModuleResultByName } = getSetupChecklist()

// Evaluate checklist on first splash open
const hasEvaluated = ref(false)
watch(showModuleSplash, (open) => {
  if (open && !hasEvaluated.value) {
    hasEvaluated.value = true
    evaluate()
  }
})

const activeTab = ref('modules')

const healthBadge = computed(() => {
  if (!evaluated.value || summary.value.total === 0)
    return undefined
  if (summary.value.requiredPending > 0)
    return { label: `${summary.value.requiredPending}`, color: 'error' as const, variant: 'subtle' as const }
  if (summary.value.recommendedPending > 0)
    return { label: `${summary.value.recommendedPending}`, color: 'warning' as const, variant: 'subtle' as const }
  return { label: '', icon: 'i-carbon-checkmark', color: 'success' as const, variant: 'subtle' as const }
})

const tabs = computed<TabsItem[]>(() => {
  const items: TabsItem[] = [
    { label: 'Modules', value: 'modules', icon: 'i-carbon-grid' },
  ]
  if (evaluated.value && summary.value.total > 0) {
    items.push({
      label: 'Setup',
      value: 'setup',
      icon: 'i-carbon-task-complete',
      badge: healthBadge.value,
    })
  }
  return items
})

function handleModuleClick(mod: typeof moduleCatalog.value[0]) {
  if (!mod.installed) {
    const set = new Set(selectedForInstall.value)
    if (set.has(mod.name))
      set.delete(mod.name)
    else
      set.add(mod.name)
    selectedForInstall.value = set
    return
  }
  if (mod.name === props.currentModule)
    return
  switchToModule(mod.name)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="splash">
      <div v-if="showModuleSplash" class="splash-overlay">
        <div ref="panelRef" class="splash-panel">
          <!-- Header -->
          <div class="splash-header">
            <NuxtSeoLogo class="h-5" />
            <button type="button" class="splash-header-close" @click="showModuleSplash = false">
              <UIcon name="carbon:close" class="w-4 h-4" />
            </button>
          </div>

          <!-- Tabs -->
          <UTabs
            v-model="activeTab"
            variant="link"
            size="sm"
            :content="false"
            :items="tabs"
            :ui="{
              root: 'splash-tabs',
              trigger: 'splash-tab-trigger',
            }"
          />

          <!-- Modules tab -->
          <div v-show="activeTab === 'modules'" class="splash-tab-content">
            <div class="splash-grid">
              <button
                v-for="mod of allModules"
                :key="mod.name"
                type="button"
                class="splash-module"
                :class="{
                  'is-current': mod.name === currentModule,
                  'is-unavailable': !mod.installed && !selectedForInstall.has(mod.name) && mod.name !== currentModule,
                  'is-selected-install': selectedForInstall.has(mod.name),
                  'is-switchable': mod.installed && mod.name !== currentModule && isConnected,
                }"
                :disabled="mod.name === currentModule"
                @click="handleModuleClick(mod)"
              >
                <div class="splash-module-icon">
                  <UIcon :name="mod.icon" class="text-base" />
                </div>
                <span class="splash-module-title">{{ mod.title }}</span>
                <DevtoolsChecklistBadge
                  v-if="mod.installed && evaluated && getModuleResultByName(mod.name)"
                  :required-pending="getModuleResultByName(mod.name)!.requiredPending"
                  :recommended-pending="getModuleResultByName(mod.name)!.recommendedPending"
                />
                <span v-else-if="mod.name === currentModule" class="splash-current-badge">Current</span>
                <span v-else-if="!mod.installed" class="splash-not-installed">{{ selectedForInstall.has(mod.name) ? 'Selected' : 'Not installed' }}</span>
              </button>
            </div>

            <!-- Install command -->
            <Transition name="install-bar">
              <div v-if="installCommand" class="splash-install">
                <div class="splash-install-code">
                  <code>{{ installCommand }}</code>
                </div>
                <button type="button" class="splash-install-copy" @click="copy()">
                  <UIcon :name="copied ? 'carbon:checkmark' : 'carbon:copy'" class="w-3.5 h-3.5" />
                  {{ copied ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Setup tab -->
          <div v-show="activeTab === 'setup'" class="splash-tab-content">
            <div v-if="evaluated && summary.total > 0" class="splash-health-header">
              <span class="splash-health-bar">
                <span
                  class="splash-health-bar-fill"
                  :class="summary.requiredPending > 0 ? 'is-danger' : summary.recommendedPending > 0 ? 'is-warning' : 'is-complete'"
                  :style="{ width: `${summary.total > 0 ? (summary.passed / summary.total) * 100 : 0}%` }"
                />
              </span>
              <span class="splash-health-count">{{ summary.passed }}/{{ summary.total }} complete</span>
            </div>
            <DevtoolsSetupChecklist :current-module="currentModule" />
          </div>

          <!-- Pro ad -->
          <a href="https://nuxtseo.com/pro" target="_blank" rel="noopener" class="splash-pro-ad">
            <div class="splash-pro-ad-content">
              <UIcon name="i-carbon-chart-line-data" class="w-4 h-4 text-violet-500" />
              <div>
                <span class="splash-pro-ad-title">Nuxt SEO Pro</span>
                <span class="splash-pro-ad-desc">GSC analytics, indexing diagnostics, competitor tracking &amp; MCP server</span>
              </div>
            </div>
            <span class="splash-pro-ad-cta">
              Learn more
              <UIcon name="carbon:arrow-right" class="w-3 h-3" />
            </span>
          </a>

          <!-- Footer -->
          <div class="splash-footer">
            <a href="https://nuxtseo.com" target="_blank" rel="noopener" class="splash-link">
              <UIcon name="carbon:earth" class="w-3.5 h-3.5" />
              nuxtseo.com
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0% 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.splash-panel {
  width: min(480px, calc(100vw - 2rem));
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.2);
}

.dark .splash-panel {
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.5);
}

/* Header */
.splash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.splash-header-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.splash-header-close:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

/* Tabs */
.splash-tabs {
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.splash-tab-trigger {
  font-size: 0.6875rem !important;
}

/* Tab content */
.splash-tab-content {
  padding: 0.5rem 0.75rem 0.625rem;
}

/* Grid */
.splash-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
}

/* Module items */
.splash-module {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-md);
  text-align: left;
  cursor: default;
  transition: background 100ms, opacity 100ms;
}

.splash-module.is-switchable {
  cursor: pointer;
}

.splash-module.is-switchable:hover {
  background: var(--color-surface-elevated);
}

.splash-module.is-switchable:hover .splash-module-icon {
  color: var(--seo-green);
  background: oklch(from var(--seo-green) l c h / 0.12);
}

.splash-module.is-current {
  background: oklch(from var(--seo-green) l c h / 0.08);
}

.splash-module.is-unavailable {
  opacity: 0.4;
  cursor: pointer;
}

.splash-module.is-unavailable:hover {
  opacity: 0.7;
  background: var(--color-surface-elevated);
}

.splash-module.is-selected-install {
  opacity: 1;
  background: oklch(from var(--seo-green) l c h / 0.08);
  cursor: pointer;
}

.splash-module.is-selected-install .splash-module-icon {
  background: oklch(from var(--seo-green) l c h / 0.15);
  color: var(--seo-green);
}

.splash-module.is-selected-install .splash-not-installed {
  color: var(--seo-green);
  font-weight: 600;
}

.splash-module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
  transition: color 100ms, background 100ms;
}

.splash-module.is-current .splash-module-icon {
  background: oklch(from var(--seo-green) l c h / 0.15);
  color: var(--seo-green);
}

.splash-module-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
}

.splash-current-badge {
  font-size: 0.5625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--seo-green);
  flex-shrink: 0;
}

.splash-not-installed {
  font-size: 0.625rem;
  color: var(--color-text-subtle);
  flex-shrink: 0;
}

/* Setup Health header */
.splash-health-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.splash-health-bar {
  flex: 1;
  height: 0.25rem;
  border-radius: 2px;
  background: var(--color-surface-sunken);
  overflow: hidden;
}

.splash-health-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.splash-health-bar-fill.is-complete {
  background: oklch(55% 0.15 145);
}

.dark .splash-health-bar-fill.is-complete {
  background: oklch(65% 0.18 145);
}

.splash-health-bar-fill.is-warning {
  background: oklch(65% 0.18 85);
}

.splash-health-bar-fill.is-danger {
  background: oklch(60% 0.2 25);
}

.splash-health-count {
  font-size: 0.5625rem;
  font-family: var(--font-mono, monospace);
  font-weight: 600;
  color: var(--color-text-subtle);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Install bar */
.splash-install {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  border: 1px solid oklch(from var(--seo-green) l c h / 0.2);
}

.splash-install-code {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.splash-install-code code {
  font-size: 0.6875rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-text);
  white-space: nowrap;
}

.splash-install-copy {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--seo-green);
  background: oklch(from var(--seo-green) l c h / 0.1);
  cursor: pointer;
  transition: background 100ms;
}

.splash-install-copy:hover {
  background: oklch(from var(--seo-green) l c h / 0.18);
}

.install-bar-enter-active,
.install-bar-leave-active {
  transition: opacity 150ms ease, max-height 150ms ease;
  overflow: hidden;
}

.install-bar-enter-from,
.install-bar-leave-to {
  opacity: 0;
  max-height: 0;
}

.install-bar-enter-to,
.install-bar-leave-from {
  max-height: 4rem;
}

/* Pro ad */
.splash-pro-ad {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.375rem 0.75rem 0;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-md);
  background: oklch(65% 0.25 290 / 0.06);
  border: 1px solid oklch(65% 0.25 290 / 0.12);
  text-decoration: none;
  transition: border-color 100ms, background 100ms;
}

.splash-pro-ad:hover {
  background: oklch(65% 0.25 290 / 0.1);
  border-color: oklch(65% 0.25 290 / 0.2);
}

.splash-pro-ad-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
}

.splash-pro-ad-title {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text);
}

.splash-pro-ad-desc {
  display: block;
  font-size: 0.625rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.splash-pro-ad-cta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 500;
  color: oklch(65% 0.25 290);
  white-space: nowrap;
}

/* Footer */
.splash-footer {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--color-border);
}

.splash-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 100ms;
}

.splash-link:hover {
  color: var(--seo-green);
}

/* Transitions */
.splash-enter-active {
  transition: opacity 200ms ease;
}

.splash-enter-active .splash-panel {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
}

.splash-leave-active {
  transition: opacity 150ms ease;
}

.splash-leave-active .splash-panel {
  transition: transform 150ms ease, opacity 150ms ease;
}

.splash-enter-from {
  opacity: 0;
}

.splash-enter-from .splash-panel {
  transform: scale(0.95);
  opacity: 0;
}

.splash-leave-to {
  opacity: 0;
}

.splash-leave-to .splash-panel {
  transform: scale(0.97);
  opacity: 0;
}
</style>
