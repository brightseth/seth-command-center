import { NextResponse } from 'next/server'
import { jobQueueService } from '@/services/jobs'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function GET() {
  try {
    // Get queue statistics
    const stats = await jobQueueService.getQueueStats()

    // Get recent jobs (last 20)
    const recentJobs = await prisma.job.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        attempts: true,
        maxRetries: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        error: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentJobs
      }
    })
  } catch (error) {
    console.error('Job stats error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/jobs/stats',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch job stats' },
      { status: 500 }
    )
  }
}
