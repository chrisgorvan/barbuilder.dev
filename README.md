# BarBuilder.dev

> Stateless HTTP microservice for generating cacheable SVG progress bars via URL parameters

**Production:** Runs entirely on Cloudflare Workers at the edge
**Latency:** <50ms globally

## Quick Start

### Development

```bash
# Start Workers dev server
pnpm dev

# Start web UI
pnpm dev:web

# Run tests
pnpm test
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy
```

## Architecture

**Current (v2.0):** Cloudflare Workers-only (all SVG generation at edge)

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
├── packages/
│   └── core/              # Shared SVG generation library (@barbuilder/core)
│       ├── src/
│       │   ├── core/      # Types, colours, validation, SVG builder
│       │   ├── generators/ # Percentage, X-of-Y, icon generators
│       │   └── styles/    # Classic, pill, minimal, badge, segments renderers
│       └── tests/         # Unit tests for core logic
│
├── cloudflare-worker/     # Production: Workers-based API (DEPLOYED)
│   ├── src/index.ts       # Workers fetch handler
│   └── wrangler.toml      # Cloudflare configuration
│
├── web/                   # Web UI (static site)
│   ├── partials/          # Shared HTML partials (head, header, footer)
│   ├── src/css/main.css   # Consolidated stylesheet
│   └── docs/              # API docs, embedding guide
│
├── api/                   # Fastify server (integration tests only)
│   ├── src/               # Server & routes (imports @barbuilder/core)
│   └── tests/integration/ # HTTP-level integration tests
│
└── docs/
    ├── ARCHITECTURE.md    # System architecture
    └── DEPLOYMENT.md      # Deployment & CI/CD setup
```

## API Endpoints

All endpoints run on Cloudflare Workers at `https://api.barbuilder.dev`

### Progress Types

**Percentage:**

```
GET /percentage/{value}?style=badge&color=red&label=Build
```

**X of Y:**

```
GET /xofy/{current}/{total}?style=segments&color=blue
```

**Icon:**

```
GET /icon/{current}/{total}?shape=star&color=gold&label=Rating
```

### Styles

- `classic` - Traditional bar with label section
- `pill` - Rounded ends, modern look
- `minimal` - Thin bar, no labels
- `badge` - Badge style with auto-value
- `segments` - Discrete blocks

### Query Parameters

- `style` - Style name (default: `classic`)
- `color` - Named color or hex (`red`, `4c1`, `ff0000`)
- `label` - Text label (auto-generated if omitted)
- `theme` - `light` or `dark` (default: `light`)
- `width` - Width in pixels (50-500, default: 200)
- `segments` - Number of segments for segments style (2-20)
- `shape` - Icon shape: `8bit-heart`, `circle`, `heart`, `star` (default: `star`)
  - All shapes support half-rendering for fractional values (e.g., 3.5 out of 5)
  - `8bit-heart` - Custom pixel art heart with retro video game aesthetic

## Examples

**Build Status Badge:**

```
![Build](https://api.barbuilder.dev/percentage/100?style=badge&color=4c1&label=Build)
```

**Task Progress:**

```
![Progress](https://api.barbuilder.dev/xofy/7/10?style=segments&color=1e90ff&label=Tasks)
```

**Star Rating:**

```
![Rating](https://api.barbuilder.dev/icon/4/5?shape=star&color=ffd700&label=Rating)
```

## Internationalization

The web interface supports multiple languages:

- **English** (default)
- **Spanish** (Español)
- **French** (Français)
- **German** (Deutsch)

Language preference is stored in browser localStorage and auto-detected based on browser settings. Users can switch languages using the selector in the header.

## Migration Guide

### v2.0.0 - Trophy Icon Removed

The `trophy` icon shape has been **removed** due to rendering issues with half-states (Bootstrap Icons does not provide a `trophy-half` variant, requiring workarounds that didn't render cleanly).

**Migration:**

- Replace `?shape=trophy` with `?shape=star`, `?shape=heart`, or `?shape=8bit-heart`
- Existing URLs with `?shape=trophy` will return a 400 error with a message indicating the shape is no longer supported

**New shape added in v2.0:**

- `8bit-heart` - Retro pixel art heart with black outline

## Contributing

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for development setup, testing, and deployment instructions.

## Costs

**Free tier includes:**

- 100,000 requests/day
- Global edge deployment
- Zero cold starts
- Unlimited bandwidth

**After free tier:** ~$0.50 per million requests

**Estimated monthly cost:** $0-5 for most use cases

## Performance

- **Cache Hit (95%):** <10ms
- **Cache Miss (5%):** <50ms (generated at edge)
- **Availability:** 99.99%
- **Global:** 300+ Cloudflare edge locations

## License

MIT — see [LICENSE](./LICENSE).

## Documentation

- [Contributing](./.github/CONTRIBUTING.md)
- [Security Policy](./.github/SECURITY.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment & CI/CD](./docs/DEPLOYMENT.md)
