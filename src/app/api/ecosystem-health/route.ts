import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  data?: Record<string, any>
}

export async function GET() {
  const timestamp = new Date().toISOString()
  const health: Record<string, SystemHealth> = {}

  // 1. Command Center Database
  try {
    await prisma.$queryRaw`SELECT 1`
    const [projectCount, taskCount, workCount, ritualCount] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.work.count(),
      prisma.ritual.count(),
    ])

    const activeTasks = await prisma.task.count({
      where: { status: { in: ['open', 'doing'] } },
    })

    health.commandCenter = {
      status: 'healthy',
      data: {
        projects: projectCount,
        tasks: taskCount,
        activeTasks,
        works: workCount,
        rituals: ritualCount,
      },
    }
  } catch (error) {
    health.commandCenter = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
    }
  }

  // 2. Vibecodings (Future: Check API endpoint when available)
  health.vibecodings = {
    status: 'healthy',
    message: 'API integration pending',
    data: {
      days: 67,
      sites: 34,
      featured: 5,
    },
  }

  // 3. Agent @Seth (Future: Check local service when running)
  health.agentSeth = {
    status: 'healthy',
    message: 'Integration pending',
    data: {
      endpoint: 'http://localhost:5555',
    },
  }

  // 4. Public Portfolio
  health.publicPortfolio = {
    status: 'healthy',
    message: 'Manual updates only',
    data: {
      url: 'https://sethgoldstein.com',
    },
  }

  // Overall status
  const statuses = Object.values(health).map((h) => h.status)
  const overallStatus = statuses.includes('unhealthy')
    ? 'unhealthy'
    : statuses.includes('degraded')
    ? 'degraded'
    : 'healthy'

  return NextResponse.json({
    success: true,
    status: overallStatus,
    timestamp,
    systems: health,
    version: '0.1.0',
    environment: process.env.NODE_ENV,
  })
}
