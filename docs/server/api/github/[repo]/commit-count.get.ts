import { $fetch } from 'ofetch'

export default defineCachedEventHandler(async (e) => {
  const repo = (getRouterParam(e, 'repo') || '').replace('@', '/')
  if (!repo?.startsWith('nuxt') && !repo?.startsWith('harlan-zw/')) {
    throw new Error(`Invalid repo ${repo}`)
  }
  const { githubAccessToken } = useRuntimeConfig()
  const pager = await $fetch.raw(`https://api.github.com/repos/${repo}/commits?sha=main&per_page=1&page=1`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${githubAccessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  const link = pager.headers.get('Link') || ''
  // looks like: <https://api.github.com/repositories/577581539/commits?sha=main&per_page=1&page=2>; rel="next", <https://api.github.com/repositories/577581539/commits?sha=main&per_page=1&page=783>; rel="last"
  // we need to extract the last page number
  const lastPage = link.match(/page=(\d+)>; rel="last"/)
  if (!lastPage) {
    throw new Error('Could not find last page')
  }
  return Number.parseInt(lastPage[1], 10)
}, {
  // last for 1 week
  maxAge: 60 * 60 * 24 * 7,
})
