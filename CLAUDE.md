# Nuxt SEO

Monorepo for `@nuxtjs/seo`, a meta module that installs and configures all Nuxt SEO modules.

## Nuxt SEO Modules

All module repos live in `~/pkg`. The `@nuxtjs/seo` module bundles these:

| Module               | Package | Path |
|----------------------|---|---|
| Robots               | `@nuxtjs/robots` | `~/pkg/nuxt-robots` |
| Sitemap              | `@nuxtjs/sitemap` | `~/pkg/sitemap` |
| OG Image             | `nuxt-og-image` | `~/pkg/og-image` |
| Schema.org           | `nuxt-schema-org` | `~/pkg/nuxt-schema-org` |
| SEO Utils            | `nuxt-seo-utils` | `~/pkg/nuxt-seo-utils` |
| Link Checker         | `nuxt-link-checker` | `~/pkg/nuxt-link-checker` |
| Site Config          | `nuxt-site-config` | `~/pkg/nuxt-site-config` |

### Pro Modules

These modules are not bundled in `@nuxtjs/seo` but are available for installation separately. They are marked "PRO" as they are in early access and may require a license for production use.

| Module               | Package | Path |
|----------------------|---|---|
| PRO: Skew Protection | `nuxt-skew-protection` | `~/pkg/nuxt-skew-protection` |
| PRO: AI Ready        | `nuxt-ai-ready` | `~/pkg/nuxt-ai-ready` |

