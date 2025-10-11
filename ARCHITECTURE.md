# Seth Command Center - Architecture

**Status**: Active Source of Truth (October 2025)
**Philosophy**: Pragmatic personal command center over rigid registry requirements

---

## Evolution of Architecture Philosophy

### Where We Were (2024-2025)
- **Registry-First Architecture** (ADR-022): Rigid requirement that all data flow through Eden Genesis Registry
- **Complex Integration Patterns**: Multiple services coordinating through Registry API
- **Over-Engineering**: Systems designed for scale we didn't need yet

### Where We Are Now (October 2025)
- **Command Center as Source of Truth**: Seth Command Center is the pragmatic hub for daily workflow
- **Flexible Integration**: Services connect when it makes sense, not because of rigid requirements
- **Build What You Need**: Focus on working systems over architectural purity
- **Vibecoding Philosophy**: Ship fast, iterate, evolve naturally

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│              SETH COMMAND CENTER (localhost:3001)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   CEO View   │  │  Agent Hub   │  │  Vibecoding  │     │
│  │              │  │              │  │   Projects   │     │
│  │  • KPIs      │  │  • Rituals   │  │              │     │
│  │  • Manifests │  │  • Jobs      │  │  • 14 Live   │     │
│  │  • Status    │  │  • Tasks     │  │  • Portfolio │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└──────────────┬───────────────────────────────────┬──────────┘
               │                                   │
               │                                   │
    ┌──────────▼──────────┐           ┌───────────▼──────────┐
    │   Local SQLite      │           │  External Services   │
    │   (Prisma)          │           │  (When Needed)       │
    │                     │           │                      │
    │  • Tasks/TODOs      │           │  • ChatGPT Sync     │
    │  • Projects         │           │  • GitHub Stats     │
    │  • Rituals          │           │  • Eden Bridge      │
    │  • KPIs             │           │  • AI Sessions      │
    │  • Jobs Queue       │           │  • Vercel Deploy    │
    │  • Audit Log        │           │                      │
    └─────────────────────┘           └──────────────────────┘
```

---

## Core Principles

### 1. **Manifest-First, Registry-Optional**
- **Manifest files** (`/api/manifest/:project`) aggregate data from multiple sources
- **No forced Registry dependency** - integrate when it adds value
- **Direct data access** - query what you need, when you need it

### 2. **Config-Driven Integration**
- **Eden Bridge Adapter** with event mapping rules (see `lib/edenBridgeAdapter.ts`)
- **Flexible event processing** - map external events to internal tasks/KPIs
- **Easy to add new sources** - no architectural rewrites needed

### 3. **Standalone by Design**
- **7 core models** in Prisma schema (Project, Work, KPI, Ritual, Task, Job, AuditLog)
- **Self-contained** - runs without external services
- **SQLite for simplicity** - easy backup, easy migration

### 4. **Vibecoded Philosophy**
- **Ship fast, iterate** - working systems over perfect architecture
- **Swiss design system** - Helvetica, black/white, mathematical grid
- **Personal workflow first** - optimize for Seth's daily use
- **Launch pad mindset** - quick access to all vibecoding projects

---

## Data Models

### Core Schema (7 Models)

```prisma
Project {
  id        String (UUID)
  name      String (unique)
  type      String
  status    String
  color     String

  // Relations
  tasks     Task[]
  kpis      KPI[]
  rituals   Ritual[]
  works     Work[]
}

Task {
  id          String (UUID)
  title       String
  projectId   String
  priority    Int (1=high, 2=medium, 3=low)
  status      String (open, doing, blocked, done, snoozed)
  due         DateTime?
  notes       String
  tags        String
  energy      Int (1-3)
  source      String (api, manual, ritual, etc.)
}

KPI {
  id          String (UUID)
  projectId   String
  key         String (e.g. "github.commits.today")
  value       Float
  at          DateTime
  source      String
}

Ritual {
  id          String (UUID)
  name        String (unique)
  projectId   String
  type        String
  enabled     Boolean
  schedule    String (cron format)
  lastRun     DateTime?
  streak      Int
}

Work {
  id          String (UUID)
  projectId   String
  title       String?
  url         String?
  metadata    String (JSON)
  createdAt   DateTime
  source      String
}

Job {
  id            String (UUID)
  type          String
  payload       String (JSON)
  status        String (pending, running, completed, failed)
  attempts      Int
  maxRetries    Int
  runAt         DateTime
  startedAt     DateTime?
  completedAt   DateTime?
  error         String?
}

AuditLog {
  id        String (UUID)
  timestamp DateTime
  actor     String (system, user, agent, etc.)
  action    String (job.enqueued, ritual.run, task.created, etc.)
  payload   String (JSON)
  status    String (success, failure, pending)
  error     String?
}
```

### No Rigid Relationships
- **Flexible foreign keys** - Projects can have tasks, KPIs, rituals, works
- **JSON payloads** - Store what you need without schema migrations
- **Source tracking** - Know where data came from (api, manual, github, eden, etc.)

---

## API Architecture

### Pattern: Manifest-First Aggregation

```typescript
// /api/manifest/:project
// Aggregates data from multiple sources

{
  success: true,
  project: "Abraham",
  data: {
    total: 147,              // Total items (tasks, works, etc.)
    latestId: "abc-123",
    breakdown: {
      tasks: 12,
      works: 135,
      kpis: 3
    }
  },
  sources: [
    "local_database",
    "github_api",
    "eden_bridge"      // Optional, when available
  ],
  lastUpdated: "2025-10-05T..."
}
```

### Key Endpoints

```
POST /api/todos/import        - ChatGPT → Seth (task sync)
GET  /api/export/chatgpt      - Seth → ChatGPT (markdown export)
GET  /api/manifest/:project   - Aggregate project data
POST /api/rituals/run         - Execute ritual automation
POST /api/jobs/enqueue        - Queue background job
GET  /api/github/sync         - Sync GitHub commit data
POST /api/eden-bridge/ingest  - Process Eden events (config-driven)
```

### Config-Driven Event Processing

```typescript
// lib/edenBridgeAdapter.ts
const eventMappings = {
  'creation.published': {
    action: 'create_work',
    projectMapping: { /* ... */ }
  },
  'training.completed': {
    action: 'update_kpi',
    kpiKey: 'training.sessions.completed'
  }
}

// Easy to extend - no code changes needed
```

---

## Integration Patterns

### 1. ChatGPT TODO Sync (Active)
- **Source of Truth**: ChatGPT manages TODO list
- **Sync Method**: POST JSON to `/api/todos/import`
- **Bidirectional**: `npm run sync:copy` for Seth → ChatGPT

### 2. GitHub Stats (Active)
- **Direct API calls** to GitHub
- **Store commits** in local database
- **Update KPIs** automatically via job queue

### 3. Eden Bridge (Optional)
- **Config-driven** event processing
- **No forced dependency** - gracefully degrades
- **Easy to enable** when Eden events are useful

### 4. Vibecodings Portfolio (Active)
- **External site**: https://vibecodings.vercel.app
- **Linked in UI** via "View All" button
- **14 live projects** accessible from Command Center

---

## Deployment Strategy

### Local Development
```bash
npm run dev          # Start on localhost:3001
npm run db:migrate   # Update database schema
npm run db:seed      # Seed initial data
```

### Production (Vercel)
```bash
vercel --prod        # Deploy to seth-command-center.vercel.app
```

### Environment Variables
```
DATABASE_URL=postgresql://...    # Production: PostgreSQL
GITHUB_TOKEN=ghp_...             # For commit stats
EDEN_BRIDGE_API_KEY=...          # Optional Eden integration
SENTRY_DSN=...                   # Error tracking
```

---

## What We Deprecated

### ❌ Registry-First Architecture (ADR-022)
**Why**: Over-engineered for personal workflow needs
**Replaced By**: Manifest-first aggregation with flexible sources

### ❌ Rigid Service Boundaries
**Why**: Slowed down iteration and shipping
**Replaced By**: Direct data access, pragmatic integration

### ❌ Complex Federation Patterns
**Why**: Unnecessary complexity for current scale
**Replaced By**: Simple REST APIs, direct database queries

### ❌ Forced Coordination Through Registry
**Why**: Single point of failure, rigid dependencies
**Replaced By**: Services talk directly when needed, graceful fallbacks

---

## What We Kept

### ✅ Audit Logging
- **Complete transparency** - all mutations logged
- **Debugging tool** - trace what happened when
- **Compliance ready** - if needed later

### ✅ Job Queue System
- **Background processing** - rituals, sync jobs, backfills
- **Retry logic** - exponential backoff
- **Monitoring** - queue stats, job status

### ✅ Swiss Design System
- **Helvetica** throughout
- **Black/white** aesthetic
- **Mathematical grid** (8px baseline)
- **Minimalist** interface

### ✅ Vibecoding Portfolio Integration
- **Launch pad** for all projects
- **Quick access** to live sites
- **Stats tracking** (52 days, 14 live projects)

---

## Future Evolution

### Near Term (Next 1-3 Months)
- **AI Sessions Sync** - Claude Code session history
- **Ritual Automation** - Daily drop, Abraham countdown
- **Project Templates** - Quick start new vibecodings
- **Mobile Dashboard** - Access on the go

### Medium Term (3-6 Months)
- **Team Collaboration** - Share command center with partners
- **Agent Communication** - Agents report status to Command Center
- **Revenue Tracking** - MRR, ARR across all projects
- **Time Tracking** - How much time per project

### Long Term (6-12 Months)
- **Eden Integration** - When it adds value, not before
- **Registry Sync** - Optional two-way sync with Registry
- **Multi-User** - Command centers for other creators
- **Marketplace** - Sell command center templates

---

## Migration Notes

### From Old Systems
If you're migrating from old Eden Academy/Registry-first architecture:

1. **No forced Registry dependency** - it's just another data source
2. **Direct database access** - query what you need
3. **Manifest files** - aggregate data from multiple sources
4. **Config-driven integration** - easy to add new sources

### To New Projects
When starting new vibecodings:

1. **Start standalone** - don't force Registry integration
2. **Add manifest endpoint** if it makes sense
3. **Use SQLite** for simplicity
4. **Ship fast** - iterate based on actual needs

---

## Architecture Validation

### ✅ Manifest-First Pattern
- Can aggregate data from multiple sources
- No single point of failure
- Easy to add new data sources

### ✅ Config-Driven Integration
- Eden Bridge adapter working
- Event mappings extensible
- No code changes needed for new events

### ✅ Audit-Log Transparency
- All mutations logged
- Actor/action/payload pattern
- Complete debugging trail

### ✅ Swiss Design System
- Helvetica throughout
- Black/white aesthetic
- Vibecoded by @seth signature

---

## Key Files

```
/prisma/schema.prisma          - 7 core models
/src/lib/edenBridgeAdapter.ts  - Config-driven integration
/src/services/jobs.ts          - Job queue system
/src/services/audit.ts         - Audit logging
/src/app/command-center/       - Main UI (3-panel layout)
/src/ui/panels/                - CEO View, Agent Hub, Vibecoding Studio
/CHATGPT_INSTRUCTIONS.md       - ChatGPT TODO sync guide
```

---

**Built with pragmatism • Vibecoded by @seth • October 2025**

## Summary

Seth Command Center is the **pragmatic source of truth** for your personal workflow. We've evolved past rigid Registry requirements toward a flexible, manifest-first architecture that:

1. **Works standalone** - no forced external dependencies
2. **Integrates flexibly** - connect services when it adds value
3. **Ships fast** - optimized for vibecoding iteration speed
4. **Scales naturally** - add complexity only when needed

This is the new architectural philosophy for all Seth vibecodings going forward.
