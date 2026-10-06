import { defineEventHandler, getRequestURL } from 'nuxt/server'

export default defineEventHandler((event) => {
  if (import.meta.dev && getRequestURL(event).pathname === '/__site-config__/debug.json') {
    // Observe the setup check's real internal HTTP request after homepage rendering.
    console.log('PACKED_SETUP_SITE_DEBUG_FETCH')
  }
})
