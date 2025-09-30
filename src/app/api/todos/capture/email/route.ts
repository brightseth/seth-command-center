import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'
import { z } from 'zod'

// Email capture validation schema
const EmailCaptureSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  from: z.string().email('Valid email address required'),
  snippet: z.string().optional(),
  threadUrl: z.string().url().optional(),
  project: z.string().optional(), // Project name, will lookup by name
  notes: z.string().optional(),
})

function extractTodoFromSubject(subject: string): { hasTodo: boolean; cleanTitle: string } {
  // Check if subject contains TODO (case insensitive)
  const todoMatch = /\btodo\b/i.test(subject)

  if (!todoMatch) {
    return { hasTodo: false, cleanTitle: subject }
  }

  // Clean up the subject by removing TODO prefix/suffix and common email patterns
  let cleanTitle = subject
    .replace(/^\s*(re:|fwd?:|todo:?)\s*/gi, '') // Remove email prefixes
    .replace(/\s*\[todo\]\s*/gi, '') // Remove [TODO] tags
    .replace(/\s*todo:?\s*/gi, '') // Remove TODO: prefixes
    .replace(/^\s*[-•]\s*/, '') // Remove bullet points
    .trim()

  // If the subject becomes empty after cleaning, use the original
  if (!cleanTitle) {
    cleanTitle = subject
  }

  return { hasTodo: true, cleanTitle }
}

function extractProjectFromEmail(from: string, subject: string, notes?: string): string | null {
  const content = `${from} ${subject} ${notes || ''}`.toLowerCase()

  // Project detection patterns
  const projectPatterns = [
    { pattern: /\b(eden|abraham|solienne)\b/, project: 'Eden' },
    { pattern: /\b(bm|portfolio|website)\b/, project: 'BM' },
    { pattern: /\b(vibecoding|newsletter)\b/, project: 'Vibecoding' },
    { pattern: /\b(automata|research)\b/, project: 'Automata' },
    { pattern: /\b(relocation|move|location)\b/, project: 'Relocation' },
    { pattern: /\b(irs|tax|cobra|insurance)\b/, project: 'IRS' },
  ]

  for (const { pattern, project } of projectPatterns) {
    if (pattern.test(content)) {
      return project
    }
  }

  return null // Will default to first available project
}

function extractPriorityFromContent(subject: string, snippet?: string): number {
  const content = `${subject} ${snippet || ''}`.toLowerCase()

  // Priority detection patterns
  if (/\b(urgent|asap|emergency|critical|deadline)\b/.test(content)) {
    return 1 // High priority
  }

  if (/\b(important|priority|soon|today)\b/.test(content)) {
    return 2 // Medium priority (but elevated)
  }

  return 2 // Default medium priority
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = EmailCaptureSchema.parse(body)

    // Extract todo information from subject
    const { hasTodo, cleanTitle } = extractTodoFromSubject(data.subject)

    if (!hasTodo) {
      return NextResponse.json({
        success: false,
        error: 'Email does not contain TODO in subject line',
        suggestion: 'Forward emails with TODO in the subject to create tasks'
      }, { status: 400 })
    }

    // Determine project
    let projectId = null
    if (data.project) {
      // Look up project by name
      const project = await prisma.project.findFirst({
        where: { name: { equals: data.project, mode: 'insensitive' } }
      })
      if (project) {
        projectId = project.id
      }
    }

    if (!projectId) {
      // Auto-detect project or use default
      const detectedProjectName = extractProjectFromEmail(data.from, data.subject, data.snippet)
      if (detectedProjectName) {
        const project = await prisma.project.findFirst({
          where: { name: { equals: detectedProjectName, mode: 'insensitive' } }
        })
        if (project) {
          projectId = project.id
        }
      }
    }

    if (!projectId) {
      // Default to first available project
      const defaultProject = await prisma.project.findFirst({
        orderBy: { name: 'asc' }
      })
      if (!defaultProject) {
        return NextResponse.json({
          success: false,
          error: 'No projects available. Create a project first.'
        }, { status: 400 })
      }
      projectId = defaultProject.id
    }

    // Extract priority from content
    const priority = extractPriorityFromContent(data.subject, data.snippet)

    // Create the todo
    const todo = await prisma.task.create({
      data: {
        projectId,
        title: cleanTitle,
        notes: data.notes,
        priority,
        status: 'open',
        source: 'email',
        tags: 'email-captured',
        energy: 2, // Default normal energy for email tasks
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      }
    })

    // Create source email record
    const sourceEmail = await prisma.sourceEmail.create({
      data: {
        taskId: todo.id,
        from: data.from,
        subject: data.subject,
        snippet: data.snippet,
        threadUrl: data.threadUrl,
        receivedAt: new Date(), // Current time as received time
      }
    })

    // Log the capture
    await prisma.auditLog.create({
      data: {
        actor: '@seth',
        action: 'todo.capture.email',
        payload: JSON.stringify({
          todoId: todo.id,
          title: todo.title,
          from: data.from,
          originalSubject: data.subject,
          cleanedTitle: cleanTitle,
          detectedProject: todo.project.name,
          detectedPriority: priority,
          sourceEmailId: sourceEmail.id
        }),
        status: 'success'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        todo,
        sourceEmail,
        processing: {
          originalSubject: data.subject,
          cleanedTitle: cleanTitle,
          detectedProject: todo.project.name,
          detectedPriority: priority,
          priorityReason: priority === 1 ? 'urgent keywords detected' : 'standard priority'
        }
      },
      message: `Todo "${cleanTitle}" captured from email and assigned to ${todo.project.name}`
    })

  } catch (error) {
    console.error('Email capture error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/todos/capture/email',
      method: 'POST'
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to capture todo from email' },
      { status: 500 }
    )
  }
}