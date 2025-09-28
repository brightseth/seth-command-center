import { prisma } from '@/lib/db'
import { auditService } from './audit'
import { z } from 'zod'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

// Zod schemas for validation
export const ManifestResponseSchema = z.object({
  total: z.number(),
  byMonth: z.record(z.string(), z.number()),
  latestId: z.string().nullable(),
  lastUpdated: z.string(),
})

export type ManifestResponse = z.infer<typeof ManifestResponseSchema>

export const ProjectParamsSchema = z.object({
  project: z.string().min(1),
})

/**
 * Manifest Service - Single source of truth for project metrics
 *
 * This is the core of the manifest-first architecture.
 * All UIs pull from this service, never from raw sources.
 */
export class ManifestService {
  /**
   * Get comprehensive project manifest
   * Returns deterministic totals even with source pagination issues
   */
  async getProjectManifest(projectName: string): Promise<ManifestResponse> {
    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { name: projectName }
    })

    if (!project) {
      throw new Error(`Project '${projectName}' not found`)
    }

    // Log manifest operation
    await auditService.logManifestOperation(projectName, 'get')

    // Get total work count
    const totalWorks = await prisma.work.count({
      where: { projectId: project.id }
    })

    // Get works by month for the last 12 months
    const monthsAgo12 = subMonths(new Date(), 12)
    const works = await prisma.work.findMany({
      where: {
        projectId: project.id,
        createdAt: {
          gte: monthsAgo12
        }
      },
      select: {
        createdAt: true,
        workId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Build by-month histogram
    const byMonth: Record<string, number> = {}

    // Initialize last 12 months with 0
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, 'yyyy-MM')
      byMonth[monthKey] = 0
    }

    // Count works by month
    works.forEach(work => {
      const monthKey = format(work.createdAt, 'yyyy-MM')
      if (byMonth[monthKey] !== undefined) {
        byMonth[monthKey]++
      }
    })

    // Get latest work ID
    const latestWork = await prisma.work.findFirst({
      where: { projectId: project.id },
      select: { workId: true },
      orderBy: { createdAt: 'desc' }
    })

    return {
      total: totalWorks,
      byMonth,
      latestId: latestWork?.workId || null,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Recompute manifest after backfill
   * This is called by the backfill job to ensure consistency
   */
  async recomputeManifest(projectName: string): Promise<{ success: boolean; newTotal: number }> {
    const project = await prisma.project.findUnique({
      where: { name: projectName }
    })

    if (!project) {
      throw new Error(`Project '${projectName}' not found`)
    }

    // Log recompute operation
    await auditService.logManifestOperation(projectName, 'recompute')

    // Count works again (this should match external sources after backfill)
    const newTotal = await prisma.work.count({
      where: { projectId: project.id }
    })

    // Update project metadata if needed (could store last manifest time, etc.)
    await prisma.project.update({
      where: { id: project.id },
      data: { updatedAt: new Date() }
    })

    return {
      success: true,
      newTotal
    }
  }

  /**
   * Get all projects with their manifest summaries
   */
  async getAllProjectManifests(): Promise<Record<string, Pick<ManifestResponse, 'total' | 'latestId'>>> {
    const projects = await prisma.project.findMany({
      select: { name: true, id: true }
    })

    const manifests: Record<string, Pick<ManifestResponse, 'total' | 'latestId'>> = {}

    for (const project of projects) {
      const total = await prisma.work.count({
        where: { projectId: project.id }
      })

      const latest = await prisma.work.findFirst({
        where: { projectId: project.id },
        select: { workId: true },
        orderBy: { createdAt: 'desc' }
      })

      manifests[project.name] = {
        total,
        latestId: latest?.workId || null
      }
    }

    return manifests
  }
}