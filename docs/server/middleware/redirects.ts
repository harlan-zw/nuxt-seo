import { sendRedirect } from 'h3'
import { modules } from '../../../src/const'

export default defineEventHandler((e) => {
  // we want to redirect any requests for /docs/experiments/* to /docs/seo-utils/*
  const path = getRequestPath(e)
  if (path.startsWith('/docs/experiments')) {
    return sendRedirect(e, `/docs/seo-utils${path.slice('/docs/experiments'.length)}`, 301)
  }
  const slugs = modules.map(m => m.slug)
  // get first segment
  const first = path.split('/')[1]
  const rest = path.split('/').slice(2).join('/')
  if (slugs.includes(first)) {
    return sendRedirect(e, `/docs/${first}/${rest}`, 301)
  }

  if (path.endsWith('/stackblitz')) {
    return sendRedirect(e, path.replace('/stackblitz', '/troubleshooting'), 301)
  }
})
