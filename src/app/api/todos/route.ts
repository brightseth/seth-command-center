import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'
import { z } from 'zod'

// Validation schemas
const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  projectId: z.string(),
  priority: z.number().min(1).max(3).default(2),
  status: z.enum(['open', 'doing', 'blocked', 'done', 'snoozed']).default('open'),
  due: z.string().datetime().optional(),
  source: z.enum(['email', 'slash', 'calendar', 'api', 'manual']).default('manual'),
  tags: z.string().default(''),
  energy: z.number().min(1).max(3).default(2),
})

const GetTodosQuerySchema = z.object({
  view: z.enum(['today', 'week', 'all']).optional().default('all'),
  project: z.string().optional(),
  status: z.enum(['open', 'doing', 'blocked', 'done', 'snoozed']).optional(),
  priority: z.number().min(1).max(3).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateTodoSchema.parse(body)

    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create the todo
    const todo = await prisma.task.create({
      data: {
        title: data.title,
        notes: data.notes,
        projectId: data.projectId,
        priority: data.priority,
        status: data.status,
        due: data.due ? new Date(data.due) : null,
        source: data.source,
        tags: data.tags,
        energy: data.energy,
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      }
    })

    // Log the creation
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.create',
        payload: JSON.stringify({
          todoId: todo.id,
          title: todo.title,
          project: project.name,
          priority: todo.priority,
          source: todo.source
        }),
        status: 'success'
      }
    })

    return NextResponse.json({
      success: true,
      data: todo,
      message: `Todo "${todo.title}" created successfully`
    })

  } catch (error) {
    console.error('Todo creation error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/todos',
      method: 'POST'
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    // Parse query parameters
    const query = GetTodosQuerySchema.parse({
      view: queryParams.view,
      project: queryParams.project,
      status: queryParams.status,
      priority: queryParams.priority ? parseInt(queryParams.priority) : undefined,
    })

    // Build the where clause
    const where: any = {}

    if (query.project) {
      // Find project by name
      const project = await prisma.project.findFirst({
        where: { name: query.project }
      })
      if (project) {
        where.projectId = project.id
      }
    }

    if (query.status) {
      where.status = query.status
    } else {
      // Default to active tasks only (exclude completed)
      where.status = { in: ['open', 'doing', 'blocked', 'snoozed'] }
    }

    if (query.priority) {
      where.priority = query.priority
    }

    // Apply view filters
    if (query.view === 'today') {
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))

      where.OR = [
        { due: { gte: startOfDay, lte: endOfDay } },
        { status: 'doing' },
        { AND: [{ priority: 1 }, { status: { in: ['open', 'blocked'] } }] }
      ]
    } else if (query.view === 'week') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      where.OR = [
        { due: { lte: nextWeek } },
        { status: { in: ['doing', 'blocked'] } }
      ]
    }

    // Get todos
    const todos = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { name: true, color: true, type: true }
        },
        sourceEmails: {
          select: { from: true, subject: true, receivedAt: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { due: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get project summary
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, color: true, type: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        todos,
        projects,
        meta: {
          view: query.view,
          total: todos.length,
          byStatus: {
            open: todos.filter(t => t.status === 'open').length,
            doing: todos.filter(t => t.status === 'doing').length,
            blocked: todos.filter(t => t.status === 'blocked').length,
            done: todos.filter(t => t.status === 'done').length,
            snoozed: todos.filter(t => t.status === 'snoozed').length,
          }
        }
      }
    })

  } catch (error) {
    console.error('Get todos error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/todos',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}