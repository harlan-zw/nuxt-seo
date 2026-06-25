const HEAD_REGEX = /<head>([\s\S]*)<\/head>/
const STYLE_REGEX = /<style[\s\S]*?<\/style>/g
const SCRIPT_REGEX = /<script[\s\S]*?<\/script>/g
const LINK_REGEX = /<link[\s\S]*?>/g
const TAG_GAP_REGEX = /></g
const OG_IMAGE_REGEX = /<meta property="og:image" content="([^"]+)">/
// og-image >=6.7.0 signs URLs with a per-build secret, appending `,s_<sig>`
// before the extension. Strip it so snapshots stay deterministic across builds.
const OG_SIGNATURE_REGEX = /,s_[\w-]+(?=\.(?:png|jpe?g|webp|svg|html|json))/g

function stripOgSignature(html: string): string {
  return html.replace(OG_SIGNATURE_REGEX, '')
}

export function extractSeoHead(html: string): string {
  const head = stripOgSignature(html).match(HEAD_REGEX)?.[1]
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

// The og:image URL with its signing signature stripped, for stable snapshots.
export function extractOgImageUrl(html: string): string | null {
  const head = html.match(HEAD_REGEX)?.[1]
  const match = head?.match(OG_IMAGE_REGEX)
  return match?.[1] ? stripOgSignature(match[1]) : null
}

// The og:image request path with its signature intact, so prod requests (which
// require a valid signature) resolve to the rendered image.
export function extractOgImagePath(html: string): string | null {
  const head = html.match(HEAD_REGEX)?.[1]
  const match = head?.match(OG_IMAGE_REGEX)
  return match?.[1] ? new URL(match[1]).pathname : null
}
