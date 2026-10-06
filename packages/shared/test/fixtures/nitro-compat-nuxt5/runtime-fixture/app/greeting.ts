import { useRuntimeConfig } from 'nuxt/app'

export function useAliasGreeting(): string {
  return String(useRuntimeConfig().nitroCompatibilityMarker)
}

export function formatAliasLabel(label: string): string {
  return `App:${label}`
}
