import { hash } from 'ohash'
import { appStorage } from '~~/server/storage'
import { ProWaitlistFeedbackSchema } from '~~/types/schemas'

export default defineEventHandler(async (e) => {
  const body = await readValidatedBody(e, ProWaitlistFeedbackSchema.safeParse)
  const { comment } = body.data
  await appStorage().set(`feedback:pro:${hash(comment)}`, comment)
  return 'OK'
})
