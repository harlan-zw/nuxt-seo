import { $fetch } from 'ofetch'

export default defineCachedEventHandler(async (e) => {
  const repo = (getRouterParam(e, 'repo') || '').replace('@', '/')
  if (!repo?.startsWith('nuxt') && !repo?.startsWith('harlan-zw/')) {
    throw new Error(`Invalid repo ${repo}`)
  }
  const { githubAccessToken } = useRuntimeConfig()
  const res = await $fetch(`https://api.github.com/repos/${repo}/releases`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${githubAccessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  return res.map(release => ({
    name: release.tag_name,
    publishedAt: release.published_at,
    body: release.body,
  }))
}, {
  // last for 1 hour
  maxAge: 60 * 60,
})
