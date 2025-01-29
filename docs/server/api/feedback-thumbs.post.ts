import type { ThumbsFeedbackResponse } from '~~/types/schemas'
import { getHeader } from 'h3'
import { parseURL } from 'ufo'
import { appStorage } from '~~/server/storage'
import { ThumbsFeedbackSchema } from '~~/types/schemas'

export default defineEventHandler<Promise<ThumbsFeedbackResponse>>(async (e) => {
  const body = await readValidatedBody(e, ThumbsFeedbackSchema.safeParse)
  const { thumbs } = body.data
  // get refferer header
  const referrer = parseURL(getHeader(e, 'Referer')).pathname

  const key = `/feedback/thumbs/${referrer}`
  const stats = await appStorage().get<ThumbsFeedbackResponse['stats']>(key) || {
    up: 0,
    down: 0,
  }
  // increment
  stats[thumbs]++
  // save
  await appStorage().set(key, stats)
  return {
    thumbs,
    stats,
  }
})
