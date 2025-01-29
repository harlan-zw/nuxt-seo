import type { ThumbsFeedbackResponse } from '~~/types/schemas'
import { ProEmailSchema } from '~~/types/schemas'

export default defineEventHandler<Promise<ThumbsFeedbackResponse>>(async (e) => {
  const body = await readValidatedBody(e, ProEmailSchema.safeParse)
  const { email } = body.data
  const key = useRuntimeConfig(e).emailOctopusToken
  try {
    await $fetch('https://api.emailoctopus.com/lists/6c462a3a-91b1-11ef-bd09-15cf0f9f3feb/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    })
    return 'OK'
  }
  catch {
    return sendError(e, createError({
      statusCode: 500,
      message: 'Failed to subscribe email',
    }))
  }
})
