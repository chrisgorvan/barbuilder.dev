# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-15

### Changed

- **Architecture: Workers-only deployment.** All SVG generation now runs at the Cloudflare edge. The Fastify origin API has been retired from production; it remains in the repository (`api/`) only as a host for HTTP integration tests.
- Worker bundles `@barbuilder/core` directly — no origin round-trip on cache miss.
- Cache headers tightened: successful responses are `Cache-Control: public, max-age=31536000, immutable` with `Surrogate-Key` tags (`version-1`, `type-*`, `style-*`, `color-*`, `theme-*`) for targeted purges.

### Added

- `8bit-heart` icon shape — pixel-art heart with black outline, supports half-fill states.

### Removed

- **`trophy` icon shape.** Bootstrap Icons does not provide a `trophy-half` variant, and workarounds rendered poorly. URLs using `?shape=trophy` now return a 400 with a sanitised error SVG.
  - **Migration:** replace `?shape=trophy` with `?shape=star`, `?shape=heart`, or `?shape=8bit-heart`.

### Security

- Worker emits a fixed set of security headers on every response: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, and `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'`.
- Error messages embedded in error SVGs are stripped of `<>&"'` to prevent reflection.

## [0.1.0]

Initial release. Three-tier architecture (Worker → Fastify origin → in-memory state). Percentage / X-of-Y / icon progress types; classic, pill, minimal, badge, segments styles; single, gradient, and threshold colour modes; light and dark themes.

[Unreleased]: https://github.com/chris-gorvan/barbuilder.dev/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/chris-gorvan/barbuilder.dev/releases/tag/v2.0.0
[1.0.0]: https://github.com/chris-gorvan/barbuilder.dev/releases/tag/v1.0.0
