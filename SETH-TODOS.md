# @Seth Todos - Dynamic Task System

**Agent-aware, Swiss-clean task management for the Seth Command Center**

## Overview

@Seth Todos is a sophisticated task management system built into the Seth Command Center that captures tasks from anywhere and presents them through an intelligent, agent-aware interface. The system follows a manifest-first architecture with ritual-driven automation and Swiss design principles.

## Core Philosophy

- **Capture anywhere, act from one place** - Tasks flow in via email forward, quick slash commands, and calendar triggers, then live in one canonical list
- **Agent-aware** - Your agent proposes a Top 3 daily, schedules focus windows, and kills/defers ruthlessly when overloaded
- **Swiss-clean** - Minimal black/white UI, Helvetica typography, mathematical grid system, zero ornament

## Features

### 🎯 Intelligent Ranking System

The Top 3 ranking algorithm uses a weighted scoring system:

```
Score = W1×priority + W2×deadline_urgency + W3×energy_fit + W4×recency_penalty

Weights:
- W1 (Priority): 3 points
- W2 (Deadline): 3 points
- W3 (Energy Fit): 2 points
- W4 (Recency): 1 point
```

**Priority Scoring:**
- High (1) → 3 points
- Medium (2) → 2 points
- Low (3) → 1 point

**Deadline Urgency:**
- Due within 48h → 3 points
- Due within week → 2 points
- No deadline → 1 point

**Energy Fit (Time-based):**
- Morning (7-12): Favors deep energy tasks
- Afternoon (12-17): Favors normal energy tasks
- Evening/Night: Favors light energy tasks

### 🕐 Focus Windows

Auto-generated productivity blocks:
- **Deep Work** (9-11 AM): 120 minutes for high-concentration tasks
- **Regular Work** (2-3:30 PM): 90 minutes for standard tasks

### 📧 Email Intelligence

Smart email-to-task conversion:
- **TODO Detection**: Extracts clean task titles from email subjects
- **Project Mapping**: Auto-assigns based on sender/content patterns
- **Priority Detection**: Urgent/ASAP/Critical keywords → High priority
- **Source Tracking**: Full email metadata with Gmail thread links

## Projects & Color Coding

The system includes 6 @Seth personal projects:

| Project | Color | Focus | Example Tasks |
|---------|-------|--------|---------------|
| **BM** | Red (#FF6B6B) | Portfolio & Website | Paris Photo fee, Site updates |
| **Eden** | Green (#96CEB4) | AI Agent Work | Abraham launch, SOLIENNE deployment |
| **Automata** | Purple (#DDA0DD) | Research & Vision | Vision deck v2, Research scan |
| **Relocation** | Teal (#4ECDC4) | Moving & Location | Tax research, Location scouting |
| **IRS** | Blue (#45B7D1) | Legal & Finance | COBRA paperwork, Tax filing |
| **Vibecoding** | Yellow (#FFEAA7) | Newsletter & Content | AI updates, Portfolio content |

## API Endpoints

### Core Operations
- `GET /api/todos?view=today|week|all` - Get filtered todos
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `POST /api/todos/:id/complete` - Mark complete
- `POST /api/todos/:id/snooze` - Snooze with reason

### Intelligence
- `GET /api/top3` - Get ranked top 3 todos with focus windows
- `POST /api/todos/capture/email` - Convert email to todo

## Database Schema

### Core Models

```sql
-- Projects with color coding
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  type TEXT, -- 'personal', 'eden', 'vibecoding', 'automata'
  status TEXT, -- 'active', 'planning', 'paused', 'done'
  color TEXT, -- Hex color for UI
  createdAt DATETIME,
  updatedAt DATETIME
);

-- Tasks with energy levels and sources
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT REFERENCES projects(id),
  title TEXT NOT NULL,
  notes TEXT, -- Markdown notes
  priority INTEGER DEFAULT 2, -- 1=high, 2=medium, 3=low
  status TEXT DEFAULT 'open', -- 'open','doing','blocked','done','snoozed'
  due DATETIME,
  source TEXT DEFAULT 'manual', -- 'email','slash','calendar','api','manual'
  tags TEXT, -- Comma-separated
  energy INTEGER DEFAULT 2, -- 1=deep, 2=normal, 3=light
  createdAt DATETIME,
  updatedAt DATETIME
);

-- Email source tracking
CREATE TABLE source_emails (
  id TEXT PRIMARY KEY,
  taskId TEXT REFERENCES tasks(id),
  from TEXT NOT NULL,
  subject TEXT NOT NULL,
  snippet TEXT,
  threadUrl TEXT, -- Link back to Gmail
  receivedAt DATETIME,
  createdAt DATETIME
);

-- Audit logging for transparency
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT, -- '@seth', 'agent', 'system'
  action TEXT, -- 'todo.create', 'todo.complete', 'todo.snooze'
  payload TEXT, -- JSON data
  status TEXT, -- 'success', 'failure'
  error TEXT,
  createdAt DATETIME
);
```

## User Interface

### Three-Panel Design (`/command-center/todos`)

**Today Tab:**
- Top 3 ranked tasks with score breakdown
- Focus windows with assigned tasks
- Today's task grid with quick actions

**Week Tab:**
- Kanban board: Open → Doing → Blocked → Done
- Project-grouped task cards
- Weekly overview statistics

**Sources Tab:**
- Email capture interface
- Task source breakdown (email/slash/calendar/manual)
- Recent captures by source type

### Swiss Design System

- **Typography**: Helvetica Neue, bold uppercase headers, mathematical spacing
- **Colors**: Pure black (#000000) and white (#ffffff) base with project accent colors
- **Grid**: 8px base unit with consistent mathematical relationships
- **Interactions**: Minimal hover states, clear disabled states, instant feedback

## Task States & Workflow

```
OPEN ──→ DOING ──→ DONE
 ↓        ↑  ↓
 ↓    BLOCKED ←┘
 ↓
SNOOZED ──→ OPEN (auto-wake)
```

**Status Meanings:**
- **Open**: Ready to work on
- **Doing**: Currently active (only 1-2 should be doing)
- **Blocked**: Waiting on external dependencies
- **Done**: Completed with audit log
- **Snoozed**: Temporarily hidden until wake date

## Agent Commands

```bash
# Create new task
/todo add "Review Abraham launch deck" #Eden due:2025-10-19 p:1

# View today's priorities
/todo today

# Complete task
/todo done <task-id>

# Snooze task
/todo snooze <task-id> +2d "Waiting for legal review"

# List by project
/todo list #Eden due:<7d
```

## Email Capture Workflow

### Fast Path (Paste Interface)
1. Forward email to yourself with "TODO" in subject
2. Copy subject, from, and Gmail thread URL
3. Paste into `/command-center/todos` Sources tab
4. System auto-detects project and priority

### API Path (Webhook Ready)
```bash
curl -X POST /api/todos/capture/email \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "TODO: Review Abraham launch deck",
    "from": "eden@example.com",
    "snippet": "Please review before October 19 launch",
    "threadUrl": "https://mail.google.com/mail/u/0/#inbox/abc123"
  }'
```

## Automation Framework

### Morning Brief (8:30 AM)
- Generate Top 3 with score explanations
- Create focus windows based on calendar
- Post to Command Center dashboard

### Midday Recalibration (1:00 PM)
- Check if >3 critical tasks open
- Auto-suggest kill/delegate for overload
- Recompute focus windows for afternoon

### End-of-Day Wrap (6:00 PM)
- Mark completed tasks as done
- Roll over incomplete tasks to tomorrow
- Log daily statistics to audit trail

### Travel Mode
- When flagged for long travel/meetings
- Surface deep work tasks (research, planning)
- Mute low-impact routine tasks
- Adjust energy requirements for context

## Performance & Monitoring

### Key Metrics
- **Daily Completion Rate**: % of Top 3 completed
- **Focus Window Utilization**: Time spent in scheduled blocks
- **Email Capture Success**: % of TODO emails converted
- **Project Balance**: Distribution of effort across projects

### Audit Transparency
All mutations logged with:
- Actor (@seth, agent, system)
- Action (create, update, complete, snooze, delegate)
- Payload (full change data)
- Timestamp and status

## Integration Points

### Seth Command Center
- Embedded in main Command Center navigation
- Shares audit log with ritual system
- Uses same Swiss design tokens
- Integrates with manifest-first architecture

### Future Extensions
- **Calendar Sync**: Real calendar integration for focus windows
- **Gmail API**: Direct email monitoring vs manual forward
- **Slack Commands**: Native slash command support
- **Mobile App**: Native iOS/Android with push notifications

## Development

### Tech Stack
- **Backend**: Next.js 15 API routes, Prisma ORM, SQLite/PostgreSQL
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Validation**: Zod schemas for all API endpoints
- **Monitoring**: Sentry error tracking, comprehensive audit logs

### Local Development
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npm run db:seed

# Start development server
npm run dev

# Visit todos interface
open http://localhost:3005/command-center/todos
```

### Testing
```bash
# Run API tests
npm test

# Test ranking algorithm
curl http://localhost:3005/api/top3

# Test email capture
curl -X POST http://localhost:3005/api/todos/capture/email \
  -H "Content-Type: application/json" \
  -d '{"subject": "TODO: Test task", "from": "test@example.com"}'
```

## Architecture Decisions

### Why Manifest-First?
- Single source of truth prevents UI drift from data
- Forces explicit modeling of all task states
- Enables reliable automation and agent intelligence

### Why Swiss Design?
- Reduces cognitive load for task management
- Timeless aesthetic that won't feel dated
- Mathematical grid system scales consistently
- Black/white base with color accents creates hierarchy

### Why SQLite for Development?
- Zero-config setup for local development
- File-based database easy to inspect and reset
- Prisma migrations work identically to PostgreSQL
- Production deployment can use PostgreSQL seamlessly

### Why Energy Levels?
- Matches natural human productivity rhythms
- Enables intelligent scheduling in focus windows
- Helps agent recommend optimal task timing
- Prevents deep work during low-energy periods

---

**@Seth Todos - Capture anywhere, act from one place. Agent-aware, Swiss-clean.** ⚡️

*Built for the Seth Command Center - Ritual-driven personal intelligence platform*