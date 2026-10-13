import type { NitroRuntimeCompatibility } from '../../src/kit'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { renderNitroTypeAugmentations } from '../../src/kit'

describe('nitro 2 route rule types', () => {
  it.each(['nitropack', 'nitropack/types'])('types custom config and runtime rules through %s', (module) => {
    const compatibility: NitroRuntimeCompatibility = {
      _tag: 'nitro-v2',
      eventContextModule: 'h3',
      eventContextType: 'H3EventContext',
      eventType: `import('h3').H3Event`,
      nitroTypesModule: 'nitropack',
    }
    const declarations = renderNitroTypeAugmentations(compatibility, {
      routeConfig: 'robots?: boolean',
      routeRules: 'robots?: boolean',
    })
    const filename = join(import.meta.dirname, 'route-rule-consumer.mts')
    const source = `import 'nitropack'
import 'nitropack/types'
${declarations}
import type { NitroRouteConfig, NitroRouteRules } from '${module}'
const config: NitroRouteConfig = { robots: false }
const rules: NitroRouteRules = { robots: false }
const robots: boolean | undefined = rules.robots
// @ts-expect-error Custom route rules must keep their declared value type.
const invalidConfig: NitroRouteConfig = { robots: 'invalid' }
// @ts-expect-error Custom runtime rules must keep their declared value type.
const invalidRules: NitroRouteRules = { robots: 'invalid' }
`
    const options: ts.CompilerOptions = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    }
    const host = ts.createCompilerHost(options)
    const getSourceFile = host.getSourceFile
    host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) => path === filename
      ? ts.createSourceFile(path, source, languageVersion)
      : getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile)
    const program = ts.createProgram({ rootNames: [filename], options, host })
    const errors = ts.getPreEmitDiagnostics(program).map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    expect(errors).toEqual([])
  })
})
