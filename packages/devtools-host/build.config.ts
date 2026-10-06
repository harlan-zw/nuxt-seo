import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({ entries: ['src/index'], declaration: true, externals: ['nuxtseo-shared/kit', 'nuxtseo-shared/const'] })
