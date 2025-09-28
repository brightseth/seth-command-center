import { NextRequest, NextResponse } from 'next/server'
import { jobQueueService, JobCreateSchema } from '@/services/jobs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate job data
    const jobData = JobCreateSchema.parse({
      type: body.type,
      payload: body.payload,
      runAt: body.runAt ? new Date(body.runAt) : undefined,
      maxRetries: body.maxRetries,
    })

    // Enqueue job
    const job = await jobQueueService.enqueue(jobData)

    return NextResponse.json({
      success: true,
      data: job,
      message: `Job ${job.type} queued with ID: ${job.id}`
    })

  } catch (error) {
    console.error('Job queue error:', error)

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: 'Invalid job format', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET queue statistics
export async function GET() {
  try {
    const stats = await jobQueueService.getQueueStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Queue stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}