import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

/**
 * POST /api/todos/import
 *
 * Import tasks from ChatGPT or other sources
 * Supports both creating new tasks and updating existing ones
 */

const ImportTaskSchema = z.object({
  title: z.string().min(1),
  project: z.string().optional(), // Project name
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  status: z.enum(['open', 'doing', 'blocked', 'done', 'snoozed']).optional().default('open'),
  due: z.string().optional(), // ISO date string
  notes: z.string().optional(),
})

const ImportRequestSchema = z.object({
  tasks: z.array(ImportTaskSchema),
  mode: z.enum(['create', 'replace']).optional().default('create')
  // create: Add new tasks
  // replace: Clear existing tasks and replace with these
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tasks, mode } = ImportRequestSchema.parse(body)

    // Get all projects for mapping
    const projects = await prisma.project.findMany()
    const projectMap = Object.fromEntries(
      projects.map(p => [p.name.toLowerCase(), p])
    )

    // If replace mode, mark all existing tasks as done
    if (mode === 'replace') {
      await prisma.task.updateMany({
        where: {
          status: { in: ['open', 'doing', 'blocked'] }
        },
        data: {
          status: 'done',
          updatedAt: new Date()
        }
      })
    }

    const imported = []
    const errors = []

    for (const task of tasks) {
      try {
        // Find project by name (case-insensitive)
        let projectId = null
        if (task.project) {
          const project = projectMap[task.project.toLowerCase()]
          if (project) {
            projectId = project.id
          }
        }

        // If no project found, use first available project
        if (!projectId) {
          const defaultProject = projects[0]
          if (defaultProject) {
            projectId = defaultProject.id
          } else {
            throw new Error('No projects available')
          }
        }

        // Map priority
        const priorityMap = { high: 1, medium: 2, low: 3 }
        const priority = priorityMap[task.priority || 'medium']

        // Create task
        const created = await prisma.task.create({
          data: {
            title: task.title,
            projectId,
            priority,
            status: task.status || 'open',
            due: task.due ? new Date(task.due) : null,
            notes: task.notes || '',
            tags: '',
            energy: 2,
            source: 'api'
          },
          include: {
            project: {
              select: { name: true, color: true }
            }
          }
        })

        imported.push(created)
      } catch (error) {
        errors.push({
          task: task.title,
          error: (error as Error).message
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      tasks: imported,
      errorDetails: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Import error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Import failed' },
      { status: 500 }
    )
  }
}
