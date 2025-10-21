# MVP Implementation Guide
## Week 1 Starter Pack - TODO & Memory System

**Goal:** Get Limitless, Claude Code files, and Granola ingesting TODOs automatically

---

## Day 1: Database Migration

### 1. Update Prisma Schema

Add to `/prisma/schema.prisma`:

```prisma
model Task {
  // ... existing fields ...

  // NEW: Memory & Context Fields
  sourceContext      String?    // JSON: {conversation_id, meeting_id, file_path}
  extractedFrom      String?    // Original text snippet
  linkedTaskIds      String     @default("") // Comma-separated related task IDs
  synthesisMetadata  String?    // JSON: {duplicate_of, grouped_with, confidence}
  mentionCount       Int        @default(1) // How many times referenced
  lastMentioned      DateTime?  // When last referenced
  archived           Boolean    @default(false)
  archivedAt         DateTime?

  // Relations
  history    TaskHistory[]
  syntheses  TaskSynthesis[]
}

// NEW: Task History
model TaskHistory {
  id         String   @id @default(cuid())
  taskId     String
  action     String   // 'created','updated','completed','mentioned','archived'
  changes    String   // JSON: {field: {before, after}}
  source     String   // 'limitless','granola','claude-code','manual','api'
  context    String?  // Additional context
  createdAt  DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId, createdAt])
  @@map("task_history")
}

// NEW: Task Synthesis
model TaskSynthesis {
  id            String   @id @default(cuid())
  taskId        String
  relatedTaskId String?
  relationship  String   // 'duplicate','related','blocks','blocked_by','supersedes'
  confidence    Float    // 0.0 - 1.0
  reason        String   // Why they're linked
  createdAt     DateTime @default(now())
  createdBy     String   @default("synthesis-engine")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([relatedTaskId])
  @@map("task_synthesis")
}

// NEW: Ingestion Source Tracking
model IngestionSource {
  id            String   @id @default(cuid())
  name          String   @unique // 'limitless','granola','claude-code','email'
  type          String   // 'api','file-watcher','webhook','manual'
  enabled       Boolean  @default(true)
  lastSync      DateTime?
  lastSuccess   DateTime?
  tasksCreated  Int      @default(0)
  config        String   // JSON: {api_key, file_paths, webhooks, etc}
  health        String   @default("healthy") // 'healthy','degraded','failing','disabled'
  errorLog      String?  // Recent errors (JSON array)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("ingestion_sources")
}
```

### 2. Run Migration

```bash
cd /Users/seth/seth-command-center
npx prisma migrate dev --name add_memory_system
npx prisma generate
```

### 3. Seed Ingestion Sources

Create `/prisma/seed-ingestion.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedIngestionSources() {
  // Limitless
  await prisma.ingestionSource.upsert({
    where: { name: 'limitless' },
    update: {},
    create: {
      name: 'limitless',
      type: 'api',
      enabled: true,
      config: JSON.stringify({
        sync_frequency: '1h',
        extract_patterns: ['TODO', 'ACTION', 'FOLLOW UP', 'COMMITMENT']
      })
    }
  })

  // Granola
  await prisma.ingestionSource.upsert({
    where: { name: 'granola' },
    update: {},
    create: {
      name: 'granola',
      type: 'file-watcher',
      enabled: true,
      config: JSON.stringify({
        watch_path: '/Users/seth/Documents/Granola',
        patterns: ['*.md'],
        extract_patterns: ['Action Item', '[ ]', 'TODO']
      })
    }
  })

  // Claude Code
  await prisma.ingestionSource.upsert({
    where: { name: 'claude-code' },
    update: {},
    create: {
      name: 'claude-code',
      type: 'file-watcher',
      enabled: true,
      config: JSON.stringify({
        watch_paths: [
          '/Users/seth/solienne.ai',
          '/Users/seth/eden-dev',
          '/Users/seth/seth-command-center'
        ],
        patterns: ['SESSION*.md', 'CLAUDE.md', 'TODO.md', '*.md'],
        ignore: ['node_modules', '.git', 'dist', 'build']
      })
    }
  })

  console.log('✅ Ingestion sources seeded')
}

seedIngestionSources()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run: `npx tsx prisma/seed-ingestion.ts`

---

## Day 2: File Watcher Service

### 1. Install Dependencies

```bash
npm install chokidar
npm install @anthropic-ai/sdk
```

### 2. Create Base Ingestion Service

`/src/services/ingestion/base-ingestion.ts`:

```typescript
import { prisma } from '@/lib/db'

export interface IngestedTask {
  title: string
  notes?: string
  projectName?: string
  priority?: 1 | 2 | 3
  source: string
  sourceContext: {
    source: string
    [key: string]: any
  }
  extractedFrom: string
  tags?: string[]
}

export class BaseIngestionService {
  async createTask(task: IngestedTask) {
    // Find or create project
    let project = await prisma.project.findFirst({
      where: {
        name: {
          equals: task.projectName || 'Personal',
          mode: 'insensitive'
        }
      }
    })

    if (!project) {
      project = await prisma.project.findFirst({
        where: { name: 'Personal' }
      })
    }

    if (!project) throw new Error('No project found')

    // Check for duplicate (similar title in last 7 days)
    const recentTasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        status: { in: ['open', 'doing', 'blocked'] }
      }
    })

    // Simple duplicate check (exact title match)
    const duplicate = recentTasks.find(t =>
      t.title.toLowerCase().trim() === task.title.toLowerCase().trim()
    )

    if (duplicate) {
      // Instead of creating, increment mention count
      await prisma.task.update({
        where: { id: duplicate.id },
        data: {
          mentionCount: { increment: 1 },
          lastMentioned: new Date()
        }
      })

      // Log the mention
      await prisma.taskHistory.create({
        data: {
          taskId: duplicate.id,
          action: 'mentioned',
          changes: JSON.stringify({
            mentionCount: { before: duplicate.mentionCount, after: duplicate.mentionCount + 1 }
          }),
          source: task.source,
          context: JSON.stringify(task.sourceContext)
        }
      })

      // Update ingestion source stats
      await this.updateSourceStats(task.source, false)

      return { created: false, task: duplicate, reason: 'duplicate' }
    }

    // Create new task
    const created = await prisma.task.create({
      data: {
        title: task.title,
        notes: task.notes || '',
        projectId: project.id,
        priority: task.priority || 2,
        status: 'open',
        source: 'api',
        tags: task.tags?.join(',') || '',
        energy: 2,
        sourceContext: JSON.stringify(task.sourceContext),
        extractedFrom: task.extractedFrom,
        mentionCount: 1,
        lastMentioned: new Date()
      }
    })

    // Create history entry
    await prisma.taskHistory.create({
      data: {
        taskId: created.id,
        action: 'created',
        changes: JSON.stringify({ task: created }),
        source: task.source,
        context: JSON.stringify(task.sourceContext)
      }
    })

    // Update ingestion source stats
    await this.updateSourceStats(task.source, true)

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actor: task.source,
        action: 'task.ingested',
        payload: JSON.stringify({
          taskId: created.id,
          title: created.title,
          source: task.source
        }),
        status: 'success'
      }
    })

    return { created: true, task: created }
  }

  private async updateSourceStats(sourceName: string, created: boolean) {
    await prisma.ingestionSource.update({
      where: { name: sourceName },
      data: {
        lastSync: new Date(),
        lastSuccess: created ? new Date() : undefined,
        tasksCreated: created ? { increment: 1 } : undefined
      }
    })
  }
}
```

### 3. Create Claude Code File Watcher

`/src/services/ingestion/claude-files.ts`:

```typescript
import chokidar from 'chokidar'
import { readFile } from 'fs/promises'
import { BaseIngestionService, IngestedTask } from './base-ingestion'

export class ClaudeFilesIngestion extends BaseIngestionService {
  private watcher: chokidar.FSWatcher | null = null

  async start() {
    const paths = [
      '/Users/seth/solienne.ai/**/*.md',
      '/Users/seth/eden-dev/**/*.md',
      '/Users/seth/seth-command-center/**/*.md',
      '/Users/seth/pariseye/**/*.md'
    ]

    this.watcher = chokidar.watch(paths, {
      ignored: /(node_modules|\.git|dist|build)/,
      persistent: true,
      ignoreInitial: false  // Process existing files on start
    })

    this.watcher.on('add', async (filePath) => {
      await this.processFile(filePath)
    })

    this.watcher.on('change', async (filePath) => {
      await this.processFile(filePath)
    })

    console.log('✅ Claude Code file watcher started')
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
      console.log('🛑 Claude Code file watcher stopped')
    }
  }

  private async processFile(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8')

      // Extract TODOs
      const todos = this.extractTodos(content, filePath)

      for (const todo of todos) {
        await this.createTask(todo)
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
    }
  }

  private extractTodos(content: string, filePath: string): IngestedTask[] {
    const todos: IngestedTask[] = []

    // Patterns to detect
    const patterns = [
      /TODO:\s*(.+)/gi,
      /ACTION:\s*(.+)/gi,
      /FOLLOW[- ]UP:\s*(.+)/gi,
      /- \[ \]\s*(.+)/gi,  // Markdown checkboxes
      /\*\*TODO\*\*:\s*(.+)/gi
    ]

    // Infer project from path
    const projectName = this.inferProject(filePath)

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const title = match[1].trim()

        // Skip very short or very long (probably not a task)
        if (title.length < 5 || title.length > 200) continue

        // Get surrounding context (100 chars before and after)
        const startPos = Math.max(0, match.index - 100)
        const endPos = Math.min(content.length, match.index + match[0].length + 100)
        const context = content.slice(startPos, endPos)

        todos.push({
          title,
          notes: `Extracted from: ${filePath}`,
          projectName,
          priority: this.inferPriority(title),
          source: 'claude-code',
          sourceContext: {
            source: 'claude-code',
            filePath,
            detectedAt: new Date().toISOString(),
            pattern: pattern.source
          },
          extractedFrom: context,
          tags: ['claude-code']
        })
      }
    }

    return todos
  }

  private inferProject(filePath: string): string {
    if (filePath.includes('solienne')) return 'Solienne'
    if (filePath.includes('eden-dev')) return 'Eden'
    if (filePath.includes('command-center')) return 'Command Center'
    if (filePath.includes('pariseye')) return 'ParisEye'
    if (filePath.includes('miyomi')) return 'MIYOMI'
    return 'Personal'
  }

  private inferPriority(title: string): 1 | 2 | 3 {
    const lower = title.toLowerCase()
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) {
      return 1
    }
    if (lower.includes('nice to have') || lower.includes('eventually')) {
      return 3
    }
    return 2
  }
}
```

### 4. Create Granola Watcher

`/src/services/ingestion/granola.ts`:

```typescript
import chokidar from 'chokidar'
import { readFile } from 'fs/promises'
import { BaseIngestionService, IngestedTask } from './base-ingestion'

export class GranolaIngestion extends BaseIngestionService {
  private watcher: chokidar.FSWatcher | null = null

  async start() {
    this.watcher = chokidar.watch('/Users/seth/Documents/Granola/**/*.md', {
      persistent: true,
      ignoreInitial: false
    })

    this.watcher.on('add', async (filePath) => {
      await this.processMeeting(filePath)
    })

    console.log('✅ Granola meeting notes watcher started')
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
    }
  }

  private async processMeeting(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8')

      // Extract meeting metadata
      const meetingTitle = this.extractMeetingTitle(content)
      const meetingDate = this.extractMeetingDate(content, filePath)

      // Extract action items
      const actionItems = this.extractActionItems(content)

      for (const item of actionItems) {
        await this.createTask({
          ...item,
          source: 'granola',
          sourceContext: {
            source: 'granola',
            meetingTitle,
            meetingDate,
            filePath,
            processedAt: new Date().toISOString()
          },
          tags: ['granola', 'meeting']
        })
      }
    } catch (error) {
      console.error(`Error processing meeting ${filePath}:`, error)
    }
  }

  private extractMeetingTitle(content: string): string {
    // Granola usually puts meeting title as first # heading
    const match = content.match(/^#\s+(.+)/m)
    return match ? match[1].trim() : 'Untitled Meeting'
  }

  private extractMeetingDate(content: string, filePath: string): string {
    // Try to find date in content first
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/)
    if (dateMatch) return dateMatch[0]

    // Fallback to filename
    const filenameDate = filePath.match(/\d{4}-\d{2}-\d{2}/)
    if (filenameDate) return filenameDate[0]

    return new Date().toISOString().split('T')[0]
  }

  private extractActionItems(content: string): Partial<IngestedTask>[] {
    const items: Partial<IngestedTask>[] = []

    // Granola formats action items as:
    // - [ ] Action item
    // Action Items:
    // - Item

    // Pattern 1: Markdown checkboxes
    const checkboxPattern = /- \[ \]\s*(.+)/gi
    let match
    while ((match = checkboxPattern.exec(content)) !== null) {
      const title = match[1].trim()
      if (title.length > 5) {
        items.push({
          title,
          priority: 2,
          extractedFrom: match[0]
        })
      }
    }

    // Pattern 2: Action Items section
    const actionSection = content.match(/(?:Action Items?|Follow[- ]?Ups?):?\s*\n((?:- .+\n?)+)/i)
    if (actionSection) {
      const actionLines = actionSection[1].match(/- (.+)/gi)
      if (actionLines) {
        for (const line of actionLines) {
          const title = line.replace(/^- /, '').trim()
          if (title.length > 5 && !items.some(i => i.title === title)) {
            items.push({
              title,
              priority: 2,
              extractedFrom: line
            })
          }
        }
      }
    }

    return items
  }
}
```

---

## Day 3: API Endpoints

### 1. Ingestion API

`/src/app/api/ingest/claude-files/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { ClaudeFilesIngestion } from '@/services/ingestion/claude-files'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    const ingestion = new ClaudeFilesIngestion()

    if (action === 'start') {
      await ingestion.start()
      return NextResponse.json({
        success: true,
        message: 'Claude Code file watcher started'
      })
    }

    if (action === 'stop') {
      await ingestion.stop()
      return NextResponse.json({
        success: true,
        message: 'Claude Code file watcher stopped'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "start" or "stop"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Claude files ingestion error:', error)
    return NextResponse.json(
      { success: false, error: 'Ingestion failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Status endpoint
  const { prisma } = await import('@/lib/db')

  const source = await prisma.ingestionSource.findUnique({
    where: { name: 'claude-code' }
  })

  return NextResponse.json({
    success: true,
    data: source
  })
}
```

### 2. Limitless Integration

`/src/app/api/ingest/limitless/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BaseIngestionService } from '@/services/ingestion/base-ingestion'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { transcript, conversationId, participants, timestamp } = await request.json()

    // Use Claude to extract TODOs from transcript
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Extract all action items, commitments, and TODOs from this transcript:

${transcript}

Return as JSON array with this format:
[
  {
    "title": "Clear, actionable task title",
    "context": "Why this matters (1 sentence)",
    "priority": "high" | "medium" | "low",
    "project": "MIYOMI" | "SOLENNE" | "Eden" | "Personal" (infer from context),
    "deadline": "YYYY-MM-DD" or null
  }
]

Only include real commitments and action items. Ignore casual mentions.`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({
        success: true,
        extracted: 0,
        message: 'No action items found'
      })
    }

    const extracted = JSON.parse(jsonMatch[0])

    // Create tasks
    const ingestion = new BaseIngestionService()
    const results = []

    for (const item of extracted) {
      const result = await ingestion.createTask({
        title: item.title,
        notes: item.context,
        projectName: item.project,
        priority: item.priority === 'high' ? 1 : item.priority === 'low' ? 3 : 2,
        source: 'limitless',
        sourceContext: {
          source: 'limitless',
          conversationId,
          participants,
          timestamp
        },
        extractedFrom: transcript.slice(0, 500),
        tags: ['limitless', 'conversation']
      })
      results.push(result)
    }

    // Update ingestion source
    await prisma.ingestionSource.update({
      where: { name: 'limitless' },
      data: {
        lastSync: new Date(),
        lastSuccess: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      extracted: results.length,
      created: results.filter(r => r.created).length,
      duplicates: results.filter(r => !r.created).length,
      tasks: results
    })
  } catch (error) {
    console.error('Limitless ingestion error:', error)
    return NextResponse.json(
      { success: false, error: 'Ingestion failed' },
      { status: 500 }
    )
  }
}
```

---

## Day 4-5: Synthesis Engine

`/src/services/synthesis/deduplication.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function runSynthesis() {
  // Get recent tasks (last 48 hours)
  const recentTasks = await prisma.task.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      status: { in: ['open', 'doing', 'blocked'] }
    },
    include: {
      project: true
    }
  })

  if (recentTasks.length === 0) return

  // Use Claude to analyze relationships
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Analyze these tasks and identify:
1. Duplicates (same intent, different wording)
2. Related tasks (same project/theme)
3. Blocking relationships
4. Tasks that should be grouped

Tasks:
${JSON.stringify(recentTasks.map(t => ({
  id: t.id,
  title: t.title,
  project: t.project.name,
  source: t.source,
  extractedFrom: t.extractedFrom?.slice(0, 200)
})), null, 2)}

Return as JSON:
{
  "relationships": [
    {
      "taskId": "task1_id",
      "relatedTo": "task2_id",
      "type": "duplicate" | "related" | "blocks" | "blocked_by" | "supersedes",
      "confidence": 0.0-1.0,
      "reason": "Brief explanation"
    }
  ]
}`
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') return

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return

  const analysis = JSON.parse(jsonMatch[0])

  // Create synthesis records
  for (const rel of analysis.relationships) {
    // Only create if confidence is high enough
    if (rel.confidence < 0.7) continue

    await prisma.taskSynthesis.create({
      data: {
        taskId: rel.taskId,
        relatedTaskId: rel.relatedTo,
        relationship: rel.type,
        confidence: rel.confidence,
        reason: rel.reason
      }
    })

    // If duplicate, increment mention count
    if (rel.type === 'duplicate') {
      await prisma.task.update({
        where: { id: rel.taskId },
        data: {
          mentionCount: { increment: 1 },
          lastMentioned: new Date()
        }
      })
    }
  }

  // Log synthesis run
  await prisma.auditLog.create({
    data: {
      actor: 'synthesis-engine',
      action: 'synthesis.completed',
      payload: JSON.stringify({
        tasksAnalyzed: recentTasks.length,
        relationshipsFound: analysis.relationships.length
      }),
      status: 'success'
    }
  })
}
```

---

## Testing

### Manual Test Script

`/scripts/test-ingestion.ts`:

```typescript
import { ClaudeFilesIngestion } from '../src/services/ingestion/claude-files'
import { GranolaIngestion } from '../src/services/ingestion/granola'

async function test() {
  console.log('🧪 Testing ingestion services...\n')

  // Test Claude Code watcher
  console.log('1. Testing Claude Code file watcher...')
  const claudeIngestion = new ClaudeFilesIngestion()
  await claudeIngestion.start()

  console.log('   Watching for .md files...')
  console.log('   Create a file with "TODO: Test task" to verify\n')

  // Wait 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000))
  await claudeIngestion.stop()

  // Test Granola
  console.log('2. Testing Granola watcher...')
  const granolaIngestion = new GranolaIngestion()
  await granolaIngestion.start()

  console.log('   Watching Granola directory...')
  await new Promise(resolve => setTimeout(resolve, 5000))
  await granolaIngestion.stop()

  console.log('\n✅ Test complete')
}

test().catch(console.error)
```

Run: `npx tsx scripts/test-ingestion.ts`

---

## Deployment

### Environment Variables

Add to `.env.local`:

```bash
ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_CODE_WATCH_PATHS="/Users/seth/solienne.ai,/Users/seth/eden-dev"
GRANOLA_PATH="/Users/seth/Documents/Granola"
LIMITLESS_API_KEY="..."  # If using Limitless API
```

### Start Watchers in Production

Create `/scripts/start-watchers.ts`:

```typescript
import { ClaudeFilesIngestion } from '../src/services/ingestion/claude-files'
import { GranolaIngestion } from '../src/services/ingestion/granola'

async function startAll() {
  console.log('🚀 Starting all ingestion watchers...\n')

  const claudeIngestion = new ClaudeFilesIngestion()
  await claudeIngestion.start()

  const granolaIngestion = new GranolaIngestion()
  await granolaIngestion.start()

  console.log('✅ All watchers running')
  console.log('Press Ctrl+C to stop')

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping watchers...')
    await claudeIngestion.stop()
    await granolaIngestion.stop()
    process.exit(0)
  })
}

startAll().catch(console.error)
```

### Add to package.json

```json
{
  "scripts": {
    "watch": "tsx scripts/start-watchers.ts",
    "synthesis": "tsx scripts/run-synthesis.ts"
  }
}
```

---

## Next Steps After MVP

1. **Enhance export API** with synthesis data
2. **Add @seth agent endpoints**
3. **Build UI enhancements** (show sources, context)
4. **Deploy watchers as systemd service** (or PM2)
5. **Schedule synthesis** every 30 minutes

---

*Ready to start Day 1? Let me know if you need any clarifications!*
