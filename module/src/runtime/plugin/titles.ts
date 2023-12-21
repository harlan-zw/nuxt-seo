import { defineNuxtPlugin } from 'nuxt/app'
import type { UseHeadOptions } from '@unhead/vue'
import { withoutTrailingSlash } from 'ufo'
import {
  computed,
  useHead,
  useRoute,
} from '#imports'

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export default defineNuxtPlugin({
  name: 'nuxt-seo:fallback-titles',
  setup() {
    const route = useRoute()
    const title = computed(() => {
      if (typeof route.meta?.title === 'string')
        return route.meta?.title
      // if no title has been set then we should use the last segment of the URL path and title case it
      const path = withoutTrailingSlash(route.path || '/')
      const lastSegment = path.split('/').pop()
      return lastSegment ? titleCase(lastSegment) : null
    })

    const minimalPriority: UseHeadOptions = {
      // give nuxt.config values higher priority
      tagPriority: 101,
    }

    useHead({ title }, minimalPriority)
  },
})
