export default defineCachedEventHandler(async () => {
  return await $fetch('https://nuxtseo.com/sitemap.xml')
}, {
  // last for 1 day
  maxAge: 60 * 60 * 24,
})
