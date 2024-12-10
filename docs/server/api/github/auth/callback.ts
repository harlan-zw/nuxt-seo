import { getQuery, getRequestHost } from 'h3'
import { appStorage } from '~~/server/storage'

export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const code = query.code as string

  if (!code) {
    throw new Error('No code provided')
  }

  const host = getRequestHost(e, { xForwardedHost: true })
  const redirectUri = `http${host.includes('localhost') ? '' : 's'}://${host}/api/github/auth/callback`
  const { githubAuthClientId, githubAuthClientSecret } = useRuntimeConfig(e)

  // Exchange the authorization code for an access token
  const tokenResponse = await $fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: {
      client_id: githubAuthClientId,
      client_secret: githubAuthClientSecret,
      code,
      redirect_uri: redirectUri,
    },
  })

  // store in nuxt hub kv
  await appStorage().set('github:token', tokenResponse.access_token)
  return 'OK'
})
