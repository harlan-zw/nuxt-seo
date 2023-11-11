---
title: Breadcrumb
description: A Breadcrumb component used to display a breadcrumb list that helps users to navigate between pages.
---

- Integrates with [nuxt-schema-org](/schema-org) to automatically generate [BreadcrumbList](https://schema.org/BreadcrumbList) structured data.
- Accessible by default.
- Localisation for 5 languages (English, French, Spanish, German, Italian)
- Headless with optional UI (`useBreadcrumbUI` composable)

## Example

:component-example{component="breadcrumb-default-example"}

## Usage

You can either generate the items for the breadcrumb automatically or manually.

### Automatic generation

To automatically generate the items for the breadcrumb, you can use the `useBreadcrumbItems` composable.

```vue
<script setup lang="ts">
const items = useBreadcrumbItems()
</script>

<template>
  <SBreadcrumb :items="items" />
</template>
```

This will generate the items for the breadcrumb based on the current route, alternatively you can pass in a `path`.

:component-example{component="breadcrumb-auto-example"}

To determine the label of the item, it will use the `breadcrumb` property of the route meta.

If you're using the [@nuxtjs/i18n](https://i18n.nuxtjs.org/) module, you can use the key `seoUi.breadcrumbs.items.${routeName}`.

::code-group

```vue [Page Meta]
<script lang="ts" setup>
// pages/index.vue
// change the home page breadcrumb label
definePageMeta({
  breadcrumb: {
    icon: 'heroicons-solid:home',
    ariaLabel: 'Home'
  },
})
</script>
```

```json [I18n]
{
  "seoUi": {
    "breadcrumb": {
      "items": {
        "index": {
          "icon": "heroicons-solid:home",
          "ariaLabel": "Home"
        }
      }
    }
  }
}
```

::

### Manual generation

Pass an array to the `items` prop of the Breadcrumb component. Each item can have the following properties:

- `label` - The label of the item.
- `icon` - The icon of the link.
- `disabled` - Whether the item is disabled.
- `separator` - The separator of the item.
- `to` - The link to the item.
- `current` - Whether the item is the current one.
- `ariaLabel` - The aria label of the item.
- `ariaCurrent` - The aria current of the item.

### UI

You can use the [useBreadcrumbUI](https://github.com/harlan-zw/nuxt-seo-ui/blob/main/src/runtime/composables/useBreadcrumbsUi.ts) composable to generate the UI for the breadcrumb.

If you need to customize the UI, you can provide your own implementation.

:component-example{component="breadcrumb-custom-example"}

## Slots

You can use slots to customize links display.

### `default`

Use the `#default` slot to customize the link label. You will have access to the `link` and `isActive` properties in the slot scope.

:component-example{component="breadcrumb-item-slot"}

## Props

### `multiline`

- Type: `Boolean`
- Default: `false`

Whether the last breadcrumb item should be displayed on a new line.

:component-example{component="breadcrumb-multiline-example"}

### `responsiveDisplay`

- Type: `Boolean`
- Default: `true`

Should breadcrumbs automatically try and fit the device width. For mobile this may hide items and cause a layout shift.
