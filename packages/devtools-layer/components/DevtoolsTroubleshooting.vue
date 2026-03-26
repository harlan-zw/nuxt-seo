<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed } from 'vue'
import { installedModules, moduleCatalog } from '../composables/modules'
import { detectPackageManager, pmCommands } from '../composables/package-manager'
import { useModuleUpdate } from '../composables/update-check'

const { moduleName, version } = defineProps<{
  moduleName: string
  version?: string
}>()

detectPackageManager()

const nuxtApp = useNuxtApp()
const nuxtVersion = nuxtApp.versions?.nuxt ?? 'unknown'
const vueVersion = nuxtApp.versions?.vue ?? 'unknown'

const moduleInfo = computed(() => moduleCatalog.value.find(m => m.name === moduleName))
const npmPackage = computed(() => moduleInfo.value?.npm)
const { latestVersion, hasUpdate } = useModuleUpdate(npmPackage.value, version)

const githubNewIssueUrl = computed(() => {
  if (!moduleInfo.value?.repo)
    return ''
  return `https://github.com/${moduleInfo.value.repo}/issues/new`
})

// Build environment info for copy
const envInfo = computed(() => {
  const lines: string[] = []
  lines.push('### Environment')
  lines.push('')

  // Current module
  if (version)
    lines.push(`- **${npmPackage.value}**: v${version}${hasUpdate.value ? ` (latest: v${latestVersion.value})` : ''}`)

  // Other installed Nuxt SEO modules
  for (const mod of installedModules.value) {
    if (mod.name === moduleName)
      continue
    const catalogEntry = moduleCatalog.value.find(m => m.name === mod.name)
    if (catalogEntry?.npm)
      lines.push(`- **${catalogEntry.npm}**: installed`)
  }

  lines.push('')
  lines.push(`- **Nuxt**: v${nuxtVersion}`)
  lines.push(`- **Vue**: v${vueVersion}`)

  return lines.join('\n')
})

const { copy: copyEnv, copied: envCopied } = useClipboard({ source: envInfo })

const steps = computed(() => {
  const pm = pmCommands()
  const updateCmd = [pm.update, pm.dedupe].filter(Boolean).join(' && ')
  return [
    {
      icon: 'carbon:reset',
      title: 'Clear generated files and update dependencies',
      description: 'Delete your .nuxt directory, update packages, then restart.',
      codes: [
        `rm -rf .nuxt && ${pm.exec} nuxi dev`,
        updateCmd,
      ],
    },
    {
      icon: 'carbon:debug',
      title: 'Enable debug mode',
      description: 'Add debug: true to your module config for verbose logging.',
      codes: [],
    },
    {
      icon: 'carbon:code',
      title: 'Create a minimal reproduction',
      description: 'Use a StackBlitz playground to isolate the issue. This helps maintainers debug quickly.',
      codes: [],
    },
    {
      icon: 'carbon:flag',
      title: 'Report the issue',
      description: 'Open a GitHub issue with your reproduction link and environment info.',
      codes: [],
    },
  ]
})
</script>

<template>
  <DevtoolsSection icon="carbon:help" text="Troubleshooting" description="Steps to diagnose and report issues">
    <div class="troubleshoot-steps">
      <div v-for="(step, i) of steps" :key="i" class="troubleshoot-step">
        <div class="troubleshoot-step-num">
          {{ i + 1 }}
        </div>
        <div class="troubleshoot-step-content">
          <div class="troubleshoot-step-title">
            <UIcon :name="step.icon" class="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            {{ step.title }}
          </div>
          <div class="troubleshoot-step-desc">
            {{ step.description }}
          </div>
          <code v-for="code of step.codes" :key="code" class="troubleshoot-code">{{ code }}</code>
        </div>
      </div>
    </div>

    <!-- Playgrounds for repro -->
    <div class="troubleshoot-section">
      <div class="troubleshoot-section-label">
        <UIcon name="carbon:game-console" class="w-3.5 h-3.5" />
        Playgrounds for reproduction
      </div>
      <DevtoolsPlaygrounds :module-name="moduleName" />
    </div>

    <!-- Environment info -->
    <div class="troubleshoot-section">
      <div class="troubleshoot-section-header">
        <div class="troubleshoot-section-label">
          <UIcon name="carbon:information" class="w-3.5 h-3.5" />
          Environment info
        </div>
        <button type="button" class="troubleshoot-copy-btn" @click="copyEnv()">
          <UIcon :name="envCopied ? 'carbon:checkmark' : 'carbon:copy'" class="w-3 h-3" />
          {{ envCopied ? 'Copied' : 'Copy for issue' }}
        </button>
      </div>
      <div class="troubleshoot-env">
        <div class="troubleshoot-env-row">
          <span class="troubleshoot-env-label">{{ npmPackage }}</span>
          <span class="troubleshoot-env-value">
            v{{ version || 'unknown' }}
            <UBadge v-if="hasUpdate" size="xs" color="warning" variant="subtle">
              v{{ latestVersion }} available
            </UBadge>
          </span>
        </div>
        <template v-for="mod of installedModules" :key="mod.name">
          <div v-if="mod.name !== moduleName" class="troubleshoot-env-row">
            <span class="troubleshoot-env-label">{{ moduleCatalog.find(m => m.name === mod.name)?.npm || mod.name }}</span>
            <span class="troubleshoot-env-value">installed</span>
          </div>
        </template>
        <div class="troubleshoot-env-row">
          <span class="troubleshoot-env-label">nuxt</span>
          <span class="troubleshoot-env-value">v{{ nuxtVersion }}</span>
        </div>
        <div class="troubleshoot-env-row">
          <span class="troubleshoot-env-label">vue</span>
          <span class="troubleshoot-env-value">v{{ vueVersion }}</span>
        </div>
      </div>
    </div>

    <!-- Report button -->
    <a
      v-if="githubNewIssueUrl"
      :href="githubNewIssueUrl"
      target="_blank"
      rel="noopener"
      class="troubleshoot-report-btn"
    >
      <UIcon name="simple-icons:github" class="w-3.5 h-3.5" />
      Open an issue on GitHub
      <UIcon name="carbon:arrow-up-right" class="w-3 h-3 opacity-40 ml-auto" />
    </a>
  </DevtoolsSection>
</template>

<style scoped>
.troubleshoot-steps {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.troubleshoot-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.troubleshoot-step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.troubleshoot-step-content {
  flex: 1;
  min-width: 0;
}

.troubleshoot-step-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.troubleshoot-step-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
}

.troubleshoot-code {
  display: inline-block;
  margin-top: 0.375rem;
  margin-right: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono, monospace);
  font-size: 0.6875rem;
  color: var(--color-text);
}

.troubleshoot-section {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.troubleshoot-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.troubleshoot-section-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.troubleshoot-copy-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--seo-green);
  background: oklch(from var(--seo-green) l c h / 0.1);
  cursor: pointer;
  transition: background 100ms;
}

.troubleshoot-copy-btn:hover {
  background: oklch(from var(--seo-green) l c h / 0.18);
}

.troubleshoot-env {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.troubleshoot-env-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  background: var(--color-surface-elevated);
}

.troubleshoot-env-label {
  font-size: 0.6875rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-text-muted);
}

.troubleshoot-env-value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-text);
}

.troubleshoot-report-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  border: 1px solid var(--color-border);
  transition: background 100ms, color 100ms, border-color 100ms;
}

.troubleshoot-report-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border-color: var(--color-neutral-400);
}

.dark .troubleshoot-report-btn:hover {
  border-color: var(--color-neutral-600);
}
</style>
