import { getHeader } from 'h3'
import { hash } from 'ohash'
import { parseURL } from 'ufo'
import { appStorage } from '~~/server/storage'
import { CommentFeedbackSchema } from '~~/types/schemas'

export default defineEventHandler(async (e) => {
  const body = await readValidatedBody(e, CommentFeedbackSchema.safeParse)
  const { comment } = body.data
  const referrer = parseURL(getHeader(e, 'Referer')).pathname
  await appStorage().set(`feedback:${referrer}:${hash(comment)}`, comment)
  return 'OK'
})
