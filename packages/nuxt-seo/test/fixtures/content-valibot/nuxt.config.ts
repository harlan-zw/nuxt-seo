import NuxtSEO from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtSEO, '@nuxt/content'],
  site: { url: 'https://example.com' },
  devtools: { enabled: false },
})
