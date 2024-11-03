import { defineConfig } from '@nuxtjs/mdc/config'
import { transformerColorHighlight } from 'shiki-transformer-color-highlight'
import dir from './mdc/dir'
import robotsTxt from './mdc/robots-txt'

export default defineConfig({
  shiki: {
    async setup(highlighter) {
      await highlighter.loadLanguage(robotsTxt, dir)
    },
    transformers: [
      transformerColorHighlight(),
      // {
      //   name: 'highlight-apis',
      //   span(node) {
      //     // TODO do all Nuxt SEO composables & config
      //     // if (node.children[0]?.type === 'text' && node.children[0]?.value === 'useRobotsRule') {
      //     //   console.log(node)
      //     //   node.properties.className = ['!underline']
      //     // }
      //   },
      // } satisfies ShikiTransformer,
    ],
  },
})
