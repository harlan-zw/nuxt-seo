import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { setupDevToolsUI } from 'nuxtseo-shared/devtools'

// Demo: two example "modules" each register a devtools layer. Model C assembles them
// into ONE client (built in node_modules/.cache, async with a Building… placeholder)
// and serves it at /__nuxt-seo-devtools/<slug>. Real modules register the same way.
const LAYERS = [
  { slug: 'example-a', title: 'Example A', icon: 'carbon:bot' },
  { slug: 'example-b', title: 'Example B', icon: 'carbon:plug' },
]

export default defineNuxtModule({
  meta: { name: 'seo-devtools-demo' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    for (const l of LAYERS) {
      const layerDir = resolve(`../layers/${l.slug}`)
      setupDevToolsUI({ name: l.slug, slug: l.slug, title: l.title, icon: l.icon }, () => layerDir, nuxt)
    }
  },
})
