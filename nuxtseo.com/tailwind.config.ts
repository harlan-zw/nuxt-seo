import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>> {
  content: [
    'content/**/*.md',
  ],
  theme: {
    extend: {
      fontFamily: {
        // title family
        title: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        '8xl': '90rem',
      },
    },
  },
}
