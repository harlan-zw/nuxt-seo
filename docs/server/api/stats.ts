import { $fetch } from 'ofetch'
import { modules } from '../../../src/const'

export default defineCachedEventHandler(async (e) => {
  const promises = []
  const uniqueContributors = new Set<string>()
  for (const m of modules) {
    // eslint-disable-next-line no-async-promise-executor
    promises.push(new Promise(async (resolve) => {
      const [nuxtApiStats, commitCount, issuesCloses] = await Promise.all([
        $fetch(`https://api.nuxt.com/modules/${m.slug}`, {
          timeout: 3000,
        })
          .catch(() => {
            return {
              downloads: 0,
              stars: 0,
              contributors: [],
            }
          }),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/commit-count`),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/issues-closed`),
      ])
      const { stats } = nuxtApiStats
      for (const c of nuxtApiStats.contributors) {
        uniqueContributors.add(c.id)
      }
      resolve({
        slug: m.slug,
        createdAt: stats?.createdAt,
        publishedAt: stats?.publishedAt,
        version: stats?.version,
        downloads: stats?.downloads,
        stars: stats?.stars,
        commitCount,
        issuesCloses,
      })
    }))
  }
  const moduleStats = await Promise.all(promises)
  return {
    modules: moduleStats,
    uniqueContributors: [...uniqueContributors],
    totalCommits: moduleStats.reduce((acc, s) => acc + s.commitCount, 0),
    totalIssuesClosed: moduleStats.reduce((acc, s) => acc + s.issuesCloses, 0),
  }
}, {
  // last for 1 day
  maxAge: 60 * 60 * 24,
})
