import { ref } from 'vue'

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm'

export const packageManager = ref<PackageManager>('npm')

const PM_COMMANDS: Record<PackageManager, { run: string, exec: string, update: string, dedupe: string }> = {
  pnpm: { run: 'pnpm', exec: 'pnpm dlx', update: 'pnpm update', dedupe: 'pnpm dedupe' },
  yarn: { run: 'yarn', exec: 'yarn dlx', update: 'yarn upgrade', dedupe: 'yarn dedupe' },
  bun: { run: 'bun', exec: 'bunx', update: 'bun update', dedupe: '' },
  npm: { run: 'npm', exec: 'npx', update: 'npm update', dedupe: 'npm dedupe' },
}

export function pmCommands(): { run: string, exec: string, update: string, dedupe: string } {
  return PM_COMMANDS[packageManager.value]
}

// Detect by checking lock files via Vite's @fs route (dev only)
const LOCK_FILES: [string, PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
]

let detected = false
export function detectPackageManager(): void {
  if (detected)
    return
  detected = true

  // Check each lock file with a HEAD request
  for (const [file, pm] of LOCK_FILES) {
    fetch(`/${file}`, { method: 'HEAD' })
      .then((r) => {
        if (r.ok) {
          packageManager.value = pm
        }
      })
      .catch(() => {})
  }
}
