import { prisma } from '@/lib/db'
import { auditService } from './audit'
import { z } from 'zod'

// Eden Bridge Event Schema
export const EdenEventSchema = z.object({
  agent: z.string(),
  type: z.enum(['launch', 'sale', 'post', 'generation', 'milestone']),
  ts: z.string().datetime(),
  meta: z.record(z.any()),
})

export type EdenEvent = z.infer<typeof EdenEventSchema>

// Configuration-driven mapping rules (no schema changes needed for new agents)
const BRIDGE_CONFIG = {
  mappings: {
    // Sales events → KPI updates
    'sale': {
      kpi: (event: EdenEvent) => ({
        key: `${event.agent}.royalties.daily`,
        value: event.meta.amount || 0,
        at: new Date(event.ts),
        source: 'eden-bridge',
      }),
    },

    // Launch events → Tasks
    'launch': {
      task: (event: EdenEvent) => ({
        title: `Post-launch comms for ${event.agent}`,
        priority: 1,
        status: 'open',
        tags: `eden,launch,${event.agent}`,
        projectId: 'eden', // Will be resolved to project ID
      }),
    },

    // Generation events → Works
    'generation': {
      work: (event: EdenEvent) => ({
        workId: event.meta.workId || `${event.agent}_${Date.now()}`,
        projectId: 'eden', // Will be resolved
        createdAt: new Date(event.ts),
        contentHash: event.meta.contentHash || `hash_${Date.now()}`,
        source: 'eden_api_v2',
        metadata: JSON.stringify({
          agent: event.agent,
          type: event.type,
          ...event.meta
        }),
      }),
    },

    // Post events → KPI tracking
    'post': {
      kpi: (event: EdenEvent) => ({
        key: `${event.agent}.posts.daily`,
        value: 1,
        at: new Date(event.ts),
        source: 'eden-bridge',
      }),
    },

    // Milestone events → Multiple updates
    'milestone': {
      kpi: (event: EdenEvent) => ({
        key: `${event.agent}.milestones`,
        value: event.meta.milestone || 1,
        at: new Date(event.ts),
        source: 'eden-bridge',
      }),
      task: (event: EdenEvent) => ({
        title: `Celebrate ${event.agent} milestone: ${event.meta.description}`,
        priority: 2,
        status: 'open',
        tags: `eden,milestone,${event.agent}`,
        projectId: 'eden',
      }),
    },
  }
}

/**
 * Eden Bridge Service
 *
 * Config-driven adapter that maps Eden ecosystem events to Seth Command Center data.
 * No schema changes needed for new agents - just config updates.
 */
export class EdenBridgeService {
  /**
   * Process incoming Eden event
   */
  async ingestEvent(event: EdenEvent): Promise<{ success: boolean; processed: string[] }> {
    const processed: string[] = []

    try {
      // Validate event
      const validatedEvent = EdenEventSchema.parse(event)

      // Get mapping config for this event type
      const mappingConfig = BRIDGE_CONFIG.mappings[validatedEvent.type]
      if (!mappingConfig) {
        throw new Error(`No mapping config for event type: ${validatedEvent.type}`)
      }

      // Resolve project ID if needed
      const resolvedEvent = await this.resolveProjectReferences(validatedEvent)

      // Process each mapping
      for (const [targetType, mapperFn] of Object.entries(mappingConfig)) {
        try {
          const mappedData = mapperFn(resolvedEvent)

          switch (targetType) {
            case 'kpi':
              await this.createKPI(mappedData)
              processed.push(`kpi:${mappedData.key}`)
              break

            case 'task':
              await this.createTask(mappedData)
              processed.push(`task:${mappedData.title}`)
              break

            case 'work':
              await this.createWork(mappedData)
              processed.push(`work:${mappedData.workId}`)
              break
          }
        } catch (error) {
          console.error(`Failed to process ${targetType} mapping:`, error)
          // Continue processing other mappings
        }
      }

      // Log successful ingestion
      await auditService.logBridgeEvent(validatedEvent, true)

      return { success: true, processed }

    } catch (error) {
      console.error('Eden bridge ingestion error:', error)
      await auditService.logBridgeEvent(event, false)
      throw error
    }
  }

  /**
   * Resolve project names to IDs
   */
  private async resolveProjectReferences(event: EdenEvent): Promise<EdenEvent> {
    // For now, using hardcoded mapping. Could extend to database lookup.
    const projectMap: Record<string, string> = {}

    // Get project IDs
    const projects = await prisma.project.findMany({
      select: { id: true, name: true }
    })

    projects.forEach(p => {
      projectMap[p.name] = p.id
    })

    // Clone event and resolve project references
    const resolved = { ...event }
    if (resolved.meta.projectId && typeof resolved.meta.projectId === 'string') {
      const projectId = projectMap[resolved.meta.projectId]
      if (projectId) {
        resolved.meta.projectId = projectId
      }
    }

    return resolved
  }

  /**
   * Create KPI entry
   */
  private async createKPI(data: any) {
    // Get or resolve project ID
    let projectId = data.projectId
    if (!projectId) {
      const edenProject = await prisma.project.findUnique({
        where: { name: 'eden' }
      })
      projectId = edenProject?.id
    }

    await prisma.kPI.create({
      data: {
        ...data,
        projectId,
      }
    })
  }

  /**
   * Create Task entry
   */
  private async createTask(data: any) {
    // Resolve project ID
    let projectId = data.projectId
    if (typeof projectId === 'string') {
      const project = await prisma.project.findUnique({
        where: { name: projectId }
      })
      projectId = project?.id
    }

    await prisma.task.create({
      data: {
        ...data,
        projectId,
      }
    })
  }

  /**
   * Create Work entry
   */
  private async createWork(data: any) {
    // Resolve project ID
    let projectId = data.projectId
    if (typeof projectId === 'string') {
      const project = await prisma.project.findUnique({
        where: { name: projectId }
      })
      projectId = project?.id
    }

    await prisma.work.create({
      data: {
        ...data,
        projectId,
      }
    })
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats(): Promise<{
    totalEvents: number
    successRate: number
    recentEvents: Array<{ action: string; status: string; createdAt: string }>
  }> {
    // Get bridge-related audit logs
    const bridgeLogs = await auditService.getLogsByAction('bridge.ingest', 50)

    const totalEvents = bridgeLogs.length
    const successful = bridgeLogs.filter(log => log.status === 'success').length
    const successRate = totalEvents > 0 ? (successful / totalEvents) * 100 : 0

    return {
      totalEvents,
      successRate,
      recentEvents: bridgeLogs.slice(0, 10).map(log => ({
        action: log.action,
        status: log.status,
        createdAt: log.createdAt,
      }))
    }
  }
}

// Export singleton instance
export const edenBridgeService = new EdenBridgeService()