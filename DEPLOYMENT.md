# Seth Command Center - Deployment Guide

## Production Deployment to Vercel

### Prerequisites

- Vercel account connected to your GitHub
- PostgreSQL database (Vercel Postgres recommended)
- Sentry account (optional but recommended)

### Step 1: Prepare Database

#### Option A: Vercel Postgres (Recommended)

1. Go to Vercel Dashboard
2. Create new PostgreSQL database
3. Copy the `DATABASE_URL` connection string

#### Option B: External PostgreSQL

Use any PostgreSQL provider (Neon, Supabase, Railway, etc.)

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables:

```bash
# Required
DATABASE_URL=postgresql://...  # Your PostgreSQL connection string

# Optional but recommended
SENTRY_DSN=https://...         # From sentry.io
GITHUB_TOKEN=ghp_...           # GitHub personal access token
GITHUB_USERNAME=brightseth     # Your GitHub username
EDEN_BRIDGE_API_KEY=...        # Eden API key

# Optional
REDIS_URL=redis://...          # For production job queue
```

### Step 3: Deploy to Vercel

```bash
# From your terminal
cd /Users/seth/seth-command-center

# Login to Vercel (if not already)
npx vercel login

# Deploy
npx vercel --prod
```

### Step 4: Run Database Migrations

After deployment, Vercel will automatically run:
1. `prisma generate` - Generate Prisma Client
2. `prisma migrate deploy` - Apply migrations to production DB
3. `next build` - Build the Next.js app

### Step 5: Verify Deployment

Test your health endpoints:

```bash
# Basic health check
curl https://your-app.vercel.app/api/health

# Ecosystem health check
curl https://your-app.vercel.app/api/ecosystem-health

# Command Center UI
open https://your-app.vercel.app/command-center
```

### Step 6: Seed Production Database (Optional)

If you want to populate with initial data:

```bash
# SSH into your database and run seed script manually
# Or create an API endpoint to trigger seed
POST https://your-app.vercel.app/api/admin/seed
```

## Automated Rituals

The `vercel.json` file configures a cron job:

```json
{
  "crons": [
    {
      "path": "/api/rituals/run",
      "schedule": "30 8 * * *"
    }
  ]
}
```

This will run your morning ritual at 8:30 AM UTC daily.

To adjust:
- Modify `schedule` in `vercel.json`
- Redeploy with `vercel --prod`

## Monitoring

### Health Checks

Set up monitoring to ping:
- `https://your-app.vercel.app/api/health` every 5 minutes

### Sentry Error Tracking

If SENTRY_DSN is configured:
- All errors automatically reported to Sentry
- View at https://sentry.io/

### Vercel Analytics

Enable in Vercel Dashboard:
- Analytics → Enable
- Get insights on performance and usage

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel
# Common issues:
# 1. Missing DATABASE_URL
# 2. Prisma migration errors
# 3. TypeScript errors

# Test locally first
npm run build
```

### Database Connection Issues

```bash
# Verify DATABASE_URL format
# PostgreSQL: postgresql://user:pass@host:5432/db?sslmode=require

# Test connection
npx prisma db pull
```

### Cron Jobs Not Running

- Check Vercel Dashboard → Deployments → Functions
- Verify cron syntax in vercel.json
- Check function logs for errors

## Updating Production

```bash
# Push changes to git
git add .
git commit -m "Update"
git push

# Vercel auto-deploys from main branch
# Or manually deploy:
npx vercel --prod
```

## Rollback

```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → Promote to Production
```

## Database Backups

### Manual Backup

```bash
# Export from Vercel Postgres
pg_dump $DATABASE_URL > backup.sql

# Or use Vercel dashboard backup feature
```

### Automated Backups

- Vercel Postgres: Automatic daily backups
- External providers: Configure in their dashboard

## Custom Domain (Optional)

1. Vercel Dashboard → Domains
2. Add your domain
3. Configure DNS records
4. Wait for SSL cert

## Environment-Specific URLs

- **Production**: https://seth-command-center.vercel.app
- **Preview**: Auto-generated for each PR
- **Development**: http://localhost:3000

## API Rate Limits

Vercel free tier limits:
- 100GB bandwidth/month
- 100 serverless function executions/day

For high traffic, upgrade to Pro tier.

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Database credentials rotated regularly
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Sentry error tracking enabled
- [ ] No sensitive data in git history
- [ ] API endpoints protected (add auth if needed)

---

**Your Command Center is now live! 🚀**

Access at: https://seth-command-center.vercel.app/command-center
