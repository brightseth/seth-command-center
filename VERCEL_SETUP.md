# Vercel Deployment Setup

## Quick Start: 3 Steps to Production

### Step 1: Create Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it `seth-command-center-db`
6. Copy the `POSTGRES_PRISMA_URL` connection string

### Step 2: Set Environment Variables

In Vercel Dashboard → seth-command-center → Settings → Environment Variables:

Add these variables (Required):
```
DATABASE_URL = [paste POSTGRES_PRISMA_URL from Step 1]
```

Optional (but recommended):
```
GITHUB_TOKEN = ghp_your_github_token_here
GITHUB_USERNAME = brightseth
SENTRY_DSN = https://your-sentry-dsn-here
```

### Step 3: Deploy

```bash
# From your terminal
npx vercel --prod
```

That's it! Your Command Center will be live at:
`https://seth-command-center.vercel.app`

---

## Post-Deployment: Run Migrations

After first successful deployment, you need to create the database tables:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Link to your project
npx vercel link

# Pull environment variables
npx vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Optional: Seed with initial data
npx prisma db seed
```

### Option B: Via Vercel Dashboard

1. Go to your deployment
2. Click "Deployments" → Latest deployment
3. Open "Build Logs"
4. Copy the DATABASE_URL
5. Run locally:
```bash
DATABASE_URL="paste-here" npx prisma migrate deploy
```

---

## Verify Deployment

Test your endpoints:

```bash
# Health check
curl https://seth-command-center.vercel.app/api/health

# Ecosystem health
curl https://seth-command-center.vercel.app/api/ecosystem-health

# Command Center UI
open https://seth-command-center.vercel.app/command-center
```

Expected response from `/api/health`:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "connected": true,
    "projects": 0,
    "tasks": 0,
    "works": 0
  }
}
```

---

## Troubleshooting

### Build fails with "Can't reach database"
- This is expected on first deploy
- Deploy will succeed once DATABASE_URL is set
- Tables will be empty until you run migrations

### "Missing DATABASE_URL"
- Go to Vercel Dashboard → Settings → Environment Variables
- Add DATABASE_URL with your Postgres connection string
- Redeploy

### Cron job not running
- Cron requires Vercel Pro plan for production
- Alternative: Use GitHub Actions or external cron service
- Or trigger manually: `curl -X POST https://your-app.vercel.app/api/rituals/run`

---

## Current Status

✅ Code committed to git
✅ Vercel.json configured
✅ Build command optimized
⏳ Awaiting database setup
⏳ Awaiting environment variables
⏳ Awaiting deployment

**Next**: Follow Steps 1-3 above to complete deployment!
