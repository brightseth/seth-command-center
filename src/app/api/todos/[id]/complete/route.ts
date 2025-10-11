import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        { success: false, error: 'Todo is already completed' },
        { status: 400 }
      )
    }

    // Mark todo as complete
    const completedTodo = await prisma.task.update({
      where: { id },
      data: {
        status: 'done',
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      }
    })

    // Log the completion
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.complete',
        payload: JSON.stringify({
          todoId: id,
          title: completedTodo.title,
          project: existingTodo.project.name,
          previousStatus: existingTodo.status,
          completedAt: new Date().toISOString()
        }),
        status: 'success'
      }
    })

    // Trigger doc-organizer webhook for cleanup
    // This will check if any specs should be archived based on completed task
    try {
      const webhookUrl = process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/hooks/doc-organizer`
        : 'http://localhost:3000/api/hooks/doc-organizer'

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: existingTodo.project.name,
          trigger: 'task.complete',
          taskId: id,
          reason: `Task completed: ${completedTodo.title}`
        })
      })
    } catch (webhookError) {
      // Don't fail the completion if webhook fails
      console.error('Doc-organizer webhook failed:', webhookError)
    }

    return NextResponse.json({
      success: true,
      data: completedTodo,
      message: `Todo "${completedTodo.title}" marked as complete! 🎉`
    })

  } catch (error) {
    console.error('Todo completion error:', error)
    captureApiError(error as Error, {
      endpoint: `/api/todos/${await (await params).id}/complete`,
      method: 'POST'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to complete todo' },
      { status: 500 }
    )
  }
}