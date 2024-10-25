import { $fetch } from 'ofetch'
import { modules } from '../../../src/const'

function customSortSemver(a, b) {
  const aParts = String(a).split('.')
  const bParts = String(b).split('.')
  for (let i = 0; i < aParts.length; i++) {
    if (aParts[i] === bParts[i]) {
      continue
    }
    return Number.parseInt(bParts[i]) - Number.parseInt(aParts[i])
  }
  return 0
}

export default defineCachedEventHandler(async (e) => {
  const promises = []
  const uniqueContributors = new Set<string>()
  const allReleases = []
  for (const m of modules) {
    // eslint-disable-next-line no-async-promise-executor
    promises.push(new Promise(async (resolve) => {
      const [nuxtApiStats, stars, commitCount, issuesCloses, releases, downloads] = await Promise.all([
        $fetch(`https://api.nuxt.com/modules/${m.slug === 'nuxt-seo' ? 'seo' : m.slug}`, {
          timeout: 3000,
        })
          .catch(() => {
            return {
              downloads: 0,
              stars: 0,
              contributors: [],
            }
          }),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/stars`),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/commit-count`),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/issues-closed`),
        e.$fetch(`/api/github/${m.repo.replace('/', '@')}/releases`),
        e.$fetch(`/api/npm/${m.npm.replace('/', '_')}/downloads`),
      ])
      const { stats } = nuxtApiStats
      for (const c of nuxtApiStats.contributors) {
        uniqueContributors.add(c.id)
      }
      allReleases.push(...(releases || []).map(r => ({
        ...r,
        slug: m.slug,
      })))
      // get all major versions from releases, need to map into major version groups then get first child
      const versionGroups = releases.map(r => r.name).reduce((group, v) => {
        const [major] = v.split('.').slice(0, 1)
        group[major] = group[major] || []
        group[major].push(v)
        return group
      }, [])
      // first of each group make an object, sort so we get the oldest version
      const versions = Object.values(versionGroups).sort(customSortSemver).map(v => v[0]).map(v => v.startsWith('v') ? v : `v${v}`).sort((a, b) => b.localeCompare(a))
      resolve({
        slug: m.slug,
        createdAt: stats?.createdAt,
        publishedAt: stats?.publishedAt,
        version: releases[0].name,
        versions,
        stars: stars.stars || stats?.stars,
        commitCount,
        issuesCloses,
        ...downloads,
      })
    }))
  }
  const moduleStats = await Promise.all(promises)
  return {
    fetchedAt: Date.now(),
    modules: moduleStats,
    uniqueContributors: [...uniqueContributors],
    totalCommits: moduleStats.reduce((acc, s) => acc + s.commitCount, 0),
    totalIssuesClosed: moduleStats.reduce((acc, s) => acc + s.issuesCloses, 0),
    allReleases: allReleases.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 20),
  }
}, {
  // last for 1 day
  maxAge: 60 * 60 * 24,
  swr: true,
})
