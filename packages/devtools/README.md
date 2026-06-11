# nuxtseo-devtools

The DevTools UI toolchain for [Nuxt SEO](https://nuxtseo.com) modules.

You normally do not install this yourself. The first time you open the **Nuxt SEO** panel in
Nuxt DevTools, the module adds `nuxtseo-devtools` to your project's `devDependencies` and installs
it. It bundles the build-time UI dependencies (`@nuxt/ui`, `shiki`, `tailwindcss`, Carbon icons)
that the in-project DevTools client is assembled from.

Keeping these out of the SEO modules' runtime dependencies means a normal install of
`@nuxtjs/seo` (or any individual module) no longer pulls the DevTools UI stack into production
`node_modules`; it is provisioned on demand, in dev, only for projects that open the
panel.

## Manual install

If you prefer to add it ahead of time (e.g. for offline development):

```bash
npm install -D nuxtseo-devtools
```

It is dev-only and safe to remove; it will be re-added the next time you open the panel.
