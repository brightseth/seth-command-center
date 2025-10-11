import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/hooks/doc-organizer
 *
 * Webhook endpoint for doc-organizer integration
 * Triggered by:
 * - Task completion in Command Center
 * - Project milestone completion
 * - Manual archival requests
 *
 * Request body:
 * {
 *   "project": "eden-academy",
 *   "trigger": "task.complete" | "milestone.complete" | "manual",
 *   "taskId": "task_123" (optional),
 *   "reason": "Task #42 completed"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "action": "archive_triggered",
 *   "specs_to_archive": ["doc1.md", "doc2.md"],
 *   "message": "Doc-organizer cleanup queued"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project, trigger, taskId, reason } = body

    // Validate required fields
    if (!project || !trigger) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: project, trigger'
        },
        { status: 400 }
      )
    }

    // Validate project exists
    const projectRecord = await prisma.project.findFirst({
      where: { name: project }
    })

    if (!projectRecord) {
      return NextResponse.json(
        {
          success: false,
          error: `Project not found: ${project}`
        },
        { status: 404 }
      )
    }

    // If triggered by task completion, check for related specs
    let specsToArchive: string[] = []
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          title: true,
          notes: true,
          tags: true,
          status: true
        }
      })

      if (task && task.status === 'done') {
        // Parse notes for referenced spec files
        const specPattern = /\/docs\/specs\/([a-z0-9-]+\.md)/gi
        const notesText = task.notes || ''
        const matches = notesText.matchAll(specPattern)

        for (const match of matches) {
          specsToArchive.push(match[1])
        }
      }
    }

    // Query for open tasks that reference specs
    // This prevents archiving specs still in use
    const openTasks = await prisma.task.findMany({
      where: {
        projectId: projectRecord.id,
        status: { in: ['open', 'doing', 'blocked'] }
      },
      select: { notes: true }
    })

    const activeSpecs = new Set<string>()
    for (const task of openTasks) {
      const specPattern = /\/docs\/specs\/([a-z0-9-]+\.md)/gi
      const matches = (task.notes || '').matchAll(specPattern)
      for (const match of matches) {
        activeSpecs.add(match[1])
      }
    }

    // Filter out specs that are still actively referenced
    specsToArchive = specsToArchive.filter(spec => !activeSpecs.has(spec))

    // Create job for doc-organizer cleanup
    const job = await prisma.job.create({
      data: {
        type: 'doc-organizer.archive',
        payload: JSON.stringify({
          project,
          specs: specsToArchive,
          trigger,
          reason: reason || `Triggered by ${trigger}`,
          timestamp: new Date().toISOString()
        }),
        status: 'pending',
        runAt: new Date()
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        actor: 'system',
        action: 'doc-organizer.triggered',
        payload: JSON.stringify({
          project,
          trigger,
          taskId,
          jobId: job.id,
          specsToArchive
        }),
        status: 'success'
      }
    })

    return NextResponse.json({
      success: true,
      action: 'archive_triggered',
      jobId: job.id,
      project,
      specs_to_archive: specsToArchive,
      active_specs_preserved: Array.from(activeSpecs),
      message: specsToArchive.length > 0
        ? `Doc-organizer cleanup queued: ${specsToArchive.length} specs to archive`
        : 'No specs to archive (all still actively referenced)'
    })

  } catch (error) {
    // Log failure
    await prisma.auditLog.create({
      data: {
        actor: 'system',
        action: 'doc-organizer.triggered',
        payload: JSON.stringify({ error: true }),
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }).catch(() => {}) // Ignore audit log failures

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/hooks/doc-organizer
 *
 * Query doc-organizer job status and history
 *
 * Query params:
 * - project: Filter by project name
 * - limit: Max results (default 10)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Query recent doc-organizer jobs
    const jobs = await prisma.job.findMany({
      where: {
        type: 'doc-organizer.archive',
        ...(project && {
          payload: {
            contains: `"project":"${project}"`
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Parse job payloads
    const jobsWithPayload = jobs.map(job => ({
      id: job.id,
      status: job.status,
      attempts: job.attempts,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      ...JSON.parse(job.payload)
    }))

    return NextResponse.json({
      success: true,
      jobs: jobsWithPayload,
      count: jobs.length
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
