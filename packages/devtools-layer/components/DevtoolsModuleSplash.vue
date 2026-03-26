<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import { moduleCatalog, showModuleSplash, switchToModule } from '../composables/modules'
import { isConnected } from '../composables/state'

const props = defineProps<{
  currentModule?: string
}>()

const panelRef = ref<HTMLElement>()
onClickOutside(panelRef, () => {
  showModuleSplash.value = false
})

const coreModules = computed(() => moduleCatalog.value.filter(m => !m.pro))
const proModules = computed(() => moduleCatalog.value.filter(m => m.pro))

function handleModuleClick(mod: typeof moduleCatalog.value[0]) {
  if (!mod.installed || mod.name === props.currentModule)
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

          <!-- Modules Section -->
          <div class="splash-section">
            <div class="splash-section-label">
              <span class="splash-section-dot" />
              Modules
            </div>
            <div class="splash-grid">
              <button
                v-for="mod of coreModules"
                :key="mod.name"
                type="button"
                class="splash-module"
                :class="{
                  'is-current': mod.name === currentModule,
                  'is-unavailable': !mod.installed,
                  'is-switchable': mod.installed && mod.name !== currentModule && isConnected,
                }"
                :disabled="!mod.installed || mod.name === currentModule"
                @click="handleModuleClick(mod)"
              >
                <div class="splash-module-icon">
                  <UIcon :name="mod.icon" class="text-base" />
                </div>
                <span class="splash-module-title">{{ mod.title }}</span>
                <span v-if="mod.name === currentModule" class="splash-current-badge">Current</span>
                <span v-else-if="!mod.installed" class="splash-not-installed">Not installed</span>
              </button>
            </div>
          </div>

          <!-- Pro Section -->
          <div v-if="proModules.length" class="splash-section splash-pro-area">
            <div class="splash-section-label">
              <span class="splash-section-dot splash-section-dot--pro" />
              Pro
            </div>
            <div class="splash-grid">
              <button
                v-for="mod of proModules"
                :key="mod.name"
                type="button"
                class="splash-module"
                :class="{
                  'is-current': mod.name === currentModule,
                  'is-unavailable': !mod.installed,
                  'is-switchable': mod.installed && mod.name !== currentModule && isConnected,
                }"
                :disabled="!mod.installed || mod.name === currentModule"
                @click="handleModuleClick(mod)"
              >
                <div class="splash-module-icon">
                  <UIcon :name="mod.icon" class="text-base" />
                </div>
                <span class="splash-module-title">{{ mod.title }}</span>
                <UBadge size="xs" color="neutral" variant="outline" class="splash-pro-badge">
                  PRO
                </UBadge>
              </button>
            </div>
            <!-- Pro status / CTA -->
            <div class="splash-pro-status">
              <div class="splash-pro-status-inner">
                <UIcon name="carbon:locked" class="w-3.5 h-3.5 opacity-50" />
                <span>Unlock Pro modules with a license key</span>
              </div>
              <a href="https://nuxtseo.com/pro" target="_blank" rel="noopener" class="splash-pro-cta">
                Learn more
                <UIcon name="carbon:arrow-right" class="w-3 h-3" />
              </a>
            </div>
          </div>

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
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.2);
  overflow: hidden;
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

/* Sections */
.splash-section {
  padding: 0.5rem 0.75rem 0.625rem;
}

.splash-section + .splash-section {
  border-top: 1px solid var(--color-border);
}

.splash-section-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: 0.25rem 0.375rem 0.375rem;
}

.splash-section-dot {
  width: 0.3125rem;
  height: 0.3125rem;
  border-radius: 50%;
  background: var(--color-text-subtle);
}

.splash-section-dot--pro {
  background: var(--seo-green);
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
  opacity: 0.5;
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

.splash-pro-badge {
  font-size: 9px !important;
  flex-shrink: 0;
}

/* Pro status / CTA */
.splash-pro-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.375rem 0.25rem 0;
  padding: 0.4rem 0.625rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  font-size: 0.6875rem;
  color: var(--color-text-muted);
}

.splash-pro-status-inner {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.splash-pro-cta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--seo-green);
  text-decoration: none;
  transition: opacity 100ms;
}

.splash-pro-cta:hover {
  opacity: 0.8;
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
