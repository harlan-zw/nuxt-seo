import type { H3Event } from 'h3'
import { Octokit } from 'octokit'

export function initOctokitRequestHandler(e: H3Event) {
  const { githubAccessToken } = useRuntimeConfig(e)
  if (!githubAccessToken) {
    throw new Error('Missing githubAccessToken')
  }
  const repo = (getRouterParam(e, 'repo') || '').replace('@', '/')
  if (!repo?.startsWith('nuxt') && !repo?.startsWith('harlan-zw/')) {
    throw new Error(`Invalid repo ${repo}`)
  }
  return {
    repo: repo.split('/')[1],
    owner: repo.split('/')[0],
    octokit: new Octokit({
      auth: githubAccessToken,
    }),
  }
}
