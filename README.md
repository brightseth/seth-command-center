# Seth Command Center
*A ritual-driven personal intelligence platform*

## Architecture Overview

The Seth Command Center unifies three systems (@seth agent, CEO dashboard, vibecoding directory) into a single ritual-driven platform built on **manifest-first architecture** with standalone schema and config-driven integration patterns.

### Core Principles

1. **Manifest-First**: Single source of truth prevents UI drift, ensures data consistency
2. **Rituals as First-Class Entities**: Streaks, automation, and execution tracking built into the data model
3. **Config-Driven Integration**: Eden ecosystem events processed without schema coupling
4. **Swiss Design System**: Helvetica typography, mathematical grid, black/white aesthetic
5. **Transparency via AuditLog**: All system operations logged for debugging and accountability

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Visit http://localhost:3000/command-center for the three-panel interface.

## Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`: SQLite for dev, PostgreSQL for production
- `EDEN_BRIDGE_API_KEY`: For processing Eden ecosystem events

Optional:
- `SENTRY_DSN`: Production error tracking
- `REDIS_URL`: Production job queue (defaults to in-memory)

## Architecture Components

### 1. Manifest Service (`/src/services/manifest.ts`)
Central data aggregation returning deterministic totals, by-month histograms, and latest work IDs. **Never bypass this service** - all UI components must use manifest endpoints.

```typescript
const manifest = await getProjectManifest('eden')
// Returns: { total: 1247, byMonth: [...], latestId: "work_123" }
```

### 2. Ritual Engine
First-class ritual entities with streak tracking, cooldown logic, and automated execution:

```typescript
// Trigger ritual with cooldown protection
POST /api/rituals/run { ritualId: "daily-drop" }
```

### 3. Eden Bridge (`/src/services/edenBridge.ts`)
Config-driven event processor that maps Eden ecosystem events to KPIs/Tasks/Works without schema coupling:

```typescript
// Process Eden event (sale, launch, generation, etc.)
POST /api/eden-bridge/ingest
```

### 4. Job Queue (`/src/services/jobs.ts`)
Redis-ready job processing with exponential backoff retry logic:

```typescript
// Enqueue background job
const job = await jobQueueService.enqueue({
  type: 'ritual.run',
  payload: { ritualId: 'daily-drop' }
})
```

## Database Schema

**Standalone Seth schema** with 7 core models:

- **Project**: Eden, Vibecoding, Automata containers
- **Work**: Creative outputs (images, videos, posts)
- **KPI**: Key performance indicators with time series
- **Ritual**: Automated processes with streak tracking
- **Task**: Action items and TODO management
- **Job**: Background job queue with retry logic
- **AuditLog**: System transparency and debugging

## API Reference

### Manifest Endpoints
```
GET  /api/manifest/eden        # Eden project manifest
GET  /api/manifest/vibecoding  # Vibecoding manifest
POST /api/manifest/eden        # Recompute manifest
```

### Ritual Management
```
POST /api/rituals/run          # Execute ritual
GET  /api/jobs/status/:jobId   # Job status
GET  /api/jobs/queue           # Queue statistics
```

### Eden Bridge
```
POST /api/eden-bridge/ingest   # Process Eden events
GET  /api/eden-bridge/ingest   # Bridge statistics
```

## UI Components

### Three-Panel Command Center (`/command-center`)

1. **CEO View** (`/src/ui/panels/CEOView.tsx`)
   - Big numbers: $77.2K MRR, total works, SOLIENNE streak
   - Ritual streaks prominently displayed
   - Executive KPI dashboard

2. **Agent Hub** (`/src/ui/panels/AgentHub.tsx`)
   - Interactive ritual runner with cooldown logic
   - Streak tracking and status indicators
   - Recent activity feed

3. **Vibecoding Studio** (`/src/ui/panels/VibecodingStudio.tsx`)
   - Project cards with fire ratings
   - Publish toggles and studio metrics
   - Quick actions interface

## Development Workflow

### Adding New Rituals
1. Add ritual to database via Prisma Studio or seed script
2. Configure ritual logic in job queue processor
3. UI will automatically discover and display ritual

### Processing Eden Events
1. Update event mapping in `/src/services/edenBridge.ts`
2. No schema changes needed - config-only updates
3. Events automatically create KPIs, Tasks, or Works

### Extending Manifest Data
1. Update `getProjectManifest()` in manifest service
2. Add new fields to TypeScript interfaces
3. UI components auto-refresh with new data structure

## Production Deployment

### Database Migration
```bash
# Production PostgreSQL setup
npx prisma migrate deploy
npx prisma db seed
```

### Environment Variables
```bash
DATABASE_URL="postgresql://..."
EDEN_BRIDGE_API_KEY="prod-key"
SENTRY_DSN="https://..."
REDIS_URL="redis://prod-redis:6379"
```

### Monitoring
- **Sentry**: Error tracking and performance monitoring
- **AuditLog**: Complete operation history in database
- **Job Queue**: Background task status and retry logic

## Troubleshooting

### Common Issues

**Manifest data not updating**
- Check manifest service logs
- Verify database connections
- Use AuditLog to trace operations

**Rituals not executing**
- Check cooldown constraints (1 hour minimum)
- Verify job queue processing
- Check ritual enabled status

**Eden bridge events failing**
- Validate API key authentication
- Check event mapping configuration
- Review AuditLog for bridge operations

### Architecture Validation

Run contract tests to detect drift:
```bash
npm test
```

Verify non-negotiables:
- [ ] All UI calls go through manifest service (no raw data access)
- [ ] Eden bridge uses config-driven mapping (no schema coupling)
- [ ] AuditLog captures all system operations
- [ ] Rituals have proper cooldown and streak logic

## Architecture Decision Records

Key architectural decisions documented in codebase:
- **Manifest-First**: Prevents UI drift, ensures consistency
- **Standalone Schema**: No coupling to Eden Registry
- **Config-Driven Bridge**: New agents via config, not schema
- **Swiss Design**: Helvetica, mathematical grid, minimal aesthetic

---

*Built with Next.js 15, Prisma, TypeScript, and Swiss design principles*