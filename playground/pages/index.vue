<script setup lang="ts">
import { loadShiki } from '../../packages/shared/src/layer-devtools/composables/shiki'

await loadShiki()

const sampleKvItems = [
  { key: 'siteUrl', value: 'https://nuxtseo.com', copyable: true },
  { key: 'indexable', value: true },
  { key: 'trailingSlash', value: false },
  { key: 'env', value: 'development' },
  { key: 'version', value: '7.0.19', copyable: true },
  { key: 'apiKey', value: undefined },
]

const sampleKvWithLinks = [
  { key: 'sitemap.xml', value: '/sitemap.xml', link: 'http://localhost:3002/sitemap.xml' },
  { key: 'robots.txt', value: '/robots.txt', link: 'http://localhost:3002/robots.txt' },
  { key: 'documentation', value: 'nuxtseo.com', link: 'https://nuxtseo.com' },
]

const showPanel = ref(true)
</script>

<template>
  <div class="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
    <!-- Page header -->
    <div class="animate-fade-up">
      <h2 class="text-xl font-semibold tracking-tight mb-1">
        Components
      </h2>
      <p class="text-sm text-[var(--color-text-muted)]">
        Shared UI primitives for Nuxt SEO devtools panels.
      </p>
    </div>

    <!-- Alert -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 50ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:notification" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsAlert</span>
      </div>
      <div>
        <DevtoolsAlert variant="info">
          Site config detected from <code class="font-mono text-xs">nuxt.config.ts</code>
        </DevtoolsAlert>
        <DevtoolsAlert variant="warning">
          3 URLs returned 404 during last crawl
        </DevtoolsAlert>
        <DevtoolsAlert variant="success">
          All sitemaps validated successfully
        </DevtoolsAlert>
        <DevtoolsAlert variant="production">
          <template #default>
            Previewing production data
          </template>
          <template #action>
            <UButton size="xs" variant="soft">
              Switch
            </UButton>
          </template>
        </DevtoolsAlert>
      </div>
    </section>

    <!-- Empty State -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 100ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:search" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsEmptyState</span>
      </div>
      <div class="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border-subtle)]">
        <div class="py-10 px-6">
          <DevtoolsEmptyState
            title="No sitemaps found"
            description="Add URLs or sources to generate your first sitemap."
          >
            <UButton size="sm" color="primary" variant="soft">
              Add Source
            </UButton>
          </DevtoolsEmptyState>
        </div>
        <div class="py-10 px-6">
          <DevtoolsEmptyState
            icon="carbon:warning-alt"
            title="Connection failed"
            description="Could not reach the production server."
            variant="error"
          >
            <UButton size="sm" variant="soft">
              Retry
            </UButton>
          </DevtoolsEmptyState>
        </div>
      </div>
    </section>

    <!-- Snippet -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 150ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:terminal" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsSnippet</span>
      </div>
      <DevtoolsSnippet
        label="nuxt.config.ts"
        :code="JSON.stringify({ sitemap: { enabled: true, urls: ['/about', '/blog'] } }, null, 2)"
        lang="json"
      />
    </section>

    <!-- Toolbar -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 200ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:tool-box" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsToolbar</span>
      </div>
      <div>
        <DevtoolsToolbar>
          <div class="flex items-center gap-2">
            <UIcon name="carbon:filter" class="text-sm" aria-hidden="true" />
            <span class="text-sm font-medium">Sources</span>
            <DevtoolsMetric value="24" label="total" variant="default" />
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="carbon:add" size="xs">
              Add
            </UButton>
            <UButton icon="carbon:reset" size="xs" aria-label="Refresh" />
          </div>
        </DevtoolsToolbar>
        <DevtoolsToolbar variant="minimal">
          <span class="text-[var(--color-text-muted)]">Showing 24 of 24 URLs</span>
          <div class="flex items-center gap-2">
            <UButton icon="carbon:download" size="xs" variant="ghost" aria-label="Download" />
            <UButton icon="carbon:overflow-menu-vertical" size="xs" variant="ghost" aria-label="More options" />
          </div>
        </DevtoolsToolbar>
      </div>
    </section>

    <!-- Panel -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 250ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:side-panel-open" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsPanel</span>
      </div>
      <div class="p-5">
        <div v-if="!showPanel" class="flex justify-center">
          <UButton size="sm" variant="soft" @click="showPanel = true">
            Show Panel
          </UButton>
        </div>
        <DevtoolsPanel v-else title="URL Details" @close="showPanel = false">
          <template #actions>
            <DevtoolsCopyButton text="https://nuxtseo.com/about" />
          </template>
          <DevtoolsKeyValue
            :items="[
              { key: 'loc', value: 'https://nuxtseo.com/about', copyable: true },
              { key: 'lastmod', value: '2026-03-20' },
              { key: 'changefreq', value: 'weekly' },
              { key: 'priority', value: 0.8 },
            ]"
          />
        </DevtoolsPanel>
      </div>
    </section>

    <!-- Metrics -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 300ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:meter" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsMetric</span>
      </div>
      <div class="p-5 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <DevtoolsMetric value="24" label="URLs" icon="carbon:document" variant="default" />
          <DevtoolsMetric value="142ms" label="response" icon="carbon:time" variant="success" />
          <DevtoolsMetric value="3" label="warnings" icon="carbon:warning-alt" variant="warning" />
          <DevtoolsMetric value="1" label="error" icon="carbon:error" variant="danger" />
          <DevtoolsMetric value="v7.0.19" icon="carbon:tag" variant="info" />
        </div>
      </div>
    </section>

    <!-- Copy Button -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 350ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:copy" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsCopyButton</span>
      </div>
      <div class="p-5 flex items-center gap-4">
        <code class="text-sm font-mono bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded border border-[var(--color-border-subtle)]">npx nuxi module add @nuxtjs/seo</code>
        <DevtoolsCopyButton text="npx nuxi module add @nuxtjs/seo" />
      </div>
    </section>

    <!-- Key-Value -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 400ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:data-table" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsKeyValue</span>
      </div>
      <DevtoolsKeyValue :items="sampleKvItems" />
    </section>

    <!-- Key-Value with links -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 450ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:link" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsKeyValue (links)</span>
      </div>
      <DevtoolsKeyValue :items="sampleKvWithLinks" />
    </section>

    <!-- Loading -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 500ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:circle-dash" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsLoading</span>
      </div>
      <DevtoolsLoading />
    </section>

    <!-- Error states -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 550ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:warning" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsError</span>
      </div>
      <div class="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border-subtle)]">
        <DevtoolsError title="Default error" />
        <DevtoolsError
          icon="carbon:cloud-offline"
          title="Custom error"
          error="Could not connect to the server"
        />
      </div>
    </section>

    <!-- DevtoolsSection -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 600ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:collapse-all" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">DevtoolsSection</span>
      </div>
      <div class="p-4 space-y-4">
        <DevtoolsSection
          icon="carbon:load-balancer-application"
          text="Sitemap Sources"
          description="3 sources configured"
        >
          <template #actions>
            <DevtoolsMetric value="24" label="URLs" variant="success" />
          </template>
          <DevtoolsKeyValue
            :items="[
              { key: 'type', value: 'app' },
              { key: 'urls', value: 12 },
              { key: 'lastFetched', value: '2 min ago' },
            ]"
          />
        </DevtoolsSection>

        <DevtoolsSection
          icon="carbon:document"
          text="Static URLs"
          :open="false"
        >
          <p class="text-sm text-[var(--color-text-muted)]">
            No static URLs configured.
          </p>
        </DevtoolsSection>
      </div>
    </section>
  </div>
</template>
