<script setup lang="ts">
import { isConnected, proKeyConfigured } from '../composables/data'
</script>

<template>
  <div>
    <DevtoolsAlert v-if="!proKeyConfigured" variant="warning" icon="carbon:locked">
      <div class="space-y-2">
        <p class="font-medium">
          Pro API key not configured
        </p>
        <p class="text-sm opacity-80">
          Add your Nuxt SEO Pro API key to see traffic and keyword data for your pages.
        </p>
        <div class="mt-3 p-3 rounded-lg bg-black/20 font-mono text-sm">
          <div class="text-muted mb-1">
            # .env
          </div>
          NUXT_SEO_PRO_KEY=nsp_your_key_here
        </div>
        <p class="text-xs opacity-60 mt-2">
          Find your API key at nuxtseo.com/pro/dashboard/account
        </p>
      </div>
    </DevtoolsAlert>

    <DevtoolsAlert v-else-if="!isConnected" variant="info" icon="carbon:cloud-off">
      <div class="space-y-2">
        <p class="font-medium">
          GSC not connected
        </p>
        <p class="text-sm opacity-80">
          Your API key is valid but Google Search Console is not connected yet.
          Connect GSC in your Pro dashboard to see traffic data.
        </p>
        <a
          href="https://nuxtseo.com/pro/dashboard"
          target="_blank"
          class="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          Open Pro Dashboard
          <span class="i-carbon-launch text-xs" />
        </a>
      </div>
    </DevtoolsAlert>
  </div>
</template>
