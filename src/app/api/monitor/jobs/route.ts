import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jobQueueService } from '@/services/jobs'

/**
 * GET /api/monitor/jobs
 * Returns job queue status and recent job history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Get queue statistics
    const queueStats = await jobQueueService.getQueueStats()

    // Build query filters
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Get job execution times (for completed jobs)
    const completedJobs = await prisma.job.findMany({
      where: {
        status: 'completed',
        startedAt: { not: null },
        completedAt: { not: null },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 100,
    })

    const executionTimes = completedJobs
      .map(job => {
        if (!job.startedAt || !job.completedAt) return null
        return job.completedAt.getTime() - job.startedAt.getTime()
      })
      .filter((time): time is number => time !== null)

    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0

    // Get job type distribution
    const jobTypeStats = await prisma.job.groupBy({
      by: ['type', 'status'],
      _count: {
        type: true,
      },
    })

    // Calculate job health metrics
    const failedJobsLast24h = await prisma.job.count({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    const pendingJobsOlderThan1h = await prisma.job.count({
      where: {
        status: 'pending',
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        queueStats,
        recentJobs: recentJobs.map(job => ({
          id: job.id,
          type: job.type,
          status: job.status,
          attempts: job.attempts,
          maxRetries: job.maxRetries,
          runAt: job.runAt.toISOString(),
          startedAt: job.startedAt?.toISOString() || null,
          completedAt: job.completedAt?.toISOString() || null,
          createdAt: job.createdAt.toISOString(),
          error: job.error,
          payload: JSON.parse(job.payload),
          executionTime: job.startedAt && job.completedAt
            ? job.completedAt.getTime() - job.startedAt.getTime()
            : null,
        })),
        metrics: {
          avgExecutionTimeMs: Math.round(avgExecutionTime),
          failedJobsLast24h,
          pendingJobsOlderThan1h,
          successRate: queueStats.totalJobs > 0
            ? ((queueStats.completed / queueStats.totalJobs) * 100).toFixed(1)
            : '0.0',
        },
        jobTypeStats: jobTypeStats.map(stat => ({
          type: stat.type,
          status: stat.status,
          count: stat._count.type,
        })),
      },
    })
  } catch (error) {
    console.error('Monitor jobs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job monitoring data' },
      { status: 500 }
    )
  }
}
