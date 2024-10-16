
export function extractSeoHead(html: string) {
  const head = html.match(/<head>([\s\S]*)<\/head>/)?.[1]
  // remove all style tags
  const headWithoutStyles = head?.replace(/<style[\s\S]*?<\/style>/g, '')
  const headWithoutScripts = headWithoutStyles?.replace(/<script[\s\S]*?<\/script>/g, '')
  // filter out links that aren't seo related, we want canonical, icon, etc
  const withSeoLinks = headWithoutScripts?.replace(/<link[\s\S]*?>/g, (link) => {
    if (link.includes('rel="canonical"') || link.includes('rel="icon"')) {
      return link
    }
    return ''
  })
  return withSeoLinks!.split('\n').filter(Boolean).join('\n').trim()
}
