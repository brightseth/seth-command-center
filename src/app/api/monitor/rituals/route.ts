import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/monitor/rituals
 * Returns ritual execution history and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const projectId = searchParams.get('projectId')

    // Get all rituals with execution history from audit logs
    const where = projectId ? { projectId } : {}

    const rituals = await prisma.ritual.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Get recent ritual executions from audit logs
    const recentExecutions = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['job.completed', 'ritual.run']
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Get ritual execution stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const executionStats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        action: {
          in: ['job.completed', 'ritual.run']
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        action: true,
      },
    })

    // Calculate ritual health metrics
    const ritualMetrics = rituals.map(ritual => {
      const hoursSinceLastRun = ritual.lastRun
        ? (Date.now() - ritual.lastRun.getTime()) / (1000 * 60 * 60)
        : null

      // Parse cron to get expected frequency in hours
      const cronParts = ritual.cron.split(' ')
      const expectedFrequency = 24 // Default to daily, can be more sophisticated

      return {
        id: ritual.id,
        name: ritual.name,
        project: ritual.project.name,
        streak: ritual.streak,
        lastRun: ritual.lastRun?.toISOString() || null,
        enabled: ritual.enabled,
        cron: ritual.cron,
        health: ritual.enabled && hoursSinceLastRun && hoursSinceLastRun < expectedFrequency * 1.5
          ? 'healthy'
          : ritual.enabled
            ? 'late'
            : 'disabled',
        hoursSinceLastRun: hoursSinceLastRun?.toFixed(1) || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        rituals: ritualMetrics,
        recentExecutions: recentExecutions.map(log => ({
          id: log.id,
          action: log.action,
          actor: log.actor,
          status: log.status,
          payload: JSON.parse(log.payload),
          createdAt: log.createdAt.toISOString(),
          error: log.error,
        })),
        stats: {
          totalRituals: rituals.length,
          enabledRituals: rituals.filter(r => r.enabled).length,
          healthyRituals: ritualMetrics.filter(r => r.health === 'healthy').length,
          lateRituals: ritualMetrics.filter(r => r.health === 'late').length,
          executionsLast30Days: executionStats.reduce((sum, stat) => sum + stat._count.action, 0),
        },
      },
    })
  } catch (error) {
    console.error('Monitor rituals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ritual monitoring data' },
      { status: 500 }
    )
  }
}
