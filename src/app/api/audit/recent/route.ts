import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function GET() {
  try {
    const recentLogs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        timestamp: true,
        actor: true,
        action: true,
        status: true,
        error: true,
        payload: true
      }
    })

    // Get summary stats
    const totalLogs = await prisma.auditLog.count()
    const successfulLogs = await prisma.auditLog.count({
      where: { status: 'success' }
    })
    const failedLogs = await prisma.auditLog.count({
      where: { status: 'failure' }
    })

    return NextResponse.json({
      success: true,
      data: {
        logs: recentLogs,
        stats: {
          total: totalLogs,
          successful: successfulLogs,
          failed: failedLogs,
          successRate: totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error('Audit log error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/audit/recent',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
