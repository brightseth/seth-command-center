# Personal Command Center: Integrated TODO & Memory System
## Comprehensive Architecture & Implementation Plan

**Date:** October 21, 2025
**Status:** Planning Phase → MVP Development
**Author:** Claude Code Analysis

---

## EXECUTIVE SUMMARY

You already have 80% of this system built. The Seth Command Center has:
- ✅ Task/TODO system with priority ranking, energy levels, project association
- ✅ Multi-source ingestion (email, API, manual, slash commands)
- ✅ Smart Top 3 algorithm with focus windows
- ✅ Multiple access interfaces (web UI at `/command-center/todos`, API endpoints)
- ✅ Persistent PostgreSQL storage (production) / SQLite (dev)
- ✅ Audit logging for complete history
- ✅ Job queue for background processing

**What's Missing (20%):**
1. **Limitless pendant integration** (MCP already available)
2. **Granola meeting notes ingestion** (file watcher needed)
3. **Claude Code .md file monitoring** (file watcher needed)
4. **Synthesis engine** (intelligent deduplication & linking)
5. **@seth agent integration** (read-only API access)
6. **Long-term memory & context retention** (archival + summarization)

---

## SYSTEM ARCHITECTURE

### Current State (Existing Infrastructure)

```
┌─────────────────────────────────────────────────────────────┐
│                    Seth Command Center                       │
│                  (seth-command-center/)                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
│   Database    │    │   Job Queue   │    │  Audit Logs   │
│  PostgreSQL   │    │  (Redis-ready)│    │  (History)    │
│   /SQLite     │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘

Existing Data Models:
- Task (TODO) with priority, energy, status, tags
- Project (Eden, Vibecoding, Automata, Personal)
- AuditLog (all operations tracked)
- Job (background processing)
- SourceEmail (email capture metadata)
```

### Enhanced Architecture (Proposed)

```
┌────────────────────────────────────────────────────────────────────┐
│                       INGESTION LAYER                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Limitless   │  │   Granola    │  │ Claude Code  │            │
│  │     MCP      │  │ File Watcher │  │ File Watcher │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            │                                        │
│                    ┌───────▼────────┐                              │
│                    │  Ingestion API │                              │
│                    │ /api/ingest/*  │                              │
│                    └───────┬────────┘                              │
└────────────────────────────┼───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                      SYNTHESIS ENGINE                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Claude API Processing (Scheduled Job)                       │ │
│  │  - Deduplication (detect similar TODOs)                      │ │
│  │  - Linking (group related items)                             │ │
│  │  - Priority detection (mentioned multiple times = important) │ │
│  │  - Context extraction (why was this created?)                │ │
│  │  - Project categorization (MIYOMI, SOLENNE, Spirit, etc)    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                     STORAGE LAYER (Existing)                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PostgreSQL/SQLite Database:                                       │
│  - Task (enhanced with sourceContext, linkedTasks)                 │
│  - TaskHistory (versioning, completions, changes)                  │
│  - TaskSynthesis (deduplication, grouping metadata)                │
│  - AuditLog (complete operation history)                           │
│                                                                     │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                      ACCESS INTERFACES                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Command Ctr  │  │  @seth Agent │  │ Claude/ChatGPT│            │
│  │  /todos UI   │  │  Read-Only   │  │  Export API  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │    CLI       │  │  Public Web  │                               │
│  │ (optional)   │  │  (filtered)  │                               │
│  └──────────────┘  └──────────────┘                               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## DATA SCHEMA ENHANCEMENTS

### Current Task Model (Existing)
```typescript
model Task {
  id        String    @id @default(cuid())
  projectId String
  title     String
  notes     String?
  priority  Int       @default(2) // 1=high, 2=medium, 3=low
  status    String    @default("open") // 'open','doing','blocked','done','snoozed'
  due       DateTime?
  source    String    @default("manual") // 'email','slash','calendar','api','manual'
  tags      String    // Comma-separated tags
  energy    Int       @default(2) // 1=deep, 2=normal, 3=light
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  project      Project       @relation(...)
  sourceEmails SourceEmail[]
}
```

### Enhanced Task Model (Proposed)
```prisma
model Task {
  // ... all existing fields ...

  // NEW FIELDS FOR MEMORY & SYNTHESIS
  sourceContext      String?    // JSON: {conversation_id, meeting_id, file_path}
  extractedFrom      String?    // Original text snippet that created this task
  linkedTaskIds      String     @default("") // Comma-separated IDs of related tasks
  synthesisMetadata  String?    // JSON: {duplicate_of, grouped_with, confidence}
  mentionCount       Int        @default(1) // How many times referenced
  lastMentioned      DateTime?  // When last referenced in any source
  archived           Boolean    @default(false)
  archivedAt         DateTime?

  // Relations
  history    TaskHistory[]
  syntheses  TaskSynthesis[]
}

// NEW: Task History (versioning)
model TaskHistory {
  id         String   @id @default(cuid())
  taskId     String
  action     String   // 'created','updated','completed','archived','mentioned'
  changes    String   // JSON: before/after values
  source     String   // Where the change came from
  context    String?  // Additional context
  createdAt  DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId, createdAt])
  @@map("task_history")
}

// NEW: Task Synthesis (intelligent grouping)
model TaskSynthesis {
  id            String   @id @default(cuid())
  taskId        String
  relatedTaskId String?  // Duplicate or related task
  relationship  String   // 'duplicate','related','blocks','blocked_by'
  confidence    Float    // 0.0 - 1.0
  reason        String   // Why they're linked
  createdAt     DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([relatedTaskId])
  @@map("task_synthesis")
}

// NEW: Ingestion Sources (track source health)
model IngestionSource {
  id            String   @id @default(cuid())
  name          String   @unique // 'limitless','granola','claude-code','email'
  type          String   // 'api','file-watcher','email','manual'
  enabled       Boolean  @default(true)
  lastSync      DateTime?
  tasksCreated  Int      @default(0)
  config        String   // JSON: API keys, file paths, etc.
  health        String   @default("healthy") // 'healthy','degraded','failing'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("ingestion_sources")
}
```

---

## IMPLEMENTATION PHASES

### Phase 1: MVP (This Week) - Core Memory Foundation

**Goal:** Get basic ingestion working + synthesis engine running

#### 1.1 Database Migrations
```bash
# Add new fields and models
npx prisma migrate dev --name add_task_memory_fields
```

#### 1.2 Ingestion API Endpoints

**A. Limitless Integration** (`/api/ingest/limitless`)
```typescript
// Uses existing Limitless MCP connection
POST /api/ingest/limitless
{
  "transcript": "...",
  "conversationId": "...",
  "timestamp": "...",
  "participants": [...]
}

// Extract TODOs using Claude API:
// 1. Parse transcript for commitments
// 2. Detect action items
// 3. Extract deadlines
// 4. Create tasks with sourceContext
```

**B. Claude Code File Watcher** (`/api/ingest/claude-files`)
```typescript
// Watch ~/projects/**/*.md for TODO patterns
// - Detects "TODO:", "ACTION:", "FOLLOW UP:", etc.
// - Extracts context from surrounding text
// - Links to project based on file path
```

**C. Granola Integration** (`/api/ingest/granola`)
```typescript
// Watch ~/Documents/Granola/*.md
// - Parse meeting notes
// - Extract action items
// - Link to calendar events (if available)
```

#### 1.3 Synthesis Engine (Background Job)
```typescript
// Runs every 30 minutes via job queue
jobQueue.enqueue({
  type: 'task.synthesize',
  schedule: 'every 30 minutes'
})

// Synthesis logic:
async function synthesizeTasks() {
  // 1. Get all tasks created in last 24h
  const recentTasks = await getRecentTasks()

  // 2. For each task, use Claude API to:
  //    - Find potential duplicates (semantic similarity)
  //    - Detect related tasks (same project, similar keywords)
  //    - Extract implicit deadlines from context
  //    - Suggest better project categorization

  // 3. Create TaskSynthesis records
  // 4. Update linkedTaskIds
  // 5. Increment mentionCount if duplicate found
}
```

#### 1.4 Export API for Claude/ChatGPT
```typescript
GET /api/export/chatgpt
// Returns formatted TODO list:
// - Markdown format
// - Grouped by project
// - Priority indicators
// - Due dates
// - Context snippets

// Example output:
# @Seth TODO List (Oct 21, 2025)

## 🔥 Top 3 Today
1. [HIGH] Fix MIYOMI character consistency issue
   Project: MIYOMI | Due: Oct 25 | Energy: DEEP
   Context: Mentioned in meeting with Jacob on Oct 19

2. [MED] Update SOLIENNE color palette
   ...

## 📋 By Project

### MIYOMI (5 tasks)
- [ ] Fix character consistency (HIGH, due Oct 25)
- [ ] Review Dec 1 launch timeline (MED)
...
```

### Phase 2: Advanced Features (Next Month)

#### 2.1 Long-term Memory & Context Retention
```typescript
// Weekly summarization job
jobQueue.enqueue({
  type: 'memory.summarize',
  schedule: 'weekly'
})

// Creates compressed summaries:
// - What was accomplished this week
// - What's blocked and why
// - Recurring patterns
// - Archive completed tasks with searchable summaries
```

#### 2.2 @seth Agent Integration
```typescript
// Read-only API for Eden @seth agent
GET /api/agent/status
// Returns: Today's top 3, active projects, blockers

GET /api/agent/query?q=miyomi
// Natural language query interface
```

#### 2.3 Smart Notifications
```typescript
// Proactive reminders:
// - Tasks not touched in 7 days
// - Deadlines approaching
// - Dependencies unblocked
// - Multiple mentions = priority signal
```

### Phase 3: Intelligence Layer (Month 2-3)

#### 3.1 Pattern Detection
- Recurring tasks → suggest automation
- Consistent blockers → surface dependencies
- Energy level tracking → optimal scheduling

#### 3.2 Context Window Management
- Rolling 30-day active window
- 90-day searchable archive
- Yearly summaries

#### 3.3 Public/Private Filtering
- Privacy tags on tasks
- Public goals page (sethgoldstein.com)
- Filtered vibecoding integration

---

## FILE STRUCTURE

```
seth-command-center/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ingest/
│   │   │   │   ├── limitless/route.ts       [NEW]
│   │   │   │   ├── granola/route.ts         [NEW]
│   │   │   │   └── claude-files/route.ts    [NEW]
│   │   │   ├── synthesis/
│   │   │   │   └── run/route.ts             [NEW]
│   │   │   ├── export/
│   │   │   │   └── chatgpt/route.ts         [EXISTS - enhance]
│   │   │   ├── agent/
│   │   │   │   ├── status/route.ts          [NEW]
│   │   │   │   └── query/route.ts           [NEW]
│   │   │   └── todos/                       [EXISTS]
│   │   │       └── (existing endpoints)
│   │   └── command-center/
│   │       └── todos/page.tsx               [EXISTS - working]
│   │
│   ├── services/
│   │   ├── ingestion/                       [NEW]
│   │   │   ├── limitless.ts
│   │   │   ├── granola.ts
│   │   │   ├── claude-files.ts
│   │   │   └── base-ingestion.ts
│   │   ├── synthesis/                       [NEW]
│   │   │   ├── deduplication.ts
│   │   │   ├── linking.ts
│   │   │   ├── priority-detection.ts
│   │   │   └── context-extraction.ts
│   │   ├── memory/                          [NEW]
│   │   │   ├── archival.ts
│   │   │   ├── summarization.ts
│   │   │   └── context-management.ts
│   │   └── jobs.ts                          [EXISTS - extend]
│   │
│   └── lib/
│       ├── claude-api.ts                    [NEW]
│       └── file-watcher.ts                  [NEW]
│
├── prisma/
│   ├── schema.prisma                        [EXTEND]
│   └── migrations/
│       └── add_task_memory_fields/          [NEW]
│
├── scripts/
│   ├── start-file-watchers.ts               [NEW]
│   └── test-ingestion.ts                    [NEW]
│
└── workers/                                  [NEW]
    ├── file-watcher-daemon.ts
    └── synthesis-scheduler.ts
```

---

## INTEGRATION PATTERNS

### 1. Limitless MCP Integration
```typescript
// Use existing MCP connection
// @mcp-server-limitless is already available

import { callTool } from '@modelcontextprotocol/sdk'

async function ingestLimitlessTranscript(conversationId: string) {
  // Fetch transcript via MCP
  const transcript = await callTool('limitless', 'get_transcript', {
    conversation_id: conversationId
  })

  // Extract TODOs using Claude API
  const todos = await extractTodosFromTranscript(transcript)

  // Create tasks with full context
  for (const todo of todos) {
    await prisma.task.create({
      data: {
        ...todo,
        source: 'api',
        sourceContext: JSON.stringify({
          source: 'limitless',
          conversationId,
          timestamp: new Date(),
          participants: transcript.participants
        }),
        extractedFrom: todo.originalText
      }
    })
  }
}
```

### 2. Claude Code File Watcher
```typescript
import chokidar from 'chokidar'
import { readFile } from 'fs/promises'

// Watch all .md files in ~/projects
const watcher = chokidar.watch('/Users/seth/**/*.md', {
  ignored: /node_modules|\.git/,
  persistent: true
})

watcher.on('change', async (filePath) => {
  const content = await readFile(filePath, 'utf-8')

  // Regex patterns for TODO detection
  const patterns = [
    /TODO:\s*(.+)/gi,
    /ACTION:\s*(.+)/gi,
    /FOLLOW[- ]UP:\s*(.+)/gi,
    /\[ \]\s*(.+)/gi  // Markdown checkboxes
  ]

  const todos = extractTodosFromMarkdown(content, patterns)

  // Determine project from file path
  const project = inferProjectFromPath(filePath)

  // Create or update tasks
  for (const todo of todos) {
    await createOrUpdateTask({
      ...todo,
      source: 'api',
      sourceContext: JSON.stringify({
        source: 'claude-code',
        filePath,
        detectedAt: new Date()
      })
    })
  }
})
```

### 3. Granola Integration
```typescript
// Watch Granola export directory
const granolaWatcher = chokidar.watch('/Users/seth/Documents/Granola/**/*.md', {
  persistent: true
})

granolaWatcher.on('add', async (filePath) => {
  const content = await readFile(filePath, 'utf-8')

  // Parse Granola's meeting note format
  const meetingData = parseGranolaMeeting(content)

  // Extract action items (usually marked with specific formatting)
  const actionItems = meetingData.actionItems

  for (const item of actionItems) {
    await prisma.task.create({
      data: {
        title: item.title,
        notes: item.context,
        sourceContext: JSON.stringify({
          source: 'granola',
          meetingTitle: meetingData.title,
          meetingDate: meetingData.date,
          filePath
        }),
        source: 'api'
      }
    })
  }
})
```

### 4. Synthesis Engine
```typescript
// Runs as scheduled job
async function runSynthesis() {
  const recentTasks = await prisma.task.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  })

  // Use Claude API to analyze relationships
  const analysisPrompt = `
    Analyze these tasks and identify:
    1. Duplicates (same intent, different wording)
    2. Related tasks (same project/theme)
    3. Hidden deadlines in context
    4. Priority signals (mentioned multiple times)

    Tasks: ${JSON.stringify(recentTasks, null, 2)}
  `

  const analysis = await callClaudeAPI(analysisPrompt)

  // Create synthesis records
  for (const relationship of analysis.relationships) {
    await prisma.taskSynthesis.create({
      data: {
        taskId: relationship.taskId,
        relatedTaskId: relationship.relatedTo,
        relationship: relationship.type,
        confidence: relationship.confidence,
        reason: relationship.explanation
      }
    })

    // Update mention counts for duplicates
    if (relationship.type === 'duplicate') {
      await prisma.task.update({
        where: { id: relationship.taskId },
        data: {
          mentionCount: { increment: 1 },
          lastMentioned: new Date()
        }
      })
    }
  }
}
```

---

## MVP IMPLEMENTATION STEPS

### Week 1: Foundation (Days 1-3)

**Day 1: Database & Core Services**
```bash
# 1. Add new schema fields
cd /Users/seth/seth-command-center
# Edit prisma/schema.prisma (add new models)
npx prisma migrate dev --name add_memory_system

# 2. Create base services
mkdir -p src/services/ingestion
mkdir -p src/services/synthesis
mkdir -p src/services/memory

# 3. Implement base ingestion service
# src/services/ingestion/base-ingestion.ts
```

**Day 2: File Watchers + Limitless**
```bash
# Install dependencies
npm install chokidar

# Implement file watchers
# src/services/ingestion/claude-files.ts
# src/services/ingestion/granola.ts

# Implement Limitless integration
# src/services/ingestion/limitless.ts
```

**Day 3: API Endpoints**
```bash
# Create ingestion endpoints
# src/app/api/ingest/claude-files/route.ts
# src/app/api/ingest/granola/route.ts
# src/app/api/ingest/limitless/route.ts

# Test ingestion
npm run test:ingest
```

### Week 1: Intelligence (Days 4-7)

**Day 4-5: Synthesis Engine**
```bash
# Implement synthesis logic
# src/services/synthesis/deduplication.ts
# src/services/synthesis/linking.ts

# Add Claude API integration
# src/lib/claude-api.ts

# Create synthesis job
# Add to src/services/jobs.ts
```

**Day 6: Export API Enhancement**
```bash
# Enhance existing ChatGPT export
# src/app/api/export/chatgpt/route.ts
# Add grouping, context, synthesis info
```

**Day 7: Testing & Refinement**
```bash
# End-to-end testing
# Create sample data
# Run file watchers
# Test synthesis
# Verify export format
```

---

## ACCESS INTERFACES

### 1. Claude Desktop / ChatGPT

**Current Status:** ✅ Already works via `/api/export/chatgpt`

**Enhancement:**
```typescript
// Add synthesis information to export
GET /api/export/chatgpt?include=context,related

// Returns enhanced format:
# @Seth TODO List

## 🔥 Top 3 (Synthesis-Ranked)
1. Fix MIYOMI character consistency [MENTIONED 3x]
   - Originally from: Limitless call with Jacob (Oct 19)
   - Also mentioned in: Claude Code session (Oct 20)
   - Related to: "Review character design assets"

## 🔗 Related Task Groups
### MIYOMI Launch Prep (5 tasks)
...
```

### 2. Command Center Web UI

**Current Status:** ✅ Already exists at `/command-center/todos`

**Enhancements:**
- Add "source" badges (Limitless, Granola, Claude Code icons)
- Show mention count as indicator
- Display related tasks as expandable panel
- Add context snippets on hover

### 3. @seth Agent (Eden)

**New Interface:**
```typescript
// Read-only API for @seth agent
GET /api/agent/status
{
  "top3": [...],
  "activeProjects": ["MIYOMI", "SOLENNE"],
  "blockers": 2,
  "summary": "Working on MIYOMI character consistency. SOLENNE launch on track."
}

GET /api/agent/query?q=what's%20my%20progress%20on%20miyomi
{
  "answer": "You have 5 active MIYOMI tasks. Character consistency is your top priority...",
  "tasks": [...]
}
```

### 4. CLI (Optional)

```bash
# Quick terminal access
seth todo list
seth todo add "Fix bug in parser"
seth todo top3
```

---

## PRIVACY & FILTERING

### Privacy Levels
```typescript
// Add to Task model
enum PrivacyLevel {
  PRIVATE   // Never show publicly
  INTERNAL  // Show to @seth agent
  PUBLIC    // Can display on sethgoldstein.com
}

// Tag tasks appropriately
await prisma.task.update({
  where: { id: taskId },
  data: {
    tags: tags + ',privacy:private'
  }
})
```

### Public Website Integration
```typescript
// sethgoldstein.com/now
// Shows filtered TODO list
GET /api/todos?privacy=public&status=doing

// Example:
## What I'm Working On
- Launching MIYOMI character animation platform (Dec 1)
- Building SOLIENNE daily art practice
- Spirit Protocol development
```

---

## RELIABILITY & BACKUPS

### 1. Data Integrity
```typescript
// Already built-in via:
- PostgreSQL (production)
- AuditLog (complete history)
- Prisma transactions

// Add:
- Daily database backups (Vercel Postgres auto-backup)
- Export to JSON (weekly snapshot)
```

### 2. Offline Access
```typescript
// Service worker for web UI
// Cache last TODO list locally
// Sync when back online
```

### 3. Failure Recovery
```typescript
// File watchers: Resume from last checkpoint
// Ingestion: Retry failed items
// Synthesis: Idempotent (can re-run safely)
```

---

## COST ESTIMATE

### Claude API Usage
- **Synthesis engine:** 30min intervals = 48 runs/day
- **Average tokens per run:** ~5,000 tokens (analyze 50 tasks)
- **Daily cost:** ~$0.25/day = $7.50/month

### Infrastructure
- **Vercel:** Free tier sufficient for MVP
- **PostgreSQL:** $20/month (Vercel Postgres)
- **Total:** ~$27.50/month

---

## SUCCESS METRICS

### Phase 1 MVP Success
- [ ] 3+ sources ingesting automatically
- [ ] Synthesis engine detecting duplicates (>80% accuracy)
- [ ] Export API working for Claude/ChatGPT
- [ ] Zero data loss (all operations logged)

### Phase 2 Success
- [ ] @seth agent answering TODO queries
- [ ] Weekly summaries generating automatically
- [ ] Long-term archive searchable
- [ ] Average 10+ TODOs ingested daily

### Phase 3 Success
- [ ] Pattern detection working (recurring tasks identified)
- [ ] Public goals page live
- [ ] Context retention spanning months
- [ ] System fully autonomous (minimal manual intervention)

---

## NEXT STEPS (CONCRETE ACTIONS)

### Immediate (Today)
1. Review this architecture doc
2. Confirm approach and priorities
3. Identify any missing requirements

### This Week (MVP Start)
1. Create database migration (Day 1)
2. Implement file watchers (Day 2)
3. Build Limitless integration (Day 2-3)
4. Create ingestion API endpoints (Day 3)
5. Implement synthesis engine (Day 4-5)
6. Enhance export API (Day 6)
7. End-to-end testing (Day 7)

### Next Week (MVP Polish)
1. @seth agent integration
2. UI enhancements (show sources, context)
3. Documentation
4. Deploy to production

---

## QUESTIONS TO RESOLVE

1. **Limitless sync frequency:** Real-time webhook or hourly poll?
2. **Granola location:** Confirm exact export directory path
3. **Claude Code scope:** Watch all ~/projects or specific directories?
4. **Synthesis frequency:** 30min, 1hr, or on-demand?
5. **Privacy default:** Should new tasks default to PRIVATE or INTERNAL?
6. **@seth agent permissions:** Read-only or can it create/complete tasks?

---

## ARCHITECTURAL DECISIONS

### Why This Approach

**1. Build on existing foundation**
- You already have 80% of the system
- No need to rebuild TODO management
- Prisma + PostgreSQL proven in production

**2. Separation of concerns**
- Ingestion layer handles all sources
- Synthesis engine decoupled from ingestion
- Access interfaces independent

**3. Idempotent operations**
- Can re-run synthesis safely
- File watchers resume from checkpoint
- No duplicate task creation

**4. Observable & debuggable**
- AuditLog captures everything
- Job queue tracks processing
- Source health monitoring

**5. Incremental intelligence**
- Start with simple deduplication
- Add pattern detection later
- Context retention grows over time

---

*Ready to build this. Let me know if you want to proceed with MVP implementation or need any clarifications on the architecture.*
