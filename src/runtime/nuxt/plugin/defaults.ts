import { applyDefaults as setup } from '../logic/applyDefaults'
import {
  defineNuxtPlugin,
} from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-seo:defaults',
  env: {
    islands: false,
  },
  setup,
})
