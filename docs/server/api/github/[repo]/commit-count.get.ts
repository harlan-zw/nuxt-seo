import { initOctokitRequestHandler } from '~~/server/utils/github'

export default defineCachedEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  const { headers } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    repo,
    owner,
    state: 'closed',
    per_page: 1,
    page: 1,
    sha: 'main',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  const link = String(headers.link) || ''
  // looks like: <https://api.github.com/repositories/577581539/commits?sha=main&per_page=1&page=2>; rel="next", <https://api.github.com/repositories/577581539/commits?sha=main&per_page=1&page=783>; rel="last"
  // we need to extract the last page number
  const lastPage = link.match(/page=(\d+)&sha=main>; rel="last"/)
  if (!lastPage) {
    throw new Error('Could not find last page')
  }
  return Number.parseInt(lastPage[1], 10)
}, {
  // last for 1 week
  name: 'commit-count-v2',
  maxAge: 60 * 60 * 24 * 7,
})
