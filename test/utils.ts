const HEAD_REGEX = /<head>([\s\S]*)<\/head>/
const STYLE_REGEX = /<style[\s\S]*?<\/style>/g
const SCRIPT_REGEX = /<script[\s\S]*?<\/script>/g
const LINK_REGEX = /<link[\s\S]*?>/g
const TAG_GAP_REGEX = /></g
const OG_IMAGE_REGEX = /<meta property="og:image" content="([^"]+)">/

export function extractSeoHead(html: string): string {
  const head = html.match(HEAD_REGEX)?.[1]
  // remove all style tags
  const headWithoutStyles = head?.replace(STYLE_REGEX, '')
  const headWithoutScripts = headWithoutStyles?.replace(SCRIPT_REGEX, '')
  // filter out links that aren't seo related, we want canonical, icon, etc
  const withSeoLinks = headWithoutScripts?.replace(LINK_REGEX, (link) => {
    if (link.includes('rel="canonical"') || link.includes('rel="icon"')) {
      return link
    }
    return ''
  })
  return withSeoLinks!
    .replace(TAG_GAP_REGEX, '>\n<')
    .split('\n')
    .filter(Boolean)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim()
}

export function extractOgImageUrl(html: string): string | null {
  const head = html.match(HEAD_REGEX)?.[1]
  const match = head?.match(OG_IMAGE_REGEX)
  return match?.[1] || null
}
