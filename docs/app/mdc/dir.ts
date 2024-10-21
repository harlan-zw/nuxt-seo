import type { LanguageInput } from 'shiki'

const lang = {
  displayName: 'dir',
  name: 'dir',
  patterns: [
    { include: '#main' },
  ],
  repository: {
    $base: { patterns: [] },
    $self: { name: 'source.dir' },
    main: {
      patterns: [
        { include: '#pipe' },
        { include: '#folder' },
        { include: '#file' },
      ],
    },
    pipe: {
      name: 'punctuation.pipe.dir',
      match: '[|├└│]──',
    },
    folder: {
      name: 'entity.name.folder.dir',
      match: '\\b[a-zA-Z0-9_-]+\\/$',
    },
    file: {
      name: 'entity.name.file.dir',
      match: '\\b[a-zA-Z0-9_-]+\\.[a-zA-Z0-9]+$',
    },
  },
  scopeName: 'text.dir',
} satisfies LanguageInput

export default Object.freeze(lang)
