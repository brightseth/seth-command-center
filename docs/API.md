# Seth Command Center API Documentation

Version: 0.1.0
Last Updated: October 11, 2025

## Overview

The Seth Command Center API provides programmatic access to Seth's personal productivity system, including task management, ritual execution, GitHub integration, AI session tracking, and ecosystem health monitoring.

The API is built with Next.js 15, uses PostgreSQL (Prisma ORM), and follows RESTful principles with JSON request/response formats.

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: Set via `NEXT_PUBLIC_APP_URL` environment variable (typically your Vercel deployment URL)

## Authentication

Most endpoints currently have **no authentication** as this is a personal command center. For production deployment:

- **Eden Bridge Ingestion** (`/api/eden-bridge/ingest`): Requires Bearer token authentication via `EDEN_BRIDGE_API_KEY`
- **Other endpoints**: Consider adding authentication middleware before public deployment

### Authenticated Request Example

```bash
curl -X POST https://your-domain.com/api/eden-bridge/ingest \
  -H "Authorization: Bearer your-eden-bridge-api-key" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"work.created","data":{}}'
```

---

## API Endpoints

### Health & Monitoring

#### GET /api/health

Basic health check for the Command Center system.

**Response**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "database": {
    "connected": true,
    "projects": 12,
    "tasks": 47,
    "works": 156
  },
  "system": {
    "environment": "production",
    "version": "0.1.0"
  }
}
```

**Status Codes**
- `200` - System healthy
- `500` - System unhealthy (database connection failed)

**Example**
```bash
curl http://localhost:3000/api/health
```

---

#### GET /api/ecosystem-health

Comprehensive health check across all integrated systems (Command Center, Vibecodings, Agent @Seth, Portfolio).

**Response**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "systems": {
    "commandCenter": {
      "status": "healthy",
      "data": {
        "projects": 12,
        "tasks": 47,
        "activeTasks": 8,
        "works": 156,
        "rituals": 5
      }
    },
    "vibecodings": {
      "status": "healthy",
      "message": "API integration pending",
      "data": {
        "days": 67,
        "sites": 34,
        "featured": 5
      }
    },
    "agentSeth": {
      "status": "healthy",
      "message": "Integration pending",
      "data": {
        "endpoint": "http://localhost:5555"
      }
    },
    "publicPortfolio": {
      "status": "healthy",
      "message": "Manual updates only",
      "data": {
        "url": "https://sethgoldstein.com"
      }
    }
  },
  "version": "0.1.0",
  "environment": "production"
}
```

**Status Values**
- `healthy` - System operating normally
- `degraded` - System functioning with issues
- `unhealthy` - System down or critical failure

**Example**
```bash
curl http://localhost:3000/api/ecosystem-health
```

---

#### POST /api/ecosystem-health

Submit health metrics from external systems (e.g., sync scripts, cron jobs).

**Request Body**
```json
{
  "timestamp": "2025-10-11T14:30:00.000Z",
  "projects": [
    {
      "name": "Abraham",
      "status": "healthy",
      "commits": 5,
      "lastActivity": "2025-10-11T12:00:00.000Z"
    }
  ]
}
```

**Response**
```json
{
  "success": true,
  "message": "Health metrics synced successfully",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "projects": 1
}
```

**Status Codes**
- `200` - Metrics synced successfully
- `400` - Invalid request body
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/ecosystem-health \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-11T14:30:00Z",
    "projects": [{"name":"Abraham","status":"healthy","commits":5}]
  }'
```

---

### Todo Management

#### GET /api/todos

Fetch todos with flexible filtering and view options.

**Query Parameters**
- `view` (optional): `today` | `week` | `all` (default: `all`)
- `project` (optional): Filter by project name
- `status` (optional): `open` | `doing` | `blocked` | `done` | `snoozed`
- `priority` (optional): `1` (high) | `2` (medium) | `3` (low)

**Response**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "clx123abc",
        "title": "Fix authentication bug",
        "notes": "Users report logout issues",
        "projectId": "proj_123",
        "priority": 1,
        "status": "doing",
        "due": "2025-10-12T10:00:00.000Z",
        "source": "manual",
        "tags": "bug,urgent",
        "energy": 2,
        "createdAt": "2025-10-10T08:00:00.000Z",
        "updatedAt": "2025-10-11T14:30:00.000Z",
        "project": {
          "name": "Abraham",
          "color": "#FF6B6B",
          "type": "technical"
        },
        "sourceEmails": []
      }
    ],
    "projects": [
      {
        "id": "proj_123",
        "name": "Abraham",
        "color": "#FF6B6B",
        "type": "technical"
      }
    ],
    "meta": {
      "view": "all",
      "total": 47,
      "byStatus": {
        "open": 25,
        "doing": 8,
        "blocked": 3,
        "done": 10,
        "snoozed": 1
      }
    }
  }
}
```

**Examples**
```bash
# Get all todos
curl http://localhost:3000/api/todos

# Get today's focus todos
curl http://localhost:3000/api/todos?view=today

# Get high priority todos for Abraham project
curl "http://localhost:3000/api/todos?project=Abraham&priority=1"

# Get blocked tasks
curl "http://localhost:3000/api/todos?status=blocked"
```

---

#### POST /api/todos

Create a new todo.

**Request Body**
```json
{
  "title": "Design new dashboard layout",
  "notes": "Focus on mobile-first approach",
  "projectId": "proj_123",
  "priority": 2,
  "status": "open",
  "due": "2025-10-15T10:00:00.000Z",
  "source": "manual",
  "tags": "design,ui",
  "energy": 1
}
```

**Field Descriptions**
- `title` (required): Task title
- `notes` (optional): Additional details
- `projectId` (required): Project UUID
- `priority` (optional): 1=high, 2=medium, 3=low (default: 2)
- `status` (optional): Task status (default: "open")
- `due` (optional): Due date in ISO 8601 format
- `source` (optional): `email` | `slash` | `calendar` | `api` | `manual` (default: "manual")
- `tags` (optional): Comma-separated tags
- `energy` (optional): 1=deep, 2=normal, 3=light (default: 2)

**Response**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "title": "Design new dashboard layout",
    "notes": "Focus on mobile-first approach",
    "projectId": "proj_123",
    "priority": 2,
    "status": "open",
    "due": "2025-10-15T10:00:00.000Z",
    "source": "manual",
    "tags": "design,ui",
    "energy": 1,
    "createdAt": "2025-10-11T14:30:00.000Z",
    "updatedAt": "2025-10-11T14:30:00.000Z",
    "project": {
      "name": "Abraham",
      "color": "#FF6B6B"
    }
  },
  "message": "Todo \"Design new dashboard layout\" created successfully"
}
```

**Status Codes**
- `200` - Todo created successfully
- `400` - Validation error
- `404` - Project not found
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull requests",
    "projectId": "proj_123",
    "priority": 1,
    "energy": 2,
    "due": "2025-10-12T17:00:00Z"
  }'
```

---

#### PATCH /api/todos/:id

Update an existing todo.

**Path Parameters**
- `id`: Todo UUID

**Request Body** (all fields optional)
```json
{
  "title": "Review pull requests (URGENT)",
  "status": "doing",
  "priority": 1,
  "due": "2025-10-12T15:00:00.000Z"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "title": "Review pull requests (URGENT)",
    "status": "doing",
    "priority": 1,
    "due": "2025-10-12T15:00:00.000Z",
    "updatedAt": "2025-10-11T14:45:00.000Z",
    "project": {
      "name": "Abraham",
      "color": "#FF6B6B"
    }
  },
  "message": "Todo \"Review pull requests (URGENT)\" updated successfully"
}
```

**Status Codes**
- `200` - Todo updated successfully
- `400` - Validation error
- `404` - Todo or project not found
- `500` - Internal server error

**Example**
```bash
curl -X PATCH http://localhost:3000/api/todos/clx456def \
  -H "Content-Type: application/json" \
  -d '{"status":"doing","priority":1}'
```

---

#### DELETE /api/todos/:id

Delete a todo permanently.

**Path Parameters**
- `id`: Todo UUID

**Response**
```json
{
  "success": true,
  "message": "Todo \"Design new dashboard layout\" deleted successfully"
}
```

**Status Codes**
- `200` - Todo deleted successfully
- `404` - Todo not found
- `500` - Internal server error

**Example**
```bash
curl -X DELETE http://localhost:3000/api/todos/clx456def
```

---

#### POST /api/todos/:id/complete

Mark a todo as complete (convenience endpoint with side effects).

**Path Parameters**
- `id`: Todo UUID

**Response**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "title": "Review pull requests",
    "status": "done",
    "updatedAt": "2025-10-11T15:00:00.000Z",
    "project": {
      "name": "Abraham",
      "color": "#FF6B6B"
    }
  },
  "message": "Todo \"Review pull requests\" marked as complete! 🎉"
}
```

**Side Effects**
- Sets status to "done"
- Triggers doc-organizer webhook (archives related specs if applicable)
- Creates audit log entry

**Status Codes**
- `200` - Todo completed successfully
- `400` - Todo already completed
- `404` - Todo not found
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/todos/clx456def/complete
```

---

#### POST /api/todos/:id/snooze

Snooze a todo until a specified time.

**Path Parameters**
- `id`: Todo UUID

**Request Body**
```json
{
  "until": "2025-10-12T09:00:00.000Z"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "status": "snoozed",
    "snoozedUntil": "2025-10-12T09:00:00.000Z"
  },
  "message": "Todo snoozed until 2025-10-12T09:00:00.000Z"
}
```

---

#### GET /api/top3

Get the top 3 recommended todos based on priority, deadline, energy fit, and recency.

**Query Parameters**
- `limit` (optional): Number of todos to return (default: 3)

**Response**
```json
{
  "success": true,
  "data": {
    "top3": [
      {
        "id": "clx123abc",
        "title": "Fix authentication bug",
        "priority": 1,
        "status": "doing",
        "energy": 2,
        "score": 18,
        "scoreBreakdown": {
          "priority": 9,
          "deadline": 6,
          "energy": 2,
          "recency": 1
        },
        "project": {
          "name": "Abraham",
          "color": "#FF6B6B"
        }
      }
    ],
    "focusWindows": [
      {
        "type": "deep",
        "start": "2025-10-12T09:00:00.000Z",
        "end": "2025-10-12T11:00:00.000Z",
        "duration": 120,
        "tasks": [],
        "description": "Deep work window for high-concentration tasks"
      },
      {
        "type": "normal",
        "start": "2025-10-12T14:00:00.000Z",
        "end": "2025-10-12T15:30:00.000Z",
        "duration": 90,
        "tasks": [],
        "description": "Regular work window for standard tasks"
      }
    ],
    "stats": {
      "totalActive": 47,
      "byPriority": {
        "high": 12,
        "medium": 28,
        "low": 7
      },
      "byEnergy": {
        "deep": 15,
        "normal": 25,
        "light": 7
      }
    },
    "meta": {
      "currentHour": 14,
      "weights": {
        "priority": 3,
        "deadline": 3,
        "energy": 2,
        "recency": 1
      },
      "generatedAt": "2025-10-11T14:30:00.000Z"
    }
  },
  "message": "Top 3 todos ranked by priority, urgency, and energy fit"
}
```

**Ranking Algorithm**
- **Priority Score**: (4 - priority) × 3 (high priority = more points)
- **Deadline Score**: 3 points if due within 48h, 2 if within 7 days, 1 otherwise
- **Energy Fit**: Matches task energy (deep/normal/light) to current time of day
  - Morning (7-12): Favor deep energy tasks
  - Afternoon (12-17): Favor normal energy tasks
  - Evening/Night (17-7): Favor light energy tasks
- **Recency Score**: 2 points if created within 24h, 1 otherwise

**Example**
```bash
# Get top 3 todos
curl http://localhost:3000/api/top3

# Get top 5 todos
curl http://localhost:3000/api/top3?limit=5
```

---

### Rituals

#### POST /api/rituals/run

Execute a ritual manually (with cooldown protection).

**Request Body**
```json
{
  "ritualId": "ritual_morning_sync"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "jobId": "job_clx789ghi",
    "ritual": {
      "id": "ritual_morning_sync",
      "name": "Morning Sync",
      "project": "seth",
      "streak": 15
    }
  },
  "message": "Ritual \"Morning Sync\" queued for execution"
}
```

**Status Codes**
- `200` - Ritual queued successfully
- `400` - Ritual is disabled or invalid format
- `404` - Ritual not found
- `429` - Ritual on cooldown (max 1 run per hour)
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/rituals/run \
  -H "Content-Type: application/json" \
  -d '{"ritualId":"ritual_morning_sync"}'
```

---

#### GET /api/rituals/check

Check and run scheduled rituals (called by cron jobs).

**Response**
```json
{
  "success": true,
  "timestamp": "2025-10-11T09:00:00.000Z",
  "checked": 5,
  "executed": 2,
  "results": [
    {
      "ritual": "Morning Sync",
      "success": true,
      "output": "Synced 3 projects, 12 commits",
      "error": null
    },
    {
      "ritual": "GitHub Stats",
      "success": true,
      "output": "Updated KPIs for 5 repos",
      "error": null
    }
  ],
  "message": "Successfully executed 2 ritual(s)"
}
```

**Example**
```bash
curl http://localhost:3000/api/rituals/check
```

---

#### POST /api/rituals/check

Manually trigger all enabled rituals (bypass schedule check for testing).

**Response**
```json
{
  "success": true,
  "timestamp": "2025-10-11T14:30:00.000Z",
  "mode": "manual",
  "checked": 5,
  "executed": 5,
  "results": [
    {
      "ritual": "Morning Sync",
      "success": true,
      "output": "Synced successfully",
      "error": null
    }
  ],
  "message": "Manually executed 5 ritual(s)"
}
```

**Example**
```bash
curl -X POST http://localhost:3000/api/rituals/check
```

---

### GitHub Integration

#### GET /api/github/commits

Fetch recent GitHub commits for a project.

**Query Parameters**
- `project` (required): Project name (e.g., "Abraham", "SOLIENNE")
- `days` (optional): Number of days to look back (default: 7)

**Response**
```json
{
  "success": true,
  "data": {
    "project": "Abraham",
    "days": 7,
    "commits": [
      {
        "sha": "a1b2c3d4",
        "message": "Fix authentication flow",
        "author": "Seth Goldstein",
        "date": "2025-10-11T10:30:00Z",
        "url": "https://github.com/brightseth/abraham/commit/a1b2c3d4"
      }
    ],
    "totalCommits": 15,
    "activeRepos": 3
  }
}
```

**Status Codes**
- `200` - Commits fetched successfully
- `400` - Missing project parameter
- `500` - GitHub API error or internal server error

**Example**
```bash
# Get last 7 days of Abraham commits
curl "http://localhost:3000/api/github/commits?project=Abraham&days=7"

# Get last 30 days across all projects
curl "http://localhost:3000/api/github/commits?project=all&days=30"
```

---

#### POST /api/github/sync

Sync GitHub data to database and update KPIs.

**Response**
```json
{
  "success": true,
  "data": {
    "stats": {
      "todayCommits": 5,
      "thisWeekCommits": 23,
      "activeRepos": 4,
      "lastCommitTime": "2025-10-11T10:30:00Z"
    },
    "kpisUpdated": 3,
    "lastCommit": "2025-10-11T10:30:00Z"
  },
  "message": "GitHub data synced successfully"
}
```

**Side Effects**
- Syncs commits to database
- Updates KPIs: `github.commits.today`, `github.commits.week`, `github.repos.active`

**Example**
```bash
curl -X POST http://localhost:3000/api/github/sync
```

---

#### GET /api/github/sync

Get current GitHub statistics without syncing.

**Response**
```json
{
  "success": true,
  "data": {
    "todayCommits": 5,
    "thisWeekCommits": 23,
    "activeRepos": 4,
    "lastCommitTime": "2025-10-11T10:30:00Z"
  }
}
```

**Example**
```bash
curl http://localhost:3000/api/github/sync
```

---

### Eden Bridge Integration

#### POST /api/eden-bridge/ingest

Ingest events from the Eden ecosystem (requires authentication).

**Authentication**: Bearer token via `EDEN_BRIDGE_API_KEY`

**Request Body**
```json
{
  "eventType": "work.created",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "source": "eden-genesis-registry",
  "data": {
    "workId": "work_clx123",
    "agentId": "agent_seth",
    "type": "video",
    "title": "Consciousness Exploration #47",
    "metadata": {
      "duration": 120,
      "format": "mp4"
    }
  },
  "mappings": {
    "createTask": true,
    "updateKPI": true,
    "createWork": true
  }
}
```

**Supported Event Types**
- `work.created` - New work created in Eden
- `agent.update` - Agent profile updated
- `cohort.milestone` - Cohort reached milestone
- `studio.publish` - Studio published new content

**Response**
```json
{
  "success": true,
  "data": {
    "processed": ["task", "kpi", "work"],
    "itemsCreated": {
      "tasks": 1,
      "kpis": 2,
      "works": 1
    }
  },
  "message": "Processed 3 mappings: task, kpi, work"
}
```

**Status Codes**
- `200` - Event processed successfully
- `400` - Invalid event format
- `401` - Unauthorized (missing or invalid API key)
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/eden-bridge/ingest \
  -H "Authorization: Bearer your-eden-bridge-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "work.created",
    "timestamp": "2025-10-11T14:30:00Z",
    "source": "eden-genesis-registry",
    "data": {
      "workId": "work_123",
      "title": "New Video"
    }
  }'
```

---

#### GET /api/eden-bridge/ingest

Get Eden Bridge statistics and sync status.

**Response**
```json
{
  "success": true,
  "data": {
    "totalEvents": 156,
    "lastSync": "2025-10-11T14:00:00.000Z",
    "byEventType": {
      "work.created": 89,
      "agent.update": 42,
      "cohort.milestone": 15,
      "studio.publish": 10
    }
  }
}
```

**Example**
```bash
curl http://localhost:3000/api/eden-bridge/ingest
```

---

### AI Sessions

#### POST /api/ai-sessions/ingest

Ingest AI conversation data to extract tasks, KPIs, and works.

**Request Body** (single conversation)
```json
{
  "sessionId": "session_clx123",
  "source": "claude",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "messages": [
    {
      "role": "user",
      "content": "Help me plan the Abraham project launch"
    },
    {
      "role": "assistant",
      "content": "Let's break this into actionable tasks: 1) Finalize homepage design..."
    }
  ],
  "metadata": {
    "model": "claude-sonnet-4.5",
    "totalTokens": 1500
  }
}
```

**Request Body** (batch of conversations)
```json
[
  {
    "sessionId": "session_clx123",
    "source": "claude",
    "messages": []
  },
  {
    "sessionId": "session_clx124",
    "source": "chatgpt",
    "messages": []
  }
]
```

**Response**
```json
{
  "success": true,
  "data": {
    "processed": 2,
    "totalItemsCreated": {
      "tasks": 5,
      "kpis": 3,
      "works": 1
    },
    "results": [
      {
        "sessionId": "session_clx123",
        "source": "claude",
        "success": true,
        "intelligence": {
          "extractedTasks": 3,
          "extractedKPIs": 2,
          "extractedWorks": 1
        },
        "itemsCreated": {
          "tasks": 3,
          "kpis": 2,
          "works": 1
        }
      }
    ]
  },
  "message": "Processed 2 AI conversations, created 5 tasks, 3 KPIs, 1 works"
}
```

**Example**
```bash
curl -X POST http://localhost:3000/api/ai-sessions/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "source": "claude",
    "timestamp": "2025-10-11T14:30:00Z",
    "messages": [
      {"role":"user","content":"Create a task for code review"},
      {"role":"assistant","content":"I will create that task"}
    ]
  }'
```

---

#### GET /api/ai-sessions/ingest

Get AI session sync statistics.

**Response**
```json
{
  "success": true,
  "data": {
    "mockSyncResult": {
      "sessions": 45,
      "tasksCreated": 120,
      "kpisCreated": 67,
      "worksCreated": 23
    }
  },
  "message": "AI session sync completed (mock data for now)"
}
```

---

### Job Queue

#### POST /api/jobs/queue

Enqueue a background job for processing.

**Request Body**
```json
{
  "type": "ritual.run",
  "payload": {
    "ritualId": "ritual_morning_sync"
  },
  "runAt": "2025-10-12T09:00:00.000Z",
  "maxRetries": 3
}
```

**Job Types**
- `ritual.run` - Execute a ritual
- `github.sync` - Sync GitHub data
- `ai-session.process` - Process AI conversation
- `eden-bridge.sync` - Sync Eden ecosystem data

**Response**
```json
{
  "success": true,
  "data": {
    "id": "job_clx789ghi",
    "type": "ritual.run",
    "status": "queued",
    "payload": {
      "ritualId": "ritual_morning_sync"
    },
    "runAt": "2025-10-12T09:00:00.000Z",
    "createdAt": "2025-10-11T14:30:00.000Z"
  },
  "message": "Job ritual.run queued with ID: job_clx789ghi"
}
```

**Status Codes**
- `200` - Job queued successfully
- `400` - Invalid job format
- `500` - Internal server error

**Example**
```bash
curl -X POST http://localhost:3000/api/jobs/queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ritual.run",
    "payload": {"ritualId":"ritual_morning_sync"}
  }'
```

---

#### GET /api/jobs/queue

Get job queue statistics.

**Response**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "byStatus": {
      "queued": 5,
      "running": 2,
      "completed": 142,
      "failed": 7
    },
    "byType": {
      "ritual.run": 67,
      "github.sync": 45,
      "ai-session.process": 34,
      "eden-bridge.sync": 10
    }
  }
}
```

**Example**
```bash
curl http://localhost:3000/api/jobs/queue
```

---

#### GET /api/jobs/status/:jobId

Get the status of a specific job.

**Path Parameters**
- `jobId`: Job UUID

**Response**
```json
{
  "success": true,
  "data": {
    "id": "job_clx789ghi",
    "type": "ritual.run",
    "status": "completed",
    "payload": {
      "ritualId": "ritual_morning_sync"
    },
    "result": {
      "success": true,
      "output": "Synced 3 projects"
    },
    "runAt": "2025-10-12T09:00:00.000Z",
    "completedAt": "2025-10-12T09:00:15.000Z",
    "createdAt": "2025-10-11T14:30:00.000Z"
  }
}
```

**Status Codes**
- `200` - Job found
- `404` - Job not found
- `500` - Internal server error

**Example**
```bash
curl http://localhost:3000/api/jobs/status/job_clx789ghi
```

---

## Webhooks

### POST /api/hooks/doc-organizer

Internal webhook triggered when tasks are completed. Archives related specification documents.

**Triggered By**
- `POST /api/todos/:id/complete`

**Request Body**
```json
{
  "project": "Abraham",
  "trigger": "task.complete",
  "taskId": "clx456def",
  "reason": "Task completed: Fix authentication bug"
}
```

**Response**
```json
{
  "success": true,
  "message": "Spec documents organized",
  "archived": 2
}
```

---

## Data Models

### Todo/Task Schema

```typescript
{
  id: string              // UUID
  title: string           // Task title
  notes: string | null    // Additional details
  projectId: string       // Foreign key to Project
  priority: number        // 1 (high), 2 (medium), 3 (low)
  status: string          // 'open' | 'doing' | 'blocked' | 'done' | 'snoozed'
  due: Date | null        // Due date
  source: string          // 'email' | 'slash' | 'calendar' | 'api' | 'manual'
  tags: string            // Comma-separated tags
  energy: number          // 1 (deep), 2 (normal), 3 (light)
  createdAt: Date
  updatedAt: Date
  snoozedUntil: Date | null
}
```

### Project Schema

```typescript
{
  id: string          // UUID
  name: string        // Project name
  color: string       // Hex color code
  type: string        // 'technical' | 'creative' | 'business' | 'personal'
  active: boolean     // Is project active
  createdAt: Date
  updatedAt: Date
}
```

### Ritual Schema

```typescript
{
  id: string              // UUID
  name: string            // Ritual name
  projectId: string       // Foreign key to Project
  enabled: boolean        // Is ritual enabled
  schedule: string        // Cron expression
  script: string          // Script to execute
  lastRun: Date | null    // Last execution time
  streak: number          // Consecutive successful runs
  createdAt: Date
  updatedAt: Date
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "details": {
    "field": "Additional context if available"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error, missing required fields)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit or cooldown)
- `500` - Internal Server Error (database error, unexpected failure)

---

## Rate Limiting

**Current Implementation**: No rate limiting (personal command center)

**Recommended for Production**:
- Ritual execution: 1 run per hour per ritual (enforced by cooldown)
- Eden Bridge ingestion: Consider rate limiting based on event volume
- Todo API: No limits currently, monitor for abuse

---

## Environment Variables

Required environment variables for full API functionality:

```bash
# Database (Required)
STORAGE_URL="postgresql://user:pass@host:5432/db"

# Eden Bridge (Required for /api/eden-bridge/ingest)
EDEN_BRIDGE_API_KEY="your-secret-key"

# GitHub (Optional - for commit tracking)
GITHUB_TOKEN="ghp_your_token"
GITHUB_USERNAME="brightseth"

# Sentry (Optional - for error tracking)
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-token"

# Redis (Optional - for job queue)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

See `.env.example` for full configuration details.

---

## Integration Examples

### Sync External System Health

```bash
#!/bin/bash
# sync-health.sh - Run from cron to sync external system health

COMMAND_CENTER="https://your-domain.com"

curl -X POST "$COMMAND_CENTER/api/ecosystem-health" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "projects": [
      {
        "name": "Vibecodings",
        "status": "healthy",
        "sites": 34,
        "lastDeploy": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }
    ]
  }'
```

---

### Create Todo from External Script

```python
import requests
from datetime import datetime, timedelta

# Create high-priority todo due tomorrow
response = requests.post(
    "https://your-domain.com/api/todos",
    json={
        "title": "Review weekly metrics",
        "projectId": "proj_seth",
        "priority": 1,
        "energy": 2,
        "due": (datetime.now() + timedelta(days=1)).isoformat(),
        "source": "api",
        "tags": "metrics,weekly"
    }
)

print(response.json())
```

---

### Monitor Job Status

```javascript
// monitor-job.js - Poll job status until completion

async function monitorJob(jobId) {
  const url = `https://your-domain.com/api/jobs/status/${jobId}`;

  while (true) {
    const response = await fetch(url);
    const { data } = await response.json();

    console.log(`Job ${jobId}: ${data.status}`);

    if (data.status === 'completed' || data.status === 'failed') {
      return data;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Queue ritual and monitor
const queueResponse = await fetch('https://your-domain.com/api/rituals/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ritualId: 'ritual_morning_sync' })
});

const { data } = await queueResponse.json();
const result = await monitorJob(data.jobId);

console.log('Job completed:', result);
```

---

### Eden Bridge Event Ingestion

```bash
#!/bin/bash
# ingest-eden-work.sh - Ingest new work from Eden

EDEN_API_KEY="your-eden-bridge-api-key"
COMMAND_CENTER="https://your-domain.com"

# Get latest work from Eden (example)
WORK_DATA=$(curl -s "https://eden-genesis-registry.vercel.app/api/works/latest")

# Ingest to Command Center
curl -X POST "$COMMAND_CENTER/api/eden-bridge/ingest" \
  -H "Authorization: Bearer $EDEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "work.created",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "source": "eden-genesis-registry",
    "data": '"$WORK_DATA"',
    "mappings": {
      "createWork": true,
      "updateKPI": true
    }
  }'
```

---

## Versioning

**Current Version**: 0.1.0

The API does not currently use URL versioning (e.g., `/v1/`). Breaking changes will be documented in release notes.

**Future Versioning Strategy**:
- Semantic versioning for API releases
- URL-based versioning for major breaking changes
- Deprecation warnings before removing endpoints

---

## Support & Contact

For questions, issues, or integration support:

- **GitHub**: [brightseth/seth-command-center](https://github.com/brightseth/seth-command-center)
- **Documentation**: See `/docs` folder for ADRs and technical specs
- **Email**: seth@eden.art (for Eden ecosystem integrations)

---

## Changelog

### 0.1.0 (October 2025)
- Initial API release
- Todo management endpoints
- Ritual execution system
- GitHub integration
- Eden Bridge ingestion
- AI session processing
- Job queue system
- Health monitoring endpoints

---

**Last Updated**: October 11, 2025
**Documentation Version**: 1.0.0
