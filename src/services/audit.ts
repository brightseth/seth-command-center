import { prisma } from '@/lib/db'
import { z } from 'zod'

// Zod schemas
export const AuditLogCreateSchema = z.object({
  actor: z.string(),
  action: z.string(),
  payload: z.record(z.any()),
  status: z.enum(['success', 'failure', 'pending']).default('success'),
  error: z.string().optional(),
})

export const AuditLogResponseSchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  payload: z.record(z.any()),
  status: z.string(),
  error: z.string().nullable(),
  createdAt: z.string(),
})

export type AuditLogCreate = z.infer<typeof AuditLogCreateSchema>
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>

/**
 * Audit Service - Comprehensive logging for all mutations
 *
 * Every job, ritual run, and system action writes an audit log.
 * This provides transparency and debugging capability.
 */
export class AuditService {
  /**
   * Create an audit log entry
   */
  async log(data: AuditLogCreate): Promise<AuditLogResponse> {
    const auditLog = await prisma.auditLog.create({
      data: {
        actor: data.actor,
        action: data.action,
        payload: JSON.stringify(data.payload),
        status: data.status,
        error: data.error || null,
      }
    })

    return {
      id: auditLog.id,
      actor: auditLog.actor,
      action: auditLog.action,
      payload: JSON.parse(auditLog.payload),
      status: auditLog.status,
      error: auditLog.error,
      createdAt: auditLog.createdAt.toISOString(),
    }
  }

  /**
   * Get recent audit logs with pagination
   */
  async getRecentLogs(limit: number = 20, offset: number = 0): Promise<AuditLogResponse[]> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return logs.map(log => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      payload: JSON.parse(log.payload),
      status: log.status,
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }))
  }

  /**
   * Get logs filtered by action
   */
  async getLogsByAction(action: string, limit: number = 20): Promise<AuditLogResponse[]> {
    const logs = await prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return logs.map(log => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      payload: JSON.parse(log.payload),
      status: log.status,
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }))
  }

  /**
   * Get logs filtered by status
   */
  async getLogsByStatus(status: string, limit: number = 20): Promise<AuditLogResponse[]> {
    const logs = await prisma.auditLog.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return logs.map(log => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      payload: JSON.parse(log.payload),
      status: log.status,
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }))
  }

  /**
   * Helper function for ritual runs
   */
  async logRitualRun(ritualName: string, success: boolean, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      actor: 'system',
      action: 'ritual.run',
      payload: {
        ritualName,
        success,
        ...metadata
      },
      status: success ? 'success' : 'failure',
    })
  }

  /**
   * Helper function for manifest operations
   */
  async logManifestOperation(operation: string, projectName: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      actor: 'system',
      action: `manifest.${operation}`,
      payload: {
        projectName,
        ...metadata
      },
      status: 'success',
    })
  }

  /**
   * Helper function for eden-bridge events
   */
  async logBridgeEvent(event: Record<string, any>, success: boolean): Promise<void> {
    await this.log({
      actor: 'eden-bridge',
      action: 'bridge.ingest',
      payload: event,
      status: success ? 'success' : 'failure',
    })
  }
}

// Export singleton instance
export const auditService = new AuditService()