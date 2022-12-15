<script>
import {defineOgImagePayload} from "../../composables/ogImage";

definePageMeta({
  title: 'About',
  description: 'My description',
  image: 'https://example.com/image.jpg',
})

defineOgImagePayload({
  title: 'About',
  description: 'My description',
  customSomething: 'custom',
})
</script>
<template>
  <div>
    About page
    <InternalLink to="/">home</InternalLink>
  </div>
</template>
