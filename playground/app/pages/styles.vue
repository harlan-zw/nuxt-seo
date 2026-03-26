<template>
  <div class="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
    <!-- Page header -->
    <div class="animate-fade-up">
      <h2 class="text-xl font-semibold tracking-tight mb-1">
        Styles
      </h2>
      <p class="text-sm text-[var(--color-text-muted)]">
        CSS utilities and visual patterns for consistent devtools UI.
      </p>
    </div>

    <!-- Status indicators -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 50ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:status-change" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">.status-enabled / .status-disabled</span>
      </div>
      <div class="p-5 flex items-center gap-3">
        <span class="status-enabled">Enabled</span>
        <span class="status-disabled">Disabled</span>
      </div>
    </section>

    <!-- Hint callout -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 100ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:information" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">.hint-callout</span>
      </div>
      <div class="p-5">
        <div class="hint-callout">
          <UIcon name="carbon:information" class="hint-callout-icon text-lg" aria-hidden="true" />
          <p class="text-sm">
            This is a hint callout. Useful for tips and recommendations.
          </p>
        </div>
      </div>
    </section>

    <!-- Card styles -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 150ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:tile" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">.card / .glass</span>
      </div>
      <div class="p-5">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="card p-5">
            <p class="text-sm font-medium mb-1">Default Card</p>
            <p class="text-xs text-[var(--color-text-muted)]">Elevated surface with hover border shift and shadow.</p>
          </div>
          <div class="glass card p-5">
            <p class="text-sm font-medium mb-1">Glass Card</p>
            <p class="text-xs text-[var(--color-text-muted)]">Frosted glass with backdrop blur and saturation.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Links -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 200ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:launch" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">.link-external</span>
      </div>
      <div class="p-5">
        <a href="https://nuxtseo.com" target="_blank" rel="noopener" class="link-external text-sm">
          nuxtseo.com
        </a>
      </div>
    </section>

    <!-- Panel grids -->
    <section class="card overflow-hidden animate-fade-up" style="animation-delay: 250ms">
      <div class="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <UIcon name="carbon:grid" class="text-[var(--color-text-subtle)]" aria-hidden="true" />
        <span class="text-xs font-mono text-[var(--color-text-muted)]">.panel-grids</span>
      </div>
      <div class="panel-grids h-44 flex items-center justify-center">
        <p class="text-sm text-[var(--color-text-muted)]">Radial-masked grid background</p>
      </div>
    </section>
  </div>
</template>
