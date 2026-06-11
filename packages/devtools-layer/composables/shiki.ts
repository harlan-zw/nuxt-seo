import type { HighlighterCore, LanguageRegistration } from 'shiki'
import type { ComputedRef, MaybeRef, Ref } from 'vue'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { computed, ref, toValue } from 'vue'

// Re-exported so consuming layers can type custom grammars without depending on
// `shiki` directly (it isn't a dependency of the module repos, only of this layer).
export type { LanguageRegistration } from 'shiki'

export const shiki: Ref<HighlighterCore | undefined> = ref()

export interface LoadShikiOptions {
  extraLangs?: (LanguageRegistration | Promise<LanguageRegistration>)[]
}

let loadShikiPromise: Promise<HighlighterCore | undefined> | undefined

export function loadShiki(options: LoadShikiOptions = {}): Promise<HighlighterCore | undefined> {
  // Share one in-flight/completed load so every code block can call this freely.
  // A call with extra grammars rebuilds the highlighter to include them.
  if (!options.extraLangs?.length && loadShikiPromise)
    return loadShikiPromise

  const langs: any[] = [
    import('@shikijs/langs/xml'),
    import('@shikijs/langs/json'),
    import('@shikijs/langs/js'),
  ]
  if (options.extraLangs) {
    langs.push(...options.extraLangs)
  }

  loadShikiPromise = createHighlighterCore({
    themes: [
      import('@shikijs/themes/vitesse-light'),
      import('@shikijs/themes/vitesse-dark'),
    ],
    langs,
    engine: createJavaScriptRegexEngine(),
  }).then((highlighter) => {
    shiki.value = highlighter
    return highlighter
  }).catch((err) => {
    console.warn('[nuxt-seo] Failed to load shiki highlighter:', err)
    return undefined
  })

  return loadShikiPromise
}

function plainCodeHtml(code: string): string {
  return `<code>${code.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)}</code>`
}

export function useRenderCodeHighlight(code: MaybeRef<string>, lang: string): ComputedRef<string> {
  return computed(() => {
    const text = toValue(code) || ''
    if (!shiki.value)
      return plainCodeHtml(text)
    try {
      return shiki.value.codeToHtml(text, {
        lang,
        // Emit `--shiki-light` / `--shiki-dark` CSS variables instead of a baked-in
        // `color:` so global.css can swap colors per devtools color mode. Without this,
        // shiki writes `color:#xxx` inline and the `.shiki span { color: var(--shiki-light) }`
        // rule resolves to an undefined variable, wiping every syntax color to plain text.
        defaultColor: false,
        themes: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
      }) || plainCodeHtml(text)
    }
    catch (err) {
      // a grammar that wasn't loaded shouldn't blank the block — show plain code
      console.warn(`[nuxt-seo] shiki could not highlight lang "${lang}":`, err)
      return plainCodeHtml(text)
    }
  })
}
