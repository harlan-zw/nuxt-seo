import type { ShikiTransformer } from '@shikijs/types'
import { defineConfig } from '@nuxtjs/mdc/config'
import { transformerColorHighlight } from 'shiki-transformer-color-highlight'
import robotsTxt from './mdc/robots-txt'

export default defineConfig({
  shiki: {
    setup(highlighter) {
      highlighter.loadLanguage(robotsTxt)
    },
    transformers: [
      transformerColorHighlight(),
      {
        name: 'highlight-apis',
        span(node, line, col) {
          // TODO do all Nuxt SEO composables & config
          if (node.children[0]?.type === 'text' && node.children[0]?.value === 'useRobotsRule') {
            console.log(node)
            node.properties.className = ['!underline']
          }
        },
      } satisfies ShikiTransformer,
    ],
  },
})
