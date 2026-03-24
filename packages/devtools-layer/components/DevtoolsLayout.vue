<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import { colorMode } from '../composables/rpc'
import { hasProductionUrl, isProductionMode, previewSource, productionUrl } from '../composables/state'

export interface DevtoolsNavItem {
  value: string
  to?: string
  icon: string
  label: string
  devOnly?: boolean
}

const {
  title,
  icon,
  version,
  navItems,
  githubUrl,
  loading = false,
} = defineProps<{
  title: string
  icon: string
  version?: string
  navItems: DevtoolsNavItem[]
  githubUrl: string
  loading?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const activeTab = defineModel<string>('activeTab')

const isDark = computed(() => colorMode.value === 'dark')

useHead({
  title: `Nuxt ${title}`,
  htmlAttrs: {
    class: () => isDark.value ? 'dark' : '',
  },
})

const filteredNavItems = computed(() =>
  isProductionMode.value
    ? navItems.filter(item => !item.devOnly)
    : navItems,
)

const productionHostname = computed(() => {
  try {
    return new URL(productionUrl.value).hostname
  }
  catch {
    return productionUrl.value
  }
})

const isRouteNav = computed(() => navItems.some(item => item.to))

const modeDropdownOpen = ref(false)
const modeDropdownRef = ref<HTMLElement>()
onClickOutside(modeDropdownRef, () => {
  modeDropdownOpen.value = false
})

function selectMode(mode: 'local' | 'production') {
  previewSource.value = mode
  modeDropdownOpen.value = false
}
</script>

<template>
  <UApp>
    <div class="relative bg-base flex flex-col min-h-screen">
      <div class="gradient-bg" />

      <header class="devtools-header glass sticky top-0 z-50">
        <div class="devtools-header-content">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3 sm:gap-4">
            <a
              href="https://nuxtseo.com"
              target="_blank"
              rel="noopener"
              aria-label="Nuxt SEO"
              class="flex items-center opacity-90 hover:opacity-100 transition-opacity"
            >
              <NuxtSeoLogo class="h-6 sm:h-7" />
            </a>

            <div class="devtools-divider" />

            <div class="flex items-center gap-2">
              <div class="devtools-brand-icon" aria-hidden="true">
                <UIcon :name="icon" class="text-base sm:text-lg" />
              </div>
              <h1 class="text-sm sm:text-base font-semibold tracking-tight text-[var(--color-text)]">
                {{ title }}
              </h1>
              <UBadge
                v-if="version"
                class="font-mono text-[10px] sm:text-xs hidden sm:inline-flex"
              >
                v{{ version }}
              </UBadge>
              <div v-if="hasProductionUrl" ref="modeDropdownRef" class="mode-dropdown-wrapper">
                <button type="button" class="devtools-mode-btn" @click="modeDropdownOpen = !modeDropdownOpen">
                  <UIcon :name="isProductionMode ? 'carbon:cloud' : 'carbon:laptop'" class="w-3.5 h-3.5" />
                  <span class="hidden sm:inline">{{ isProductionMode ? 'Production' : 'Local' }}</span>
                  <template v-if="isProductionMode">
                    <span class="devtools-production-badge">
                      <span class="devtools-production-dot" />
                      {{ productionHostname }}
                    </span>
                  </template>
                  <UIcon name="carbon:chevron-down" class="w-3 h-3 opacity-50 transition-transform" :class="modeDropdownOpen ? 'rotate-180' : ''" />
                </button>
                <Transition name="dropdown">
                  <div v-if="modeDropdownOpen" class="mode-dropdown-menu">
                    <button type="button" class="mode-dropdown-item" @click="selectMode('local')">
                      <UIcon name="carbon:laptop" class="w-4 h-4" />
                      <span>Local</span>
                    </button>
                    <button type="button" class="mode-dropdown-item" @click="selectMode('production')">
                      <UIcon name="carbon:cloud" class="w-4 h-4" />
                      <span>Production</span>
                      <span class="devtools-production-badge text-[10px]">
                        <span class="devtools-production-dot" />
                        {{ productionHostname }}
                      </span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <!-- Nav Tabs -->
            <div class="devtools-nav-tabs">
              <template v-if="isRouteNav">
                <NuxtLink
                  v-for="item of filteredNavItems"
                  :key="item.value"
                  :to="item.to"
                  class="devtools-nav-tab"
                  :class="[
                    activeTab === item.value ? 'active' : '',
                    loading ? 'opacity-50 pointer-events-none' : '',
                  ]"
                >
                  <UTooltip :text="item.label">
                    <div class="devtools-nav-tab-inner">
                      <UIcon
                        :name="item.icon"
                        class="text-base sm:text-lg"
                        :class="activeTab === item.value ? 'text-[var(--seo-green)]' : ''"
                      />
                      <span class="devtools-nav-label">{{ item.label }}</span>
                    </div>
                  </UTooltip>
                </NuxtLink>
              </template>
              <template v-else>
                <button
                  v-for="item of filteredNavItems"
                  :key="item.value"
                  type="button"
                  class="devtools-nav-tab"
                  :class="[
                    activeTab === item.value ? 'active' : '',
                    loading ? 'opacity-50 pointer-events-none' : '',
                  ]"
                  @click="activeTab = item.value"
                >
                  <UTooltip :text="item.label">
                    <div class="devtools-nav-tab-inner">
                      <UIcon
                        :name="item.icon"
                        class="text-base sm:text-lg"
                        :class="activeTab === item.value ? 'text-[var(--seo-green)]' : ''"
                      />
                      <span class="devtools-nav-label">{{ item.label }}</span>
                    </div>
                  </UTooltip>
                </button>
              </template>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <slot name="actions" />

              <UTooltip text="Refresh">
                <UButton
                  icon="carbon:reset"
                  aria-label="Refresh"
                  class="devtools-nav-action"
                  @click="emit('refresh')"
                />
              </UTooltip>

              <UTooltip text="GitHub">
                <UButton
                  icon="simple-icons:github"
                  aria-label="GitHub"
                  :to="githubUrl"
                  target="_blank"
                  class="devtools-nav-action hidden sm:flex"
                />
              </UTooltip>
            </div>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <div class="devtools-main">
        <main class="devtools-main-content">
          <DevtoolsLoading v-if="loading" />
          <div v-show="!loading">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </UApp>
</template>

<style scoped>
.mode-dropdown-wrapper {
  position: relative;
}

.mode-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 180px;
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.12);
  z-index: 100;
}

.dark .mode-dropdown-menu {
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.4);
}

.mode-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.mode-dropdown-item:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.dropdown-enter-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.dropdown-leave-active {
  transition: opacity 100ms ease, transform 100ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
