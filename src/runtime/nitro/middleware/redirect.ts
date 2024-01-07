import { defineEventHandler, sendRedirect } from 'h3'
import { joinURL } from 'ufo'
import { useNitroOrigin, useSiteConfig } from '#imports'

export default defineEventHandler((e) => {
  const siteConfig = useSiteConfig(e)
  if (siteConfig.site) {
    const siteConfigHostName = new URL(e.path, siteConfig.site).hostname
    const origin = useNitroOrigin(e)
    const originHostname = new URL(e.path, origin).hostname
    // if origin doesn't match site, do a redirect
    if (originHostname !== siteConfigHostName)
      return sendRedirect(e, joinURL(siteConfig.site, e.path), 301)
  }
})
