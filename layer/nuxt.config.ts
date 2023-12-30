import { useLogger } from '@nuxt/kit'

export default ({
  modules: [
    '@nuxtseo/module',
  ],

  hooks: {
    'modules:done': function () {
      const logger = useLogger()
      logger.warn('Using Nuxt SEO Kit as a layer has been deprecated. Please use `@nuxtseo/module` as module instead.')
    },
  },
})
