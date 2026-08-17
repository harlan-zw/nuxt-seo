import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
    vue: true,
  },
  ...harlanzw({
    base: true,
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
