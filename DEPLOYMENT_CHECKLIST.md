# Seth Command Center - Production Deployment Checklist

**Status**: Ready for deployment with doc-organizer integration
**Date**: October 11, 2025

---

## ✅ Completed (Local Testing)

- [x] Ritual scheduler service created (`/src/services/ritual-scheduler.ts`)
- [x] Rituals configuration (`/config/rituals.yaml`)
- [x] Doc-organizer webhook endpoint (`/api/hooks/doc-organizer`)
- [x] Task completion triggers webhook automatically
- [x] Health metrics sync working (`/api/ecosystem-health`)
- [x] Audit logging for all operations
- [x] Local testing complete (all systems operational)
- [x] Vercel cron configured (`0 9 * * 5` - Fridays 9AM UTC)
- [x] Vibecodings health API deployed

---

## ⚠️ Blockers for Production Deployment

### 1. Database Migration: SQLite → PostgreSQL

**Current**: Using SQLite (`prisma/dev.db`) in development
**Required**: PostgreSQL for Vercel production

**Steps needed**:
```bash
# 1. Set up Vercel Postgres database in dashboard
# 2. Get DATABASE_URL connection string
# 3. Update schema.prisma datasource
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed production database (optional)
npx prisma db seed
```

**Impact**: All data currently in dev.db will need migration or re-seeding

---

### 2. GitHub Repository Setup

**Current**: No GitHub repo (`.git` exists but not pushed)
**Required**: Git repo for Vercel continuous deployment

**Steps needed**:
```bash
cd /Users/seth/seth-command-center

# Initialize if needed
git init

# Create GitHub repo
gh repo create brightseth/seth-command-center --public

# Push to GitHub
git add .
git commit -m "Initial commit: Command Center with doc-organizer integration"
git push -u origin main
```

**Impact**: Vercel needs GitHub connection for auto-deployment

---

### 3. Environment Variables (Production)

**Required in Vercel Dashboard**:
```bash
DATABASE_URL="postgresql://..."              # Vercel Postgres
EDEN_BRIDGE_API_KEY="..."                    # If using Eden Bridge
SENTRY_DSN="..."                              # Error tracking (optional)
GITHUB_TOKEN="ghp_..."                        # GitHub API access (optional)
GITHUB_USERNAME="brightseth"                  # For GitHub integration
NEXT_PUBLIC_APP_URL="https://seth-command-center.vercel.app"  # For webhooks
```

---

### 4. Ritual Commands (Production-Ready)

**Current status**: Placeholder commands in `rituals.yaml`
```yaml
command: "echo '[Doc-Organizer] Would run...'"
```

**Options**:

**Option A**: Keep as monitoring-only
- Health metrics sync works perfectly
- Doc-organizer webhook works
- No actual file operations in production
- Safe and operational

**Option B**: Build actual doc-organizer CLI
```bash
# Would need to create:
/usr/local/bin/doc-organizer

# With commands:
doc-organizer run --auto-archive --days=14
doc-organizer health --format=json
```

**Recommendation**: Start with Option A (monitoring-only), add CLI later

---

## 🚀 Deployment Steps (When Ready)

### Step 1: Prepare Database
```bash
# In Vercel Dashboard:
# 1. Storage → Create Database → Postgres
# 2. Copy DATABASE_URL
# 3. Add to Environment Variables
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Production ready: Doc-organizer integration complete"
git push
```

### Step 3: Deploy to Vercel
```bash
cd /Users/seth/seth-command-center
vercel --prod
```

### Step 4: Run Database Migration
```bash
# In Vercel deployment logs, this runs automatically:
# 1. prisma generate
# 2. prisma migrate deploy
# 3. next build
```

### Step 5: Verify Cron Job
```bash
# Check Vercel Dashboard → Settings → Cron Jobs
# Should see: GET /api/rituals/check @ "0 9 * * 5"
```

### Step 6: Test Production
```bash
# Test ritual scheduler
curl https://seth-command-center.vercel.app/api/rituals/check

# Test webhook
curl -X POST https://seth-command-center.vercel.app/api/hooks/doc-organizer \
  -H "Content-Type: application/json" \
  -d '{"project":"Eden Academy","trigger":"manual","reason":"Production test"}'
```

---

## 📊 Current Integration Status

### Working Locally ✅
- Webhook endpoint responds correctly
- Task completion triggers webhook
- Ritual scheduler executes commands
- Health metrics sync to Command Center
- Audit log captures all operations
- Job queue tracks cleanup tasks

### Deployed ✅
- **Vibecodings**: https://vibecodings.vercel.app
  - Stats API: `/api/stats` (includes doc-organizer metrics)
  - Health API: `/api/health` (serverless, ready for POST data)

### Pending ⏳
- **Command Center**: Not yet deployed
  - Linked to Vercel project
  - Cron configured
  - Needs: PostgreSQL + GitHub + deployment

---

## 🎯 Minimal Viable Deployment

If you want to deploy **right now** with minimal changes:

### Quick Path (15 minutes)
1. Keep SQLite for now (Vercel supports it via volume)
2. Push to GitHub
3. Deploy to Vercel
4. Rituals run in monitoring mode (no file operations)
5. Upgrade to PostgreSQL later

### Commands:
```bash
cd /Users/seth/seth-command-center

# 1. Commit current state
git add .
git commit -m "Doc-organizer integration complete"

# 2. Create GitHub repo
gh repo create seth-command-center --public

# 3. Push
git push -u origin main

# 4. Deploy
vercel --prod

# Done! Command Center live with monitoring-only rituals
```

---

## ⚙️ Post-Deployment Configuration

### Enable Real Cleanup (Optional)
Once deployed, you can build actual doc-organizer CLI:

```bash
# Create script at /usr/local/bin/doc-organizer
#!/bin/bash
case "$1" in
  run)
    # Actual archival logic
    ;;
  health)
    # Health check logic
    ;;
esac
```

### Add More Rituals
Edit `config/rituals.yaml`:
```yaml
  - name: "Daily Content Drop"
    command: "npx tsx scripts/daily-drop.ts"
    schedule: "daily"
    time: "09:00"

  - name: "Newsletter Draft"
    command: "npx tsx scripts/newsletter-draft.ts"
    schedule: "mondays"
    time: "08:00"
```

---

## 🔒 Security Checklist

- [ ] Database credentials in Vercel env vars (not code)
- [ ] API keys stored securely
- [ ] Webhook endpoints have rate limiting
- [ ] Audit logging enabled for transparency
- [ ] Sentry error tracking configured
- [ ] CORS headers set appropriately

---

## 📈 Success Metrics

After deployment, verify:
- [ ] Cron job runs every Friday 9AM UTC
- [ ] Webhook triggers on task completion
- [ ] Health metrics sync successfully
- [ ] Audit log shows all operations
- [ ] No errors in Vercel function logs

---

## Next Steps (Choose One)

**A. Deploy Now (Minimal)**
- Push to GitHub + Deploy with SQLite
- Rituals in monitoring mode
- Fully functional webhook integration
- Upgrade database later

**B. Full Production Setup**
- Set up PostgreSQL first
- Migrate dev data
- Build doc-organizer CLI
- Deploy with full automation

**C. Keep Local Testing**
- Continue development locally
- Add more ritual types
- Build actual cleanup logic
- Deploy when ready

---

**Recommendation**: Start with **Option A** (Deploy Now) to validate production environment, then iterate with more features.

**Last Updated**: 2025-10-11
**Status**: Local testing complete, production deployment ready
