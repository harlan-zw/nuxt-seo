---
title: Announcing Nuxt SEO Stable
description: Nuxt SEO v2 is here, learn about the journey of this milestone and what's next.
readTime: 5 mins
---

## Introduction

Two years ago I set out to build a suite of SEO modules for Nuxt that would help you with your technical SEO. Today
I'm excited to announce that Nuxt SEO has reached stable.

In this post I'll tell you a bit about the history of building Nuxt SEO, what the stable means and what's next.

## Nuxt SEO History

As a Nuxt v2 user, I wasn't entirely happy with the SEO modules available.

My concerns with them can be summarised as:
- **😔 Boilerplate heavy**: Relied on the end-user implementing a lot of boilerplate where data can be [easily inferred](/docs/sitemap/guides/data-sources).
- **😔 No cross-module compatibility**: Modules did not work with eachother, they can and _should_ inform each other, consider adding a `/sitemap.xml` entry to your `./robots.txt` .
- **😔 Poor documentation**: While the original authors did their best, it wasn't always clear how to do more complex things with the modules.

For those who didn't go through the early days of Nuxt v3, it was a bit chaotic. The ecosystem was in a state of flux, many modules were not compatible with the new version
and previous maintainers had moved on to other projects.

This was the golden opportunity to build new modules specifically for Nuxt v3 that could opt-in to the new module system
and take advantage of the new features that Nuxt v3 had to offer without being bogged down by legacy code.

I set out by introducing two "simple" modules - Nuxt Simple Robots and Nuxt Simple Sitemap.

<div class="sm:grid grid-cols-2 gap-5 space-y-5 sm:space-y-0">

::ModuleCard{slug="robots"}
::

::ModuleCard{slug="sitemap"}
::

</div>

My principals for building them were:
- **✨ Immediate value**: Once installed the modules should immediately start providing value with minimal configuration.
- **🔄 Cross-module compatibility**: SEO modules should talk to each other where possible. Core ecosystem modules should be supported
  out of the box: [Nuxt I18n](https://i18n.nuxtjs.org/), [Nuxt Content](https://content.nuxt.com/), [Nuxt DevTools](https://devtools.nuxt.com/), etc.
- **🟢 Don't get in the way**: All modules expose hooks that give you the final say in the behavior of the module. We prefer hooks over a tedium of configuration options.

As these modules gained traction it was clear there was a demand for these technical SEO modules. So I continued and built the following:

<div class="sm:grid grid-cols-2 gap-5 space-y-5 sm:space-y-0">

::ModuleCard{slug="og-image"}
::

::ModuleCard{slug="schema-org"}
::

::ModuleCard{slug="link-checker"}
::

::ModuleCard{slug="seo-utils"}
::

</div>

The final touch was to combine them all into a module you could install without installing each one individually
and a module that would sync the config between all of the modules

<div class="sm:grid grid-cols-2 gap-5 space-y-5 sm:space-y-0">

::ModuleCard{slug="nuxt-seo"}
::

::ModuleCard{slug="site-config"}
::

</div>

This was introduced as Nuxt SEO Kit at the time and was targeted at **only prerendered apps**.

## Stable Release: v2

Nuxt SEO Kit was released as production-ready, however it was never marked as stable for non-prerendered apps as the submodules
required several breaking changes as they evolved.

As more and more use cases got handled, the module was renamed to Nuxt SEO, and we entered a lengthy RC and beta phase.

To consider Nuxt SEO stable I wanted to support every possible way of building a Nuxt app:
Single Page, Server-Side Generated, Server-Side Rendered, Multi-tenancy, Base URLs, Trailing Slashes, etc.

I also wanted to make sure that the modules integrated with core community modules like Nuxt Content, Nuxt i18n, Nuxt DevTools, etc.

As of today, the modules support all of these use cases and more with a full suite of tests to avoid regressions.

As you can imagine this took a lot of work to get right. In fact, it took exactly
**4.4k commits, 1.2k issues and 72 contributes** to pull off.

In this time the project has grown significantly, with the modules cumulatively getting **1.6M downloads a month**.

I won't bore you with all the minor details related to this [releases](/releases), but what you should know:
- No breaking changes are planned for the foreseeable future unless they're unavoidable.
- Most modules are considered "done", new features will only be introduced in exceptional cases.
- The modules can be considered battle tested with a large number of users and use cases.

The final thing to get the stable out was redoing all of the docs. The docs are the main interface between you and the module
and they should reflect the care and attention that went into building the modules.

## New Docs

The new docs have been designed in a way to optimize for readability, giving whitespace the respect it deserves.

They use the greenest of the greenfield: Nuxt v4, [Nuxt UI v3](https://ui3.nuxt.dev/) (Tailwind v4), Nuxt Content v3

You'll also find some new features:
- [Releases](/releases) page to see what's new in each version.
- New learning resources to help you get started withtechnical SEO, check out the [Controlling Web Crawlers](learn/controlling-crawlers) and [Page Titles](/learn/mastering-meta/titles) guides.
- The ability to switch majors on the sidebar, this will be possible for future major versions as the content structure has changed to support this.
- Feedback buttons on every docs page, let me know how I'm doing!

## What's Next?

There are a few upcoming upstream updates that Nuxt SEO will need to support:

- **Nuxt v4 / Nitro v3**: While Nuxt SEO has been tested with Nuxt v4, it has not been fully tested with Nitro v3 which is still in development.
- **[Nuxt Content v3](https://content3.nuxt.dev/)**: Will likely require new module configuration and hooks.
- **[Nuxt I18n v9](https://i18n.nuxtjs.org/docs/v9/guide/breaking-changes-in-v9)**: Should already be fully supported but will require more testing once stable.

As the project is now officially stable I look forward to what else is missing from the Nuxt SEO ecosystem.

## Nuxt SEO Pro

I have some ambitious goals for new modules to build and content to create that will continue to help with your technical SEO but
also help you in growing your site organically.

To align incentives with myself and you, the community, I'm introducing a Pro version of Nuxt SEO to help fund the development.

I will be working on a one-time payment Pro version of Nuxt SEO that will include access to new modules and learning resources
that will be ready mid-2025.

You can learn more and pre-purchase it for a discount on the [Nuxt SEO Pro](/pro) page.

## Conclusion

I'd like to thank the community for their patience and feedback to get the project to where it is today.

My sponsors have also helped me immensely as it's difficult to justify working so many hours on an open-source project without financial support.

Thanks for your time and I hope you enjoy Nuxt SEO!
