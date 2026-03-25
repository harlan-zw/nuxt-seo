<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { moduleCatalog, showModuleSplash, switchToModule } from '../composables/modules'
import { isConnected } from '../composables/state'

const props = defineProps<{
  currentModule?: string
}>()

const panelRef = ref<HTMLElement>()
onClickOutside(panelRef, () => {
  showModuleSplash.value = false
})

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
          <div class="splash-header">
            <NuxtSeoLogo class="h-7" />
            <p class="splash-subtitle">
              All the SEO modules you need for Nuxt, in one place.
            </p>
          </div>

          <div class="splash-grid">
            <button
              v-for="mod of moduleCatalog"
              :key="mod.name"
              type="button"
              class="splash-module"
              :class="{
                'is-installed': mod.installed,
                'is-current': mod.name === currentModule,
                'is-unavailable': !mod.installed,
                'is-switchable': mod.installed && mod.name !== currentModule && isConnected,
              }"
              :disabled="!mod.installed || mod.name === currentModule"
              @click="handleModuleClick(mod)"
            >
              <div class="splash-module-icon">
                <UIcon :name="mod.icon" class="text-xl" />
              </div>
              <div class="splash-module-info">
                <div class="splash-module-title">
                  {{ mod.title }}
                  <UBadge v-if="mod.pro" size="xs" color="neutral" variant="outline" class="ml-1 text-[9px]">
                    PRO
                  </UBadge>
                </div>
                <div class="splash-module-desc">
                  {{ mod.description }}
                </div>
              </div>
              <div class="splash-module-status">
                <span v-if="mod.name === currentModule" class="splash-current-badge">Current</span>
                <UIcon v-else-if="mod.installed && isConnected" name="carbon:arrow-right" class="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <span v-else-if="!mod.installed" class="splash-not-installed">Not installed</span>
              </div>
            </button>
          </div>

          <div class="splash-footer">
            <a href="https://nuxtseo.com" target="_blank" rel="noopener" class="splash-link">
              <UIcon name="carbon:earth" class="w-3.5 h-3.5" />
              nuxtseo.com
            </a>
            <button type="button" class="splash-close" @click="showModuleSplash = false">
              Close
              <UIcon name="carbon:close" class="w-3.5 h-3.5" />
            </button>
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
  width: min(580px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.2);
}

.dark .splash-panel {
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.5);
}

.splash-header {
  padding: 1.5rem 1.5rem 0;
  text-align: center;
}

.splash-subtitle {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.splash-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 1rem 0.75rem;
}

.splash-module {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
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
}

.splash-module.is-current {
  background: oklch(from var(--seo-green) l c h / 0.08);
}

.splash-module.is-unavailable {
  opacity: 0.45;
}

.splash-module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
  transition: color 100ms;
}

.splash-module.is-current .splash-module-icon {
  background: oklch(from var(--seo-green) l c h / 0.15);
  color: var(--seo-green);
}

.splash-module-info {
  flex: 1;
  min-width: 0;
}

.splash-module-title {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.splash-module-desc {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  margin-top: 1px;
}

.splash-module-status {
  flex-shrink: 0;
}

.splash-current-badge {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--seo-green);
}

.splash-not-installed {
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
}

.splash-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

.splash-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 100ms;
}

.splash-link:hover {
  color: var(--seo-green);
}

.splash-close {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.splash-close:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
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
