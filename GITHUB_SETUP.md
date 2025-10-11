# GitHub Integration Setup

Enable GitHub commit tracking in your Seth Command Center to see recent activity across all your projects.

## 🔐 Security First

- ✅ API tokens stored in `.env.local` (never committed)
- ✅ `.gitignore` protects all `.env*` files
- ✅ All API calls server-side only
- ✅ Security verification script included

## 📝 Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: `Seth Command Center - Commit Tracking`
4. Set expiration: `90 days` (or longer)
5. Select scopes:
   - ✅ `repo:status` - Commit status (public & private repos)
   - ✅ `public_repo` - Public repositories access
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 2. Add Token to .env.local

```bash
cd /Users/seth/seth-command-center

# Edit .env.local
echo "GITHUB_TOKEN=your_token_here" >> .env.local
echo "GITHUB_USERNAME=brightseth" >> .env.local
```

Replace `your_token_here` with your actual token (starts with `ghp_` or `github_pat_`)

### 3. Restart Server

```bash
# Kill existing server
pkill -f "next dev"

# Restart
npm run dev
```

### 4. Test Integration

```bash
# Test API endpoint
curl "http://localhost:3001/api/github/commits?project=Abraham&days=7"

# Should return commit data instead of empty array
```

## 🎯 Tracked Projects

The following projects are configured for GitHub tracking:

| Project | Repository |
|---------|-----------|
| **Abraham** | `brightseth/abraham-media` |
| **MIYOMI** | `brightseth/miyomi-vercel` |
| **Eden Academy** | `edenartlab/eden-academy` |
| **Eden Registry** | `edenartlab/eden-genesis-registry` |
| **Paris Photo** | `edenprojects/paris-photo-voting` |
| **NODE Artist Relations** | `brightseth/node-artist-relations` |

## 🔧 Adding More Repos

Edit `src/lib/github.ts`:

```typescript
export const PROJECT_REPOS: Record<string, GitHubRepo[]> = {
  'Your Project': [
    {
      name: 'repo-name',
      owner: 'owner-username',
      fullName: 'owner-username/repo-name'
    }
  ]
};
```

## 🛡️ Security Verification

Run the security checker before any git commit:

```bash
npx tsx scripts/verify-security.js
```

This scans for:
- Exposed GitHub tokens
- API keys in code
- Secrets in environment files

## 🚨 If Token Gets Exposed

1. **Immediately revoke** at https://github.com/settings/tokens
2. Generate new token
3. Update `.env.local`
4. Never commit `.env.local` to git
5. Check git history: `git log --all --full-history -- "*env*"`

## 📊 Using Commit Data

### API Endpoint

```bash
GET /api/github/commits?project=ProjectName&days=7
```

### Response

```json
{
  "success": true,
  "data": {
    "project": "Abraham",
    "days": 7,
    "count": 12,
    "lastCommit": {
      "sha": "abc1234",
      "message": "Add whitelist form",
      "author": "Seth Goldstein",
      "date": "2025-10-03T14:23:00Z",
      "repo": "abraham-media"
    },
    "commits": [...]
  }
}
```

## 🎨 Future Enhancements

- [ ] Display commits on project cards
- [ ] Add to daily morning brief
- [ ] Commit streak tracking
- [ ] Auto-create tasks from commit messages
- [ ] Integration with ritual system

---

**Status**: ✅ Configured (token optional)
**Security**: ✅ Verified - No secrets exposed
**Location**: `/Users/seth/seth-command-center`

*Seth Command Center - Secure GitHub Integration* 🔐
