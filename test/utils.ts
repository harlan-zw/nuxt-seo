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
  return withSeoLinks!
    .replace(/></g, '>\n<')
    .split('\n')
    .filter(Boolean)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim()
}
