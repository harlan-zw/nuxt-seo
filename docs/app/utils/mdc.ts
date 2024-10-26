import {
  createMarkdownParser,
  createShikiHighlighter,
  rehypeHighlight,
} from '@nuxtjs/mdc/runtime'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import BashLang from 'shiki/langs/bash.mjs'
import DotEnvLang from 'shiki/langs/dotenv.mjs'
import TsLang from 'shiki/langs/typescript.mjs'
import GithubLightTheme from 'shiki/themes/github-light.mjs'
import DarkTheme from 'shiki/themes/material-theme-palenight.mjs'

let parser: Awaited<ReturnType<typeof createMarkdownParser>>

export default function useMarkdownParser() {
  const parse = async (markdown: string) => {
    if (!parser) {
      parser = await createMarkdownParser({
        rehype: {
          plugins: {
            highlight: {
              instance: rehypeHighlight,
              options: {
                // Pass in your desired theme(s)
                theme: 'github-light',
                // Create the Shiki highlighter
                highlighter: createShikiHighlighter({
                  bundledThemes: {
                    'github-light': GithubLightTheme,
                    'material-theme-palenight': DarkTheme,
                  },
                  // Configure the bundled languages
                  bundledLangs: {
                    dotenv: DotEnvLang,
                    bash: BashLang,
                    // html: HtmlLang,
                    // mdc: MdcLang,
                    // vue: VueLang,
                    // yml: YamlLang,
                    // scss: ScssLang,
                    ts: TsLang,
                    // typescript: TsLang,
                  },
                  engine: await createOnigurumaEngine(import.meta.client ? import('shiki/wasm') : import('shiki/onig.wasm')),
                }),
              },
            },
          },
        },
      })
    }
    return parser(markdown)
  }

  return parse
}
