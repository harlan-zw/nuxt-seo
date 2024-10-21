import { $fetch } from 'ofetch'

export default defineCachedEventHandler(async (e) => {
  const repo = (getRouterParam(e, 'repo') || '').replace('@', '/')
  if (!repo?.startsWith('nuxt') && !repo?.startsWith('harlan-zw/')) {
    throw new Error(`Invalid repo ${repo}`)
  }
  const { githubToken } = useRuntimeConfig()
  const res = await $fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  return {
    stars: res.stargazers_count,
    updated_at: res.updated_at,
  }
}, {
  // last for 1 hour
  maxAge: 60 * 60,
})
