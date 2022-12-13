import type { NitroAppPlugin } from 'nitropack'

export const Meta: NitroAppPlugin = (nitroApp) => {
  nitroApp.hooks.hook('compiled', async ({ head, body }) => {
    const hasTitle = head.filter(s => s.includes('<title>')).length > 0
    let h1 = ''
    if (!hasTitle) {
      body.filter(s => s.includes('<h1')).forEach((s) => {
        // get the inner content of the h1 tag
        h1 = s.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || ''
      })
      if (h1)
        head.unshift(`<title>${h1}</title>`)
    }
  })
}

export default Meta
