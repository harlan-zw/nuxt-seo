<script setup lang="ts">
import type {
  HashtagEntity,
  Indices,
  MediaEntity,
  SymbolEntity,
  Tweet,
  UrlEntity,
  UserMentionEntity,
} from './utils'
import { h } from 'vue'
import key from './.keys'
import LegoTweetLink from './Link.vue'
import { getHashtagUrl, getSymbolUrl, getUserUrl } from './utils'

const props = defineProps<{ linkClass?: string }>()

const tweet = inject(key)

interface TextEntity {
  indices: Indices
  type: 'text'
}

type Entity =
  | TextEntity
  | (HashtagEntity & { type: 'hashtag' })
  | (UserMentionEntity & { type: 'mention' })
  | (UrlEntity & { type: 'url' })
  | (MediaEntity & { type: 'media' })
  | (SymbolEntity & { type: 'symbol' })

function addEntities(
  result: Entity[],
  entities: (HashtagEntity | UserMentionEntity | MediaEntity | SymbolEntity)[],
  type: Entity['type'],
) {
  for (const entity of entities) {
    for (const [i, item] of result.entries()) {
      if (
        entity.indices[0] < item.indices[0]
        || entity.indices[1] > item.indices[1]
      ) {
        continue
      }

      const items = [{ ...entity, type }] as Entity[]

      if (item.indices[0] < entity.indices[0]) {
        items.unshift({
          indices: [item.indices[0], entity.indices[0]],
          type: 'text',
        })
      }
      if (item.indices[1] > entity.indices[1]) {
        items.push({
          indices: [entity.indices[1], item.indices[1]],
          type: 'text',
        })
      }

      result.splice(i, 1, ...items)
      break // Break out of the loop to avoid iterating over the new items
    }
  }
}

function getEntities(tweet: Tweet) {
  const result: Entity[] = [
    { indices: tweet.display_text_range, type: 'text' },
  ]

  addEntities(result, tweet.entities.hashtags, 'hashtag')
  addEntities(result, tweet.entities.user_mentions, 'mention')
  addEntities(result, tweet.entities.urls, 'url')
  addEntities(result, tweet.entities.symbols, 'symbol')
  if (tweet.entities.media)
    addEntities(result, tweet.entities.media, 'media')

  return result
}

const entities = computed(() => {
  if (!tweet?.value)
    return
  const parsedEntities = getEntities(tweet.value)

  // Update display_text_range to work w/ Array.from
  // Array.from is unicode aware, unlike string.slice()
  if (tweet.value.entities.media && tweet.value.entities.media[0].indices[0] < tweet.value.display_text_range[1]) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    tweet.value.display_text_range[1] = tweet.value.entities.media[0].indices[0]
  }
  const lastEntity = parsedEntities.at(-1)
  if (lastEntity && lastEntity.indices[1] > tweet.value.display_text_range[1])
    lastEntity.indices[1] = tweet.value.display_text_range[1]

  return parsedEntities
})

function render() {
  return h('div', { style: 'white-space: break-spaces' }, () => [
    (tweet?.value && entities.value)
      ? entities.value?.map((item, i) => {
        const text = Array.from(tweet.value.text)
          .splice(item.indices[0], item.indices[1] - item.indices[0])
          .join('')

        switch (item.type) {
          case 'hashtag':
            return h(
              LegoTweetLink,
              { key: i, class: props.linkClass, href: getHashtagUrl(item) },
              () => text,
            )
          case 'mention':
            return h(
              LegoTweetLink,
              {
                key: i,
                class: props.linkClass,
                href: getUserUrl(item.screen_name),
              },
              () => text,
            )
          case 'url':
            return h(
              LegoTweetLink,
              { key: i, class: props.linkClass, href: item.expanded_url },
              () => item.display_url,
            )
          case 'symbol':
            return h(
              LegoTweetLink,
              { key: i, class: props.linkClass, href: getSymbolUrl(item) },
              () => text,
            )
          case 'media':
            // Media text is currently never displayed, some tweets however might have indices
            // that do match `display_text_range` so for those cases we ignore the content.
            return undefined
          default:
            return h('span', () => text)
        }
      })
      : h(''),
  ])
}
</script>

<template>
  <render />
</template>
