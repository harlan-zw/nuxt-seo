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

### Standalone Modules

These modules are not bundled in `@nuxtjs/seo` but are available for installation separately.

| Module               | Package | Path |
|----------------------|---|---|
| Skew Protection | `nuxt-skew-protection` | `~/pkg/nuxt-skew-protection` |
| AI Ready        | `nuxt-ai-ready` | `~/pkg/nuxt-ai-ready` |

## Website

The nuxtseo.com website source lives at `~/sites/nuxtseo.com`. It is a Nuxt app deployed to Cloudflare Workers with D1 databases. The `nuxt-seo-pro` layer (`layers/nuxt-seo-pro/`) contains the Pro dashboard, telemetry API, and license verification endpoints.


<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
