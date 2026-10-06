import { defineEventHandler } from 'nuxt/server'
import { fetchWithEvent } from 'nuxtseo-shared/fetch'
export default defineEventHandler(event => fetchWithEvent(event, '/api/native-forwarded'))
