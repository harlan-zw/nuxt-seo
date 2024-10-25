export default defineAppConfig({
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 5000,
  },
  theme: {
    radius: 0.25,
  },
  ui: {
    icons: {
      caution: 'carbon-warning-alt',
      copy: 'carbon-copy',
      dark: 'carbon-moon',
      document: 'carbon-document',
      external: 'carbon-launch',
      hash: 'carbon-hash',
      light: 'carbon-sun',
      menu: 'carbon-menu',
      next: 'carbon-arrow-right',
      note: 'carbon-information',
      prev: 'carbon-arrow-left',
      system: 'carbon-computer',
      tip: 'carbon-lightbulb',
      warning: 'carbon-warning',
      chevronDoubleLeft: 'carbon-chevron-double-left',
      chevronDoubleRight: 'carbon-chevron-double-right',
      chevronDown: 'carbon-chevron-down',
      chevronLeft: 'carbon-chevron-left',
      chevronRight: 'carbon-chevron-right',
      arrowLeft: 'carbon-arrow-left',
      arrowRight: 'carbon-arrow-right',
      check: 'carbon-checkmark',
      close: 'carbon-close',
      ellipsis: 'carbon-overflow-menu-horizontal',
      loading: 'carbon-loading',
      minus: 'carbon-subtract',
      search: 'carbon-search',
    },
    colors: {
      primary: 'green',
      gray: 'slate',
    },
  },
  uiPro: {
    prose: {
      codeIcon: {
        'robots.txt': 'vscode-icons:file-type-robots',
      },
    },
  },
})
