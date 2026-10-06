import { localFetch } from '#nuxtseo/nitro'
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(async () => {
  const response = await localFetch('/api/task-context', { headers: { 'x-task': 'restoration' } }, { taskMarker: 'scheduled' })
  return response.json()
})
