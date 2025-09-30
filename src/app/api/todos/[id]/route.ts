import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'
import { z } from 'zod'

// Validation schemas
const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  priority: z.number().min(1).max(3).optional(),
  status: z.enum(['open', 'doing', 'blocked', 'done', 'snoozed']).optional(),
  due: z.string().datetime().optional().nullable(),
  tags: z.string().optional(),
  energy: z.number().min(1).max(3).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = UpdateTodoSchema.parse(body)

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

    // If changing project, validate it exists
    if (data.projectId && data.projectId !== existingTodo.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId }
      })
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }
    }

    // Update the todo
    const updatedTodo = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        due: data.due !== undefined ? (data.due ? new Date(data.due) : null) : undefined,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      }
    })

    // Log the update
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.update',
        payload: JSON.stringify({
          todoId: id,
          changes: data,
          previousStatus: existingTodo.status,
          newStatus: updatedTodo.status
        }),
        status: 'success'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTodo,
      message: `Todo "${updatedTodo.title}" updated successfully`
    })

  } catch (error) {
    console.error('Todo update error:', error)
    captureApiError(error as Error, {
      endpoint: `/api/todos/${await (await params).id}`,
      method: 'PATCH'
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Delete the todo (will cascade delete sourceEmails)
    await prisma.task.delete({
      where: { id }
    })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.delete',
        payload: JSON.stringify({
          todoId: id,
          title: existingTodo.title,
          project: existingTodo.project.name
        }),
        status: 'success'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Todo "${existingTodo.title}" deleted successfully`
    })

  } catch (error) {
    console.error('Todo deletion error:', error)
    captureApiError(error as Error, {
      endpoint: `/api/todos/${await (await params).id}`,
      method: 'DELETE'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}