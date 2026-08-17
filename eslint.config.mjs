import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
    vue: true,
  },
  ...harlanzw({
    // base only ignores a root-level `playground/`, and this repo has one per package
    base: { ignores: ['**/playground/**'] },
    link: true,
    nuxt: true,
    vue: true,
  }),
  {
    rules: {
      'harlanzw/prompt-mixed-conventions': 'off',
    },
  },
)
