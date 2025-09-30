import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'
import { z } from 'zod'

const SnoozeSchema = z.object({
  until: z.string().datetime(),
  reason: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { until, reason } = SnoozeSchema.parse(body)

    // Check if todo exists
    const existingTodo = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!existingTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      )
    }

    if (existingTodo.status === 'done') {
      return NextResponse.json(
        { success: false, error: 'Cannot snooze a completed todo' },
        { status: 400 }
      )
    }

    const untilDate = new Date(until)
    if (untilDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Snooze date must be in the future' },
        { status: 400 }
      )
    }

    // Snooze the todo
    const snoozedTodo = await prisma.task.update({
      where: { id },
      data: {
        status: 'snoozed',
        due: untilDate, // Set due date to when it should come back
        notes: reason ? `${existingTodo.notes || ''}\n\n[Snoozed: ${reason}]`.trim() : existingTodo.notes,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      }
    })

    // Log the snooze
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.snooze',
        payload: JSON.stringify({
          todoId: id,
          title: snoozedTodo.title,
          project: existingTodo.project.name,
          snoozedUntil: until,
          reason,
          previousStatus: existingTodo.status
        }),
        status: 'success'
      }
    })

    const daysUntil = Math.ceil((untilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      data: snoozedTodo,
      message: `Todo "${snoozedTodo.title}" snoozed until ${untilDate.toLocaleDateString()} (${daysUntil} days) 😴`
    })

  } catch (error) {
    console.error('Todo snooze error:', error)
    captureApiError(error as Error, {
      endpoint: `/api/todos/${await (await params).id}/snooze`,
      method: 'POST'
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to snooze todo' },
      { status: 500 }
    )
  }
}