export default defineAppConfig({
  site: {
    title: 'Nuxt SEO Kit',
    description: 'A Nuxt 3 layer for SEO',
    locale: 'en',
    schema: {
      person: definePerson({
        name: 'Harlan Z. Wilton',
      }),
    }
  },
})
