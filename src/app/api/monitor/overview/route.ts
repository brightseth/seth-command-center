import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jobQueueService } from '@/services/jobs'

/**
 * GET /api/monitor/overview
 * Returns high-level monitoring overview
 */
export async function GET() {
  try {
    // Get queue stats
    const queueStats = await jobQueueService.getQueueStats()

    // Get ritual stats
    const totalRituals = await prisma.ritual.count()
    const enabledRituals = await prisma.ritual.count({ where: { enabled: true } })

    // Get recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const recentActivity = await prisma.auditLog.count({
      where: {
        createdAt: { gte: last24Hours },
      },
    })

    const recentRitualRuns = await prisma.auditLog.count({
      where: {
        action: { in: ['job.completed', 'ritual.run'] },
        createdAt: { gte: last24Hours },
      },
    })

    const recentJobFailures = await prisma.job.count({
      where: {
        status: 'failed',
        createdAt: { gte: last24Hours },
      },
    })

    // Get system health indicators
    const stuckJobs = await prisma.job.count({
      where: {
        status: 'running',
        startedAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000), // Running for more than 1 hour
        },
      },
    })

    const lateRituals = await prisma.ritual.count({
      where: {
        enabled: true,
        lastRun: {
          lt: new Date(Date.now() - 48 * 60 * 60 * 1000), // Not run in 48 hours
        },
      },
    })

    // Calculate overall system health
    const healthScore = calculateHealthScore({
      jobFailureRate: queueStats.totalJobs > 0 ? queueStats.failed / queueStats.totalJobs : 0,
      stuckJobs,
      lateRituals,
      pendingJobs: queueStats.pending,
    })

    return NextResponse.json({
      success: true,
      data: {
        systemHealth: {
          score: healthScore,
          status: getHealthStatus(healthScore),
        },
        queue: {
          total: queueStats.totalJobs,
          pending: queueStats.pending,
          running: queueStats.running,
          completed: queueStats.completed,
          failed: queueStats.failed,
        },
        rituals: {
          total: totalRituals,
          enabled: enabledRituals,
          late: lateRituals,
        },
        activity: {
          last24Hours: recentActivity,
          ritualRuns: recentRitualRuns,
          jobFailures: recentJobFailures,
        },
        alerts: [
          ...(stuckJobs > 0 ? [{
            severity: 'warning',
            message: `${stuckJobs} job(s) stuck in running state`,
            type: 'stuck_jobs',
          }] : []),
          ...(lateRituals > 0 ? [{
            severity: 'info',
            message: `${lateRituals} ritual(s) haven't run in 48 hours`,
            type: 'late_rituals',
          }] : []),
          ...(queueStats.failed > 10 ? [{
            severity: 'error',
            message: `${queueStats.failed} failed jobs in queue`,
            type: 'high_failures',
          }] : []),
          ...(queueStats.pending > 50 ? [{
            severity: 'warning',
            message: `${queueStats.pending} pending jobs in queue`,
            type: 'high_pending',
          }] : []),
        ],
      },
    })
  } catch (error) {
    console.error('Monitor overview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring overview' },
      { status: 500 }
    )
  }
}

function calculateHealthScore(metrics: {
  jobFailureRate: number
  stuckJobs: number
  lateRituals: number
  pendingJobs: number
}): number {
  let score = 100

  // Penalize for job failures (up to -40 points)
  score -= Math.min(metrics.jobFailureRate * 100, 40)

  // Penalize for stuck jobs (-5 per stuck job, max -20)
  score -= Math.min(metrics.stuckJobs * 5, 20)

  // Penalize for late rituals (-3 per late ritual, max -20)
  score -= Math.min(metrics.lateRituals * 3, 20)

  // Penalize for high pending queue (-0.2 per pending, max -20)
  score -= Math.min(metrics.pendingJobs * 0.2, 20)

  return Math.max(0, Math.round(score))
}

function getHealthStatus(score: number): 'healthy' | 'degraded' | 'critical' {
  if (score >= 80) return 'healthy'
  if (score >= 50) return 'degraded'
  return 'critical'
}
