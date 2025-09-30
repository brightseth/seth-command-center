import { prisma } from '@/lib/db'
import { auditService } from './audit'
import { githubService } from './github'
import { aiSessionService } from './aiSessions'
import { z } from 'zod'

// Job schemas
export const JobCreateSchema = z.object({
  type: z.string(),
  payload: z.record(z.any()),
  runAt: z.date().optional(),
  maxRetries: z.number().optional(),
})

export const JobResponseSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
  status: z.string(),
  attempts: z.number(),
  maxRetries: z.number(),
  runAt: z.string(),
  createdAt: z.string(),
  error: z.string().nullable(),
})

export type JobCreate = z.infer<typeof JobCreateSchema>
export type JobResponse = z.infer<typeof JobResponseSchema>

/**
 * Job Queue Service
 *
 * Redis-ready design with in-memory execution for now.
 * API interface matches future Redis worker implementation.
 */
export class JobQueueService {
  private readonly runningJobs = new Map<string, Promise<void>>()

  /**
   * Enqueue a new job
   */
  async enqueue(jobData: JobCreate): Promise<JobResponse> {
    const job = await prisma.job.create({
      data: {
        type: jobData.type,
        payload: JSON.stringify(jobData.payload),
        runAt: jobData.runAt || new Date(),
        maxRetries: jobData.maxRetries || 3,
        status: 'pending',
      }
    })

    const response: JobResponse = {
      id: job.id,
      type: job.type,
      payload: JSON.parse(job.payload),
      status: job.status,
      attempts: job.attempts,
      maxRetries: job.maxRetries,
      runAt: job.runAt.toISOString(),
      createdAt: job.createdAt.toISOString(),
      error: job.error,
    }

    // Auto-execute immediately if runAt is now or in the past
    if (job.runAt <= new Date()) {
      this.processJob(job.id).catch(console.error)
    }

    await auditService.log({
      actor: 'job-queue',
      action: 'job.enqueued',
      payload: { jobId: job.id, type: job.type },
      status: 'success',
    })

    return response
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<JobResponse | null> {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) return null

    return {
      id: job.id,
      type: job.type,
      payload: JSON.parse(job.payload),
      status: job.status,
      attempts: job.attempts,
      maxRetries: job.maxRetries,
      runAt: job.runAt.toISOString(),
      createdAt: job.createdAt.toISOString(),
      error: job.error,
    }
  }

  /**
   * Process a job (Redis-ready interface)
   */
  async processJob(jobId: string): Promise<void> {
    // Prevent duplicate processing
    if (this.runningJobs.has(jobId)) {
      return this.runningJobs.get(jobId)!
    }

    const jobPromise = this.executeJob(jobId)
    this.runningJobs.set(jobId, jobPromise)

    try {
      await jobPromise
    } finally {
      this.runningJobs.delete(jobId)
    }
  }

  /**
   * Execute job logic
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job || job.status !== 'pending') return

    try {
      // Mark job as running
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'running',
          startedAt: new Date(),
          attempts: { increment: 1 }
        }
      })

      await auditService.log({
        actor: 'job-queue',
        action: 'job.started',
        payload: { jobId, type: job.type },
        status: 'success',
      })

      // Execute job based on type
      const payload = JSON.parse(job.payload)
      await this.executeJobType(job.type, payload)

      // Mark job as completed
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        }
      })

      await auditService.log({
        actor: 'job-queue',
        action: 'job.completed',
        payload: { jobId, type: job.type },
        status: 'success',
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Check if we should retry
      const shouldRetry = job.attempts < job.maxRetries

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: shouldRetry ? 'pending' : 'failed',
          error: errorMessage,
          // Retry with exponential backoff
          runAt: shouldRetry ? new Date(Date.now() + Math.pow(2, job.attempts) * 1000) : undefined
        }
      })

      await auditService.log({
        actor: 'job-queue',
        action: shouldRetry ? 'job.retry' : 'job.failed',
        payload: { jobId, type: job.type, attempts: job.attempts + 1 },
        status: 'failure',
        error: errorMessage,
      })

      if (shouldRetry) {
        // Schedule retry
        setTimeout(() => {
          this.processJob(jobId).catch(console.error)
        }, Math.pow(2, job.attempts) * 1000)
      }
    }
  }

  /**
   * Job type execution logic
   */
  private async executeJobType(type: string, payload: any): Promise<void> {
    switch (type) {
      case 'ritual.run':
        await this.executeRitualRun(payload)
        break

      case 'backfill':
        await this.executeBackfill(payload)
        break

      case 'manifest.recompute':
        await this.executeManifestRecompute(payload)
        break

      case 'github.sync':
        await this.executeGitHubSync(payload)
        break

      case 'ai-sessions.sync':
        await this.executeAISessionSync(payload)
        break

      default:
        throw new Error(`Unknown job type: ${type}`)
    }
  }

  /**
   * Execute ritual run job
   */
  private async executeRitualRun(payload: { ritualId: string }): Promise<void> {
    const ritual = await prisma.ritual.findUnique({
      where: { id: payload.ritualId },
      include: { project: true }
    })

    if (!ritual) {
      throw new Error(`Ritual not found: ${payload.ritualId}`)
    }

    if (!ritual.enabled) {
      throw new Error(`Ritual disabled: ${ritual.name}`)
    }

    // Simulate ritual execution based on type
    const executionTime = Math.random() * 3000 + 1000 // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime))

    // Update ritual streak and last run
    await prisma.ritual.update({
      where: { id: payload.ritualId },
      data: {
        lastRun: new Date(),
        streak: { increment: 1 }
      }
    })

    // Log ritual completion
    await auditService.logRitualRun(ritual.name, true, {
      executionTime: Math.round(executionTime),
      project: ritual.project.name
    })
  }

  /**
   * Execute backfill job
   */
  private async executeBackfill(payload: { project: string; fromDate: string; toDate: string }): Promise<void> {
    // Simulate backfill process
    const fromDate = new Date(payload.fromDate)
    const toDate = new Date(payload.toDate)
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

    // Simulate processing each day
    for (let i = 0; i < Math.min(daysDiff, 10); i++) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate work
    }

    await auditService.logManifestOperation('backfill', payload.project, {
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      daysProcessed: Math.min(daysDiff, 10)
    })
  }

  /**
   * Execute manifest recomputation
   */
  private async executeManifestRecompute(payload: { project: string }): Promise<void> {
    // Simulate recomputation
    await new Promise(resolve => setTimeout(resolve, 2000))

    await auditService.logManifestOperation('recompute', payload.project, {
      trigger: 'job-queue'
    })
  }

  /**
   * Execute GitHub sync job
   */
  private async executeGitHubSync(payload: { username?: string }): Promise<void> {
    const { success, stats } = await githubService.syncToDatabase()

    if (!success) {
      throw new Error('GitHub sync failed')
    }

    // Update KPIs with real GitHub data
    const now = new Date().toISOString()

    // Find or create Seth project
    const sethProject = await prisma.project.upsert({
      where: { name: 'seth' },
      create: {
        name: 'seth',
        description: 'Personal development and coding metrics'
      },
      update: {}
    })

    const kpiUpdates = [
      {
        key: 'github.commits.today',
        value: stats.todayCommits,
        at: now
      },
      {
        key: 'github.commits.week',
        value: stats.thisWeekCommits,
        at: now
      },
      {
        key: 'github.repos.active',
        value: stats.activeRepos,
        at: now
      }
    ]

    // Update/create KPIs
    for (const kpi of kpiUpdates) {
      await prisma.kPI.upsert({
        where: {
          projectId_key: {
            projectId: sethProject.id,
            key: kpi.key
          }
        },
        create: {
          projectId: sethProject.id,
          key: kpi.key,
          value: kpi.value,
          at: kpi.at
        },
        update: {
          value: kpi.value,
          at: kpi.at
        }
      })
    }

    await auditService.log({
      actor: 'github-sync',
      action: 'github.sync.completed',
      payload: {
        stats,
        kpisUpdated: kpiUpdates.length
      },
      status: 'success',
    })
  }

  /**
   * Execute AI session sync job
   */
  private async executeAISessionSync(payload: { sources?: string[] }): Promise<void> {
    const result = await aiSessionService.syncAISessions()

    if (!result.success) {
      throw new Error('AI session sync failed')
    }

    await auditService.log({
      actor: 'ai-session-sync',
      action: 'ai-sessions.sync.completed',
      payload: {
        processed: result.processed,
        itemsCreated: result.itemsCreated,
        sources: payload.sources || ['mock']
      },
      status: 'success',
    })
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number
    running: number
    completed: number
    failed: number
    totalJobs: number
  }> {
    const stats = await prisma.job.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const statMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      pending: statMap.pending || 0,
      running: statMap.running || 0,
      completed: statMap.completed || 0,
      failed: statMap.failed || 0,
      totalJobs: Object.values(statMap).reduce((sum, count) => sum + count, 0)
    }
  }

  /**
   * Clean up old completed jobs
   */
  async cleanup(olderThanDays: number = 7): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const result = await prisma.job.deleteMany({
      where: {
        status: 'completed',
        completedAt: {
          lt: cutoff
        }
      }
    })

    return result.count
  }
}

// Export singleton instance
export const jobQueueService = new JobQueueService()