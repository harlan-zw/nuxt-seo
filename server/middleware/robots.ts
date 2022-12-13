export default defineEventHandler((event) => {
  // add noindex header
  const siteIndexable = useRuntimeConfig().public.indexable
  const routeRules = getRouteRules(event)
  if (routeRules.index === false || siteIndexable === false)
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
})
