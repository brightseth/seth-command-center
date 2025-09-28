# GitHub Integration Setup

## 🔧 Quick Setup (5 minutes)

### 1. Get GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Classic"
3. Select scopes:
   - ✅ `repo` (access repositories)
   - ✅ `user` (read user profile)
4. Copy the token (starts with `ghp_...`)

### 2. Set Environment Variables
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local and set:
GITHUB_TOKEN="your-token-here"
GITHUB_USERNAME="your-username"
```

### 3. Test GitHub Connection
```bash
# Test the API connection
curl "http://localhost:3000/api/github/sync"
```

### 4. Run GitHub Sync Ritual
```bash
# Manually trigger GitHub sync
curl -X POST "http://localhost:3000/api/rituals/run" \
  -H "Content-Type: application/json" \
  -d '{"ritualId":"github-sync"}'
```

## 🎯 What You'll Get

Your Command Center will now show **real data**:

### CEO View Updates
- **Real commit count today**: Instead of fake numbers
- **Active repositories**: Your actual GitHub projects
- **Weekly coding activity**: Commits from last 7 days

### Agent Hub Updates
- **GitHub Sync ritual**: Daily 7 AM automation
- **Real streaks**: Based on actual commit activity
- **Live status**: See when sync last ran

### Expected KPIs
- `github.commits.today`: Your commits today
- `github.commits.week`: Your commits this week
- `github.repos.active`: Repositories updated in last 30 days

## 🚀 Daily Automation

Once set up, the system will:
1. **7 AM daily**: Auto-sync GitHub data
2. **Update KPIs**: Real commit counts and repo stats
3. **Track streaks**: Build coding consistency
4. **Audit logging**: Full transparency of all operations

## 🔍 Troubleshooting

**Token not working?**
- Ensure token has `repo` and `user` scopes
- Check token isn't expired
- Verify username matches token owner

**No data showing?**
- Check dev server is running (`npm run dev`)
- Verify environment variables are set
- Check browser network tab for API errors

**Rate limits?**
- GitHub allows 5,000 requests/hour for authenticated users
- System fetches max 10 repos to stay within limits

## 🎨 Next Steps

After GitHub integration works:
1. **Add Stripe/revenue data** for real MRR tracking
2. **Connect social media APIs** for follower counts
3. **Integrate time tracking** for productivity metrics
4. **Add health/fitness APIs** for wellness tracking

The config-driven architecture means adding new data sources requires **zero schema changes** - just update the eden-bridge configuration!