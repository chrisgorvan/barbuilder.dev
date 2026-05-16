# Contributing to BarBuilder.dev

Thank you for your interest in contributing to BarBuilder.dev! This guide will help you get set up and familiar with the development workflow.

## Prerequisites

- Node.js 24+
- pnpm
- Cloudflare account (for deployment)

## Local Development

```bash
# Install dependencies
pnpm install

# Start Workers dev server (http://localhost:8787)
pnpm dev

# Start web UI (http://localhost:3001)
pnpm dev:web

# Run tests
pnpm test
```

## Testing Endpoints

```bash
# Test percentage
curl http://localhost:8787/percentage/75?style=badge&color=red

# Test xofy
curl http://localhost:8787/xofy/3/7?style=segments

# Test icon
curl http://localhost:8787/icon/4/5?shape=heart&color=red&label=Love

# Health check
curl http://localhost:8787/health
```

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

## Manual Deployment

### Cloudflare Workers

```bash
cd cloudflare-worker
pnpm deploy
```

Deploys to `barbuilder.dev/*` globally across 300+ edge locations.

### Cloudflare Pages (Web UI)

```bash
cd web
pnpm build
# Deploy dist/ to Cloudflare Pages
```

## Automated Deployment (GitHub Actions)

Deploys automatically on push to `master`:

- Runs tests
- Deploys to Cloudflare Workers
- Live globally in seconds

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for configuration instructions.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment & CI/CD](./docs/DEPLOYMENT.md)
