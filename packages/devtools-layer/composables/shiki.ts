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

export async function loadShiki(options: LoadShikiOptions = {}): Promise<HighlighterCore> {
  const langs: any[] = [
    import('@shikijs/langs/xml'),
    import('@shikijs/langs/json'),
    import('@shikijs/langs/js'),
  ]
  if (options.extraLangs) {
    langs.push(...options.extraLangs)
  }

  shiki.value = await createHighlighterCore({
    themes: [
      import('@shikijs/themes/vitesse-light'),
      import('@shikijs/themes/vitesse-dark'),
    ],
    langs,
    engine: createJavaScriptRegexEngine(),
  }).catch((err) => {
    console.warn('[nuxt-seo] Failed to load shiki highlighter:', err)
    return undefined
  })

  return shiki.value!
}

export function useRenderCodeHighlight(code: MaybeRef<string>, lang: string): ComputedRef<string> {
  return computed(() => {
    if (!shiki.value)
      return ''
    return shiki.value.codeToHtml(toValue(code) || '', {
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
    }) || ''
  })
}
