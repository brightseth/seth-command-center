import { NextRequest, NextResponse } from 'next/server'
import { jobQueueService } from '@/services/jobs'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { captureApiError, captureRitualEvent } from '@/lib/sentry'

const RunRitualSchema = z.object({
  ritualId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ritualId } = RunRitualSchema.parse(body)

    // Validate ritual exists and is enabled
    const ritual = await prisma.ritual.findUnique({
      where: { id: ritualId },
      include: { project: true }
    })

    if (!ritual) {
      return NextResponse.json(
        { success: false, error: 'Ritual not found' },
        { status: 404 }
      )
    }

    if (!ritual.enabled) {
      return NextResponse.json(
        { success: false, error: 'Ritual is disabled' },
        { status: 400 }
      )
    }

    // Check cooldown (prevent running more than once per hour)
    if (ritual.lastRun) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (ritual.lastRun > oneHourAgo) {
        const minutesLeft = Math.ceil((ritual.lastRun.getTime() + 60 * 60 * 1000 - Date.now()) / (1000 * 60))
        return NextResponse.json(
          { success: false, error: `Ritual on cooldown. Try again in ${minutesLeft} minutes.` },
          { status: 429 }
        )
      }
    }

    // Queue ritual execution job
    const job = await jobQueueService.enqueue({
      type: 'ritual.run',
      payload: { ritualId }
    })

    // Track ritual event
    captureRitualEvent(ritualId, 'started', {
      ritualName: ritual.name,
      projectName: ritual.project.name,
      streak: ritual.streak,
      jobId: job.id
    })

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        ritual: {
          id: ritual.id,
          name: ritual.name,
          project: ritual.project.name,
          streak: ritual.streak
        }
      },
      message: `Ritual "${ritual.name}" queued for execution`
    })

  } catch (error) {
    console.error('Ritual run error:', error)

    // Capture error in Sentry
    captureApiError(error as Error, {
      endpoint: '/api/rituals/run',
      method: 'POST'
    })

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}