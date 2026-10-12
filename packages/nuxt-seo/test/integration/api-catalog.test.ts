import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import NuxtSEO from '../../src/module'

const { resolve } = createResolver(import.meta.url)

// Discovery reads the toolkit's registration and route. Transport execution is outside this fixture.
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
    aiReady: { database: false, mcp: { tools: false, resources: false }, mcpServerCard: false },
  },
})

describe('automatic API discovery', () => {
  it('publishes the configured MCP endpoint without an API catalog opt-in', async () => {
    const response = await fetch('/.well-known/api-catalog')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/linkset+json')
    expect(await response.json()).toMatchObject({
      linkset: [{
        anchor: 'https://local.nuxtseo.com/mcp/docs',
        item: [{ href: 'https://local.nuxtseo.com/mcp/docs', type: 'application/json' }],
      }],
    })
    expect((await fetch('/')).headers.get('link')).toContain('rel="api-catalog"')
  })

  it('keeps project instructions private with a public MCP catalog', async () => {
    expect((await fetch('/.well-known/agent-skills/internal/SKILL.md')).status).toBe(404)
    expect((await fetch('/skills/internal/SKILL.md')).status).toBe(404)
  })
})
