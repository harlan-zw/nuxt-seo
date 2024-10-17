import type { LanguageInput } from 'shiki'

const lang = {
  displayName: 'robots.txt',
  name: 'robots-txt',
  patterns: [
    { include: '#main' },
  ],
  repository: {
    $base: { patterns: [] },
    $self: { name: 'source.robots-txt' },
    main: {
      patterns: [
        { include: '#comment' },
        { include: '#directive' },
        { include: '#wildcard' },
        { include: '#uri' },
        { include: '#text' },
        { include: '#number' },
      ],
    },
    comment: {
      name: 'comment.line.hash.robots-txt',
      begin: '#',
      end: '$',
      beginCaptures: {
        0: { name: 'punctuation.definition.comment.robots-txt' },
      },
    },
    directive: {
      name: 'keyword.control.directive.robots-txt',
      begin: '^[A-Z][a-z-]*',
      end: '\\s*:',
    },
    wildcard: {
      name: 'constant.character.wildcard.robots-txt',
      match: '\\*',
    },
    uri: {
      name: 'string.unquoted.uri.robots-txt',
      begin: '(?:[a-z]+:)\\/',
      end: '$',
    },
    text: {
      name: 'string.unquoted.text.robots-txt',
      match: '[A-Za-z-]+',
    },
    number: {
      name: 'constant.numeric.integer.robots-txt',
      match: '\\d',
    },
  },
  scopeName: 'text.robots-txt',
} satisfies LanguageInput

export default Object.freeze(lang)
