<!-- Thanks for contributing! A short PR is much easier to review than a long one. -->

## Summary

<!-- One or two sentences: what does this PR change and why? -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (changes SVG output for existing URLs, or alters the request/response contract)
- [ ] Docs / tooling / CI only

## Caching impact

<!--
  SVG responses are cached as immutable for 1 year, keyed by URL and invalidated
  via Surrogate-Key (version-*, type-*, style-*, color-*, theme-*).
  If this PR changes the SVG produced for any existing URL, describe the
  invalidation strategy below (e.g. bump `version-1` to `version-2`, or
  targeted purge of a specific style key).
-->

- [ ] No change to existing SVG output
- [ ] Output changes — invalidation plan documented above

## Checklist

- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes (if UI or routing changed)
- [ ] `pnpm format` run
- [ ] Documentation updated where relevant (README, `docs/ARCHITECTURE.md`, CHANGELOG)
