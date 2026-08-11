# SSR performance benchmark

This benchmark builds a production Nuxt app with the complete Nuxt SEO module stack. The stack includes `nuxt-ai-ready`, i18n, and skew protection. It measures:

- server CPU time per SSR render;
- allocated V8 heap per SSR render;
- CPU time and allocation for `robots.txt`, `sitemap.xml`, and `llms.txt`;
- sampled CPU and heap profiles for SSR and the SEO endpoint workload.

Run it locally:

```sh
pnpm dev:prepare
pnpm benchmark:build
pnpm benchmark
```

The result is `bench/performance/result.json`. Profile artifacts are in `bench/performance/profiles/`:

- `ssr-*` contains the SSR profile set;
- `robots-*`, `sitemap-*`, and `ai-ready-*` contain separate endpoint profile sets;
- each `*-profile-analysis.md` contains full and Nuxt SEO focused costs and caller paths;
- each `*-profile-analysis.json` contains machine-readable self, inclusive, module, and path costs;
- each `*-flamegraph.speedscope.json` opens at <https://www.speedscope.app/>;
- each raw `.cpuprofile` and `.heapprofile` contains the V8 data.

The pull request workflow builds the base and head commits on one runner. Its comment leads with a compact workload comparison. Allocation values come from the sampled heap profiles. Module costs and current SSR hotspots stay collapsed until needed. CPU changes need 5% plus measured uncertainty. Memory changes need both 3% and 16 KiB. The artifact preserves both result sets, full caller paths, and all raw profiles.
