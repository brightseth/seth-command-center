import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Get basic stats
    const [projectCount, taskCount, workCount] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.work.count(),
    ])

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        projects: projectCount,
        tasks: taskCount,
        works: workCount,
      },
      system: {
        environment: process.env.NODE_ENV,
        version: '0.1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
