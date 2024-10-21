/* eslint-disable */
<script lang="ts">
import type { NavItem } from '@nuxt/content'
import type { AppConfig } from '@nuxt/schema'
import type { AccordionRootEmits, AccordionRootProps } from 'radix-vue'
import _appConfig from '#build/app.config'
import theme from '#build/ui-pro/content/content-navigation'
import { tv, type VariantProps } from 'tailwind-variants'

const appConfig = _appConfig as AppConfig & { uiPro: { contentNavigation: Partial<typeof theme> } }

const contentNavigation = tv({ extend: tv(theme), ...(appConfig.uiPro?.contentNavigation || {}) })

type ContentNavigationVariants = VariantProps<typeof contentNavigation>

export interface ContentNavigationLink extends NavItem {
  children?: ContentNavigationLink[]
  defaultOpen?: boolean
}

export interface ContentNavigationProps<T> extends Pick<AccordionRootProps, 'disabled' | 'type'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  /**
   * When `true`, the tree will be opened based on the current route.
   * When `false`, the tree will be closed.
   * When `undefined` (default), the first item will be opened with `type="single"` and the first level will be opened with `type="multiple"`.
   */
  defaultOpen?: boolean
  /**
   * The icon displayed to toggle the accordion.
   * @defaultValue appConfig.ui.icons.chevronDown
   */
  trailingIcon?: string
  color?: ContentNavigationVariants['color']
  variant?: ContentNavigationVariants['variant']
  /**
   * Display a line next to the active link.
   * @defaultValue false
   */
  highlight?: boolean
  highlightColor?: ContentNavigationVariants['highlightColor']
  /**
   * When type is "single", allows closing content when clicking trigger for an open item.
   * When type is "multiple", this prop has no effect.
   *
   * @defaultValue true
   */
  collapsible?: boolean
  level?: number
  navigation?: T[]
  class?: any
  ui?: Partial<typeof contentNavigation.slots>
}

export interface ContentNavigationEmits extends AccordionRootEmits {}

type SlotProps<T> = (props: { link: T, active?: boolean }) => any

export interface ContentNavigationSlots<T> {
  'title': (props?: {}) => any
  'link': SlotProps<T>
  'link-leading': SlotProps<T>
  'link-title': SlotProps<T>
  'link-trailing': SlotProps<T>
}
</script>

<script setup lang="ts" generic="T extends ContentNavigationLink">
import { useAppConfig, useRoute } from '#imports'
import { pickLinkProps } from '#ui/utils/link'
import { mapContentItem } from '#ui-pro/utils/content'
import { createReusableTemplate, reactivePick } from '@vueuse/core'
import { Primitive, useForwardPropsEmits } from 'radix-vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<ContentNavigationProps<T>>(), {
  as: 'nav',
  defaultOpen: undefined,
  level: 0,
  type: 'multiple',
  collapsible: true,
  highlight: false,
})

const emits = defineEmits<ContentNavigationEmits>()

const slots = defineSlots<ContentNavigationSlots<T>>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'collapsible', 'disabled', 'type'), emits)

const route = useRoute()
const appConfig = useAppConfig()
const [DefineLinkTemplate, ReuseLinkTemplate] = createReusableTemplate<{ link: ContentNavigationLink, active?: boolean }>()

const ui = computed(() => contentNavigation({
  color: props.color,
  variant: props.variant,
  highlight: props.level > 0 && props.highlight,
  highlightColor: props.highlightColor || props.color,
}))
</script>

<template>
  <DefineLinkTemplate v-slot="{ link, active }">
    <slot name="link" :link="(link as T)" :active="active">
      <slot name="link-leading" :link="(link as T)" :active="active">
        <UIcon v-if="link.icon" :name="link.icon" :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon, active })" />
      </slot>

      <span v-if="link.title || !!slots['link-title']" :class="ui.linkTitle({ class: props.ui?.linkTitle, active })">
        <slot name="link-title" :link="(link as T)" :active="active">
          {{ link.title }}
        </slot>

        <UIcon v-if="link.target === '_blank'" :name="appConfig.ui.icons.external" :class="ui.linkTitleExternalIcon({ class: props.ui?.linkTitleExternalIcon, active })" />
      </span>

      <span v-if="link.badge || (link.children?.length && !disabled) || !!slots['link-trailing']" :class="ui.linkTrailing({ class: props.ui?.linkTrailing })">
        <slot name="link-trailing" :link="(link as T)" :active="active">
          <UBadge
            v-if="link.badge"
            variant="subtle"
            size="sm"
            v-bind="(typeof link.badge === 'string' || typeof link.badge === 'number') ? { label: link.badge } : link.badge"
            :class="ui.linkTrailingBadge({ class: props.ui?.linkTrailingBadge })"
          />
        </slot>
      </span>
    </slot>
  </DefineLinkTemplate>

  <Primitive v-bind="$attrs" :as="as" :as-child="level > 0" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <ul :class="level > 0 ? ['!ml-1', ui.listWithChildren({ class: props.ui?.listWithChildren })] : ui.list({ class: props.ui?.list })">
      <template v-for="(link, index) in navigation" :key="index">
        <li v-if="link.children?.length" :class="ui.itemWithChildren({ class: props.ui?.itemWithChildren })" :value="String(index)">
          <div :class="ui.header({ class: props.ui?.header })">
            <ReuseLinkTemplate :link="link" />
          </div>

          <div :class="ui.content({ class: props.ui?.content })">
            <ContentNavigation
              v-bind="rootProps"
              :navigation="link.children"
              :default-open="defaultOpen"
              :level="level + 1"
              :trailing-icon="trailingIcon"
              :color="color"
              :variant="variant"
              :highlight="highlight"
              :highlight-color="highlightColor"
            >
              <template #link="{ link, active }">
                <ReuseLinkTemplate :link="link" :active="active" />
              </template>
            </ContentNavigation>
          </div>
        </li>

        <li v-else :class="ui.item({ class: props.ui?.item })">
          <ULink v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(mapContentItem(link))" custom>
            <ULinkBase v-bind="slotProps" :class="ui.link({ class: props.ui?.link, active, disabled: !!link.disabled })">
              <ReuseLinkTemplate :link="link" :active="active" />
            </ULinkBase>
          </ULink>
        </li>
      </template>
    </ul>
  </Primitive>
</template>
