import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getRouteRules } from '#internal/nitro'

export default defineEventHandler((event) => {
  // add noindex header
  const siteIndexable = useRuntimeConfig().public.indexable
  const routeRules = getRouteRules(event)
  if (routeRules.index === false || siteIndexable === false)
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
})
