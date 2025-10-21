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
        where: { name: { contains: 'seth', mode: 'insensitive' } }
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
    try {
      await prisma.ingestionSource.update({
        where: { name: sourceName },
        data: {
          lastSync: new Date(),
          lastSuccess: created ? new Date() : undefined,
          tasksCreated: created ? { increment: 1 } : undefined
        }
      })
    } catch (error) {
      // Source doesn't exist yet, create it
      await prisma.ingestionSource.create({
        data: {
          name: sourceName,
          type: 'file-watcher',
          enabled: true,
          config: JSON.stringify({}),
          lastSync: new Date(),
          lastSuccess: created ? new Date() : undefined,
          tasksCreated: created ? 1 : 0
        }
      })
    }
  }
}
