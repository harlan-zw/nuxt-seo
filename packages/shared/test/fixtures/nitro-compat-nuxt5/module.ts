import { createResolver, defineNuxtModule, getNitroVersion } from 'nuxt/kit'
import { setupNitroRuntimeCompatibility, setupRuntimeAliases } from 'nuxtseo-shared/kit'
import { createPrerenderFetch } from 'nuxtseo-shared/prerender'

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-nitro-compat-nuxt5-fixture',
  },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.alias['#fixture'] = resolve('./runtime-fixture')
    setupRuntimeAliases({ namespace: '#fixture', app: resolve('./runtime-fixture/app'), server: resolve('./runtime-fixture/server') }, nuxt)
    setupRuntimeAliases({ namespace: '#standalone-fixture', app: resolve('./runtime-fixture/app'), server: resolve('./runtime-fixture/server') }, nuxt)
    nuxt.hook('modules:done', () => {
      const expected = process.env.NUXT_TEST_LANE === 'nuxt5' ? 3 : 2
      if (getNitroVersion(nuxt) !== expected) throw new Error('Unexpected Nitro builder for this compatibility lane.')
    })
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.asyncContext = true
    nuxt.hook('nitro:init', (nitro) => {
      let clients: { first: ReturnType<typeof createPrerenderFetch>, second: ReturnType<typeof createPrerenderFetch> } | undefined
      const major = getNitroVersion(nuxt)
      if (major !== 2 && major !== 3)
        throw new Error('Unexpected prerender builder.')
      nitro.hooks.hook('prerender:init', (renderer) => {
        clients = { first: createPrerenderFetch(renderer, major), second: createPrerenderFetch(renderer, major) }
      })
      nitro.hooks.hook('prerender:done', async () => {
        if (!clients)
          throw new Error('Prerender transport was not initialized.')
        try {
          const response = await clients.first.fetch<{ header: string }>('/api/task-context', { headers: { 'x-task': 'builder-crawl' } })
          if (response.header !== 'builder-crawl')
            throw new Error('Prerender local request did not preserve headers.')
          await clients.first.close()
          const second = await clients.second.fetch<{ header: string }>('/api/task-context', { headers: { 'x-task': 'second-client' } })
          if (second.header !== 'second-client')
            throw new Error('Closing the first client broke the second client.')
        }
        finally {
          await Promise.all([clients.first.close(), clients.second.close()])
        }
      })
    })
  },
})
