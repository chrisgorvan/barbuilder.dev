# Deployment Setup

This project uses GitHub Actions to automatically deploy to Cloudflare Workers on merge to `main`.

## GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

### `CLOUDFLARE_API_TOKEN`

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Configure permissions:
   - **Account** → Cloudflare Workers → Edit
   - **Account** → Cloudflare Pages → Edit
   - **Zone** → Workers Routes → Edit (if using routes)
5. Set **Account Resources** to include your account
6. Set **Zone Resources** to include `barbuilder.dev` (if using custom domain)
7. Click **Continue to summary** → **Create Token**
8. Copy the token (you won't see it again!)

### `CLOUDFLARE_ACCOUNT_ID`

Required for the Cloudflare Pages deploy step (the Pages API needs an explicit account ID, unlike Workers which derives it from `zone_name` in `wrangler.toml`).

1. Open any zone in the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Copy the **Account ID** from the right sidebar (32-char hex string)

### Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

## Deployment Workflow

The deployment happens automatically:

1. **Trigger**: Push to `main` branch
2. **Steps**:
   - Checkout code
   - Install dependencies
   - Run tests (deployment fails if tests fail)
   - Deploy to Cloudflare Workers with minification

## Manual Deployment

You can also deploy manually from your local machine:

```bash
cd cloudflare-worker
pnpm deploy
```

This requires `CLOUDFLARE_API_TOKEN` environment variable or Wrangler authentication.

## Monitoring Deployments

- View deployment status in the **Actions** tab of your GitHub repository
- Each deployment takes ~1-2 minutes
- Failed deployments will not affect the currently running Worker
- Successful deployments are live globally within seconds

## Rollback

To rollback a deployment:

1. Revert the commit on `main` branch
2. Push the revert commit
3. GitHub Actions will automatically deploy the previous version

Or use Wrangler CLI:

```bash
cd cloudflare-worker
pnpm wrangler rollback
```
