import { getRequestHost } from 'h3'
import { withQuery } from 'ufo'

export default defineEventHandler(async (e) => {
  const host = getRequestHost(e, { xForwardedHost: true })
  const redirectUri = `http${host.includes('localhost') ? '' : 's'}://${host}/api/github/auth/callback`
  const url = withQuery('https://github.com/login/oauth/authorize', {
    client_id: useRuntimeConfig(e).githubAuthClientId,
    redirect_uri: redirectUri,
    scope: 'read:user,read:org',
  })
  return sendRedirect(e, url)
})
