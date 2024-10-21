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
