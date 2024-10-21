<script setup lang="ts">
definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Home',
  },
})

const md = `
## Introduction

Hi there,

I've been working on Nuxt SEO for almost two years now which feels surreal to me.

I originally built the modules to help me with my own projects and in turn the wider community. They have been a
great success and I appreciate everyone who has used the modules and contributed in any meaningful way.

As the project is now officially stable I look forward to what else is missing from the Nuxt SEO ecosystem and how I can help
to fill those gaps.

I have some ambitious goals for new modules to build and content to create that will continue to help you grow your sites organically.

## Nuxt SEO Pro

I will be working on a one-time payment Pro version of Nuxt SEO that will include access to new modules and learning resources.

The outline of the modules I plan to build are:

### Nuxt Magic Redirects

Never worry about a 404 again.

**Features**

- Automatic redirects when you move pages
- Get prompted to create redirects when you delete pages
- Simple UI to see all production 404s and create redirects

### Nuxt Google Search Console

###

## Pricing and Presale Discount

I don't expect Nuxt SEO Pro to be available until mid-2025, but I am offering a presale discount to those who are interested.

## Purchase

## Conclusion

Thanks for taking the time to read.
`
</script>

<template>
  <div>
    <div class="gradient" />
    <section class="max-w-xl mx-auto py-5 sm:py-12 xl:py-20">
        <div>
          <MDC :value="md" />
        </div>
    </section>
  </div>
</template>
