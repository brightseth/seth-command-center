import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/services/github'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function POST(request: NextRequest) {
  try {
    const { success, stats } = await githubService.syncToDatabase()

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'GitHub sync failed' },
        { status: 500 }
      )
    }

    // Update KPIs with real GitHub data
    const now = new Date().toISOString()

    const kpiUpdates = [
      {
        key: 'github.commits.today',
        value: stats.todayCommits,
        at: now
      },
      {
        key: 'github.commits.week',
        value: stats.thisWeekCommits,
        at: now
      },
      {
        key: 'github.repos.active',
        value: stats.activeRepos,
        at: now
      }
    ]

    // Find Seth project (assuming it exists from seed data)
    const sethProject = await prisma.project.findUnique({
      where: { name: 'seth' }
    })

    if (sethProject) {
      // Update/create KPIs
      for (const kpi of kpiUpdates) {
        await prisma.kPI.upsert({
          where: {
            projectId_key: {
              projectId: sethProject.id,
              key: kpi.key
            }
          },
          create: {
            projectId: sethProject.id,
            key: kpi.key,
            value: kpi.value,
            at: kpi.at
          },
          update: {
            value: kpi.value,
            at: kpi.at
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        kpisUpdated: kpiUpdates.length,
        lastCommit: stats.lastCommitTime
      },
      message: 'GitHub data synced successfully'
    })

  } catch (error) {
    console.error('GitHub sync API error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/github/sync',
      method: 'POST'
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await githubService.getGitHubStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('GitHub stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    )
  }
}