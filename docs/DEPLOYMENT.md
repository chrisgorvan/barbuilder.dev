# Deployment Setup

This project uses GitHub Actions to automatically deploy to Cloudflare Workers on merge to `main`.

## GitHub Secrets Configuration

You need to configure the following secret in your GitHub repository:

### `CLOUDFLARE_API_TOKEN`

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Configure permissions:
   - **Account** → Cloudflare Workers → Edit
   - **Zone** → Workers Routes → Edit (if using routes)
5. Set **Account Resources** to include your account
6. Set **Zone Resources** to include `barbuilder.dev` (if using custom domain)
7. Click **Continue to summary** → **Create Token**
8. Copy the token (you won't see it again!)

### Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Paste your Cloudflare API token
6. Click **Add secret**

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
