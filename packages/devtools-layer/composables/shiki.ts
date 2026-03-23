import type { HighlighterCore, LanguageRegistration } from 'shiki'
import type { ComputedRef, MaybeRef, Ref } from 'vue'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { computed, ref, toValue } from 'vue'
import { colorMode } from './rpc'

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
    const theme = colorMode.value === 'dark' ? 'vitesse-dark' : 'vitesse-light'
    return shiki.value.codeToHtml(toValue(code) || '', {
      lang,
      theme,
    }) || ''
  })
}
