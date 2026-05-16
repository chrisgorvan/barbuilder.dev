# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BarBuilder, please report it responsibly.

**Do not open a public issue.** Instead, please email:

**security@barbuilder.dev**

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgement:** Within 48 hours
- **Initial assessment:** Within 5 working days
- **Fix or mitigation:** Depends on severity, but we aim for under 30 days for critical issues

## Scope

The following are in scope:

- The BarBuilder API (`barbuilder.dev/*`)
- The BarBuilder web interface
- The Cloudflare Worker source code
- Dependencies used in production

The following are **out of scope**:

- The development-only Fastify API server (`api/`)
- Third-party services (Cloudflare infrastructure, GitHub)

## Supported Versions

Only the latest version deployed to production is supported with security updates.

## Recognition

We are happy to credit researchers who report valid vulnerabilities responsibly. Let me know if you would like to be acknowledged.
