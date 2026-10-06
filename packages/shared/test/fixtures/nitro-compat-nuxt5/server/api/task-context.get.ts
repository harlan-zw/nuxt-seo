import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(event => ({
  header: event.req.headers.get('x-task'),
  marker: event.context.taskMarker,
}))
