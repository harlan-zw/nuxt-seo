import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import NuxtSEO from '../../src/module'

const { resolve } = createResolver(import.meta.url)

const mcpToolkit = defineNuxtModule({
  meta: { name: '@nuxtjs/mcp-toolkit', configKey: 'mcp' },
  defaults: { route: '/mcp/docs' },
})

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    modules: [mcpToolkit, NuxtSEO],
    mcp: { route: '/mcp/docs' },
    aiReady: { database: false, mcp: { tools: false, resources: false }, mcpServerCard: false, apiCatalog: false, agentSkills: false },
  },
})

describe('api discovery opt-out', () => {
  it('keeps the catalog disabled despite a configured MCP server', async () => {
    expect((await fetch('/.well-known/api-catalog')).status).toBe(404)
    expect((await fetch('/')).headers.get('link') || '').not.toContain('rel="api-catalog"')
    expect((await fetch('/llms.txt')).status).toBe(200)
    expect((await fetch('/.well-known/agent-skills/index.json')).status).toBe(404)
  })
})
