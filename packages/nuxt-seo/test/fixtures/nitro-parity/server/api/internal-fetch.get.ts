import { defineEventHandler } from '#nuxtseo/h3'
import { fetchWithEvent } from '#nuxtseo/nitro'

export default defineEventHandler(async (event) => {
  const body = await fetchWithEvent<string>(event, '/', {
    headers: {
      accept: 'text/html',
      'x-ai-ready-internal': '1',
    },
    responseType: 'text',
  })

  return {
    body,
    status: 200,
  }
})
