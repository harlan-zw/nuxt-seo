import {
  createMarkdownParser,
  createShikiHighlighter,
  rehypeHighlight,
} from '@nuxtjs/mdc/runtime'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'
import BashLang from 'shiki/langs/bash.mjs'
import DotEnvLang from 'shiki/langs/dotenv.mjs'
import HtmlLang from 'shiki/langs/html.mjs'
import MdcLang from 'shiki/langs/mdc.mjs'
import TsLang from 'shiki/langs/typescript.mjs'
import GithubLightTheme from 'shiki/themes/github-light.mjs'
import DarkTheme from 'shiki/themes/material-theme-palenight.mjs'

const sharedParserContainer: { parser?: Awaited<ReturnType<typeof createMarkdownParser>> } = {}

export default function useMarkdownParser(nuxtApp?: NuxtApp) {
  const container = nuxtApp || tryUseNuxtApp() || sharedParserContainer
  const parse = async (markdown: string) => {
    if (!container?.parser) {
      container.parser = await createMarkdownParser({
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
                    html: HtmlLang,
                    mdc: MdcLang,
                    // vue: VueLang,
                    // yml: YamlLang,
                    // scss: ScssLang,
                    ts: TsLang,
                    // typescript: TsLang,
                  },
                  engine: await createJavaScriptRegexEngine(),
                }),
              },
            },
          },
        },
      })
    }
    return container.parser(markdown, {
      toc: false,
    })
  }

  return parse
}
