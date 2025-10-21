import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function GET() {
  try {
    // Get ingestion sources
    const sources = await prisma.ingestionSource.findMany({
      orderBy: { name: 'asc' }
    })

    // Calculate overall health
    const healthySources = sources.filter(s => s.health === 'healthy').length
    const totalSources = sources.length
    const healthPercentage = totalSources > 0 ? (healthySources / totalSources) * 100 : 0

    // Get recent scan stats (from audit log)
    const recentScans = await prisma.auditLog.findMany({
      where: {
        action: { in: ['job.completed', 'job.failed'] },
        payload: { contains: 'scan-todos' }
      },
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        timestamp: true,
        status: true,
        payload: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sources,
        health: {
          healthy: healthySources,
          total: totalSources,
          percentage: Math.round(healthPercentage)
        },
        recentScans
      }
    })
  } catch (error) {
    console.error('Ingestion health error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/ingestion/health',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch ingestion health' },
      { status: 500 }
    )
  }
}
