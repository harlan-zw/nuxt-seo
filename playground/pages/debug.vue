<template>
  <div class="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
    <!-- Page header -->
    <div class="animate-fade-up">
      <h2 class="text-xl font-semibold tracking-tight mb-1">
        Debug
      </h2>
      <p class="text-sm text-[var(--color-text-muted)]">
        Development-only panel, hidden in production mode.
      </p>
    </div>

    <div class="animate-fade-up" style="animation-delay: 50ms">
      <div class="hint-callout">
        <UIcon name="carbon:debug" class="hint-callout-icon text-lg" aria-hidden="true" />
        <div>
          <p class="text-sm mb-2">
            This tab has <code class="font-mono text-xs bg-[var(--color-surface-sunken)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">devOnly: true</code>
            on its nav item.
          </p>
          <p class="text-xs text-[var(--color-text-muted)]">
            When a production URL is set and production mode is active, this tab will be filtered from the navigation automatically by DevtoolsLayout.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
