import { fetchGitHubSponsors } from 'sponsorkit'
import { appStorage } from '~~/server/storage'

export default defineCachedEventHandler(async (e) => {
  if (!import.meta.prerender && !import.meta.dev) {
    return
  }
  const token = await appStorage().get<string>('github:token') || useRuntimeConfig(e).githubAuthToken
  if (!token) {
    return []
  }
  const _sponsors = await fetchGitHubSponsors(token, 'harlan-zw', 'user', {
    force: true, // use nitro cache
  }).catch((e) => {
    console.error(e)
    return []
  })

  const sponsors = _sponsors.map((s) => {
    if (s.sponsor.name === 'Kintell-labs') {
      s.sponsor.name = 'Kintell'
      s.sponsor.websiteUrl = 'https://kintell.com'
    }
    if (s.sponsor.name === 'Massive Monster') {
      s.sponsor.websiteUrl = 'https://massivemonster.co'
    }
    return s
  })

  return sponsors.reduce((acc, sponsor) => {
    if (sponsor.monthlyDollars >= 25 && sponsor.monthlyDollars < 50) {
      acc.$25.push(sponsor)
    }
    else if (sponsor.monthlyDollars > 50) {
      acc.$50.push(sponsor)
    }
    else {
      acc.others.push(sponsor)
    }
    return acc
  }, {
    others: [],
    $25: [],
    $50: [],
  })
}, {
  // last for 1 day
  maxAge: 60 * 60 * 24,
  swr: true,
})
