import { defineEventHandler, sendRedirect } from 'h3'
import { joinURL } from 'ufo'
import { useNitroOrigin, useSiteConfig } from '#imports'

export default defineEventHandler((e) => {
  const siteConfig = useSiteConfig(e)
  if (siteConfig.site) {
    const origin = useNitroOrigin(e)
    // if origin doesnt match site, do a redirect
    if (!siteConfig.site.startsWith(origin)) {
      const url = new URL(e.path, origin)
      url.hostname = siteConfig.site
      return sendRedirect(e, joinURL(siteConfig.site, url.pathname), 301)
    }
  }
})
