<script setup lang="ts">
import { ref } from 'vue'
import { standaloneUrl } from '../composables/state'

const urlInput = ref(standaloneUrl.value || 'http://localhost:3000')
const error = ref('')
const connecting = ref(false)

async function connect() {
  error.value = ''
  connecting.value = true
  const url = urlInput.value.replace(/\/+$/, '')
  try {
    // Verify the dev server is reachable
    await fetch(url, { mode: 'no-cors', signal: AbortSignal.timeout(5000) })
    standaloneUrl.value = url
  }
  catch {
    error.value = `Could not reach ${url}. Is the dev server running?`
  }
  finally {
    connecting.value = false
  }
}
</script>

<template>
  <div class="standalone-connect">
    <div class="standalone-connect-card">
      <UIcon name="carbon:plug" class="text-4xl text-[var(--seo-green)]" />
      <h2 class="text-lg font-semibold">
        Connect to Dev Server
      </h2>
      <p class="text-sm text-[var(--color-text-muted)] text-center max-w-sm leading-relaxed">
        Running in standalone mode. Enter the URL of your Nuxt dev server to start inspecting.
      </p>
      <form class="standalone-connect-form" @submit.prevent="connect">
        <UInput
          v-model="urlInput"
          placeholder="http://localhost:3000"
          size="lg"
          icon="carbon:link"
          class="flex-1"
          :disabled="connecting"
        />
        <UButton
          type="submit"
          icon="carbon:connect"
          size="lg"
          :loading="connecting"
        >
          Connect
        </UButton>
      </form>
      <p v-if="error" class="text-xs text-[var(--color-warning)] text-center max-w-sm">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.standalone-connect {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.standalone-connect-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  max-width: 28rem;
  width: 100%;
}

.standalone-connect-form {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}
</style>
