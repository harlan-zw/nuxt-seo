import { defineEventHandler, sendRedirect } from 'h3'
import { joinURL } from 'ufo'
import { useNitroOrigin, useSiteConfig } from '#imports'

export default defineEventHandler((e) => {
  const siteConfig = useSiteConfig(e)
  if (siteConfig.url) {
    const siteConfigHostName = new URL(e.path, siteConfig.url).hostname
    const origin = useNitroOrigin(e)
    const originHostname = new URL(e.path, origin).hostname
    // if origin doesn't match site, do a redirect
    if (originHostname !== siteConfigHostName)
      return sendRedirect(e, joinURL(siteConfig.url, e.path), 301)
  }
})
