import type { RequestEvent } from 'nuxt/server'
import { useRuntimeConfig } from 'nuxt/server'

export function getAliasGreeting(event: RequestEvent): string {
  return `${useRuntimeConfig().nitroCompatibilityMarker}:${event.req.headers.get('x-alias')}`
}

export function formatAliasLabel(label: string): string {
  return `Server:${label}`
}
