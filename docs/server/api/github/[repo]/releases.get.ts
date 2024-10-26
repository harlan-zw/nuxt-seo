import { initOctokitRequestHandler } from '~~/server/utils/github'

export default defineCachedEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  const { data: res } = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    repo,
    owner,
    headers: {
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
