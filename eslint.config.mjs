import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
    ignores: [
      'CLAUDE.md',
      'test/fixtures/**',
      'playground/**',
      '**/test/fixtures/**',
      '**/playground/**',
      '.claude',
    ],
    rules: {
      'node/prefer-global/buffer': 'off',
    },
  },
  ...harlanzw({ link: true, nuxt: true, vue: true }),
  {
    rules: {
      'harlanzw/prompt-mixed-conventions': 'off',
    },
  },
)
