import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

interface RankingWeights {
  priority: number    // W1 = 3
  deadline: number    // W2 = 3
  energy: number      // W3 = 2
  recency: number     // W4 = 1
}

const DEFAULT_WEIGHTS: RankingWeights = {
  priority: 3,
  deadline: 3,
  energy: 2,
  recency: 1
}

function calculateTodoScore(
  todo: any,
  weights: RankingWeights = DEFAULT_WEIGHTS,
  currentHour: number = new Date().getHours()
): number {
  // Priority score (invert: 1=high=3pts, 2=med=2pts, 3=low=1pt)
  const priorityScore = (4 - todo.priority) * weights.priority

  // Deadline urgency score
  let deadlineScore = 1 // default for no deadline
  if (todo.due) {
    const now = new Date()
    const dueDate = new Date(todo.due)
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDue <= 48) {
      deadlineScore = 3 // due within 48 hours
    } else if (hoursUntilDue <= 168) { // within a week
      deadlineScore = 2
    } else {
      deadlineScore = 1
    }
  }
  const weightedDeadlineScore = deadlineScore * weights.deadline

  // Energy fit score (align with time of day)
  let energyScore = 1
  if (currentHour >= 7 && currentHour < 12) {
    // Morning: favor deep energy tasks
    energyScore = todo.energy === 1 ? 3 : (todo.energy === 2 ? 2 : 1)
  } else if (currentHour >= 12 && currentHour < 17) {
    // Afternoon: normal energy tasks optimal
    energyScore = todo.energy === 2 ? 3 : (todo.energy === 1 ? 2 : 1)
  } else {
    // Evening/Night: light energy tasks
    energyScore = todo.energy === 3 ? 3 : (todo.energy === 2 ? 2 : 1)
  }
  const weightedEnergyScore = energyScore * weights.energy

  // Recency penalty (small bump for newly created items)
  const hoursOld = (Date.now() - new Date(todo.createdAt).getTime()) / (1000 * 60 * 60)
  const recencyScore = hoursOld <= 24 ? 2 : 1 // boost for items created in last 24h
  const weightedRecencyScore = recencyScore * weights.recency

  const totalScore = priorityScore + weightedDeadlineScore + weightedEnergyScore + weightedRecencyScore

  return totalScore
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3')
    const currentHour = new Date().getHours()

    // Get all active todos (not done, not snoozed)
    const activeTodos = await prisma.task.findMany({
      where: {
        status: {
          in: ['open', 'doing', 'blocked']
        }
      },
      include: {
        project: {
          select: { name: true, color: true, type: true }
        },
        sourceEmails: {
          select: { from: true, subject: true }
        }
      }
    })

    // Calculate scores and rank
    const rankedTodos = activeTodos
      .map(todo => ({
        ...todo,
        score: calculateTodoScore(todo, DEFAULT_WEIGHTS, currentHour),
        scoreBreakdown: {
          priority: (4 - todo.priority) * DEFAULT_WEIGHTS.priority,
          deadline: calculateDeadlineScore(todo.due) * DEFAULT_WEIGHTS.deadline,
          energy: calculateEnergyScore(todo.energy, currentHour) * DEFAULT_WEIGHTS.energy,
          recency: calculateRecencyScore(todo.createdAt) * DEFAULT_WEIGHTS.recency
        }
      }))
      .sort((a, b) => b.score - a.score) // highest score first
      .slice(0, limit)

    // Get focus windows suggestion
    const focusWindows = generateFocusWindows(rankedTodos, currentHour)

    // Create summary stats
    const stats = {
      totalActive: activeTodos.length,
      byPriority: {
        high: activeTodos.filter(t => t.priority === 1).length,
        medium: activeTodos.filter(t => t.priority === 2).length,
        low: activeTodos.filter(t => t.priority === 3).length
      },
      byEnergy: {
        deep: activeTodos.filter(t => t.energy === 1).length,
        normal: activeTodos.filter(t => t.energy === 2).length,
        light: activeTodos.filter(t => t.energy === 3).length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        top3: rankedTodos,
        focusWindows,
        stats,
        meta: {
          currentHour,
          weights: DEFAULT_WEIGHTS,
          generatedAt: new Date().toISOString()
        }
      },
      message: `Top ${rankedTodos.length} todos ranked by priority, urgency, and energy fit`
    })

  } catch (error) {
    console.error('Top 3 ranking error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/top3',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to generate Top 3 ranking' },
      { status: 500 }
    )
  }
}

function calculateDeadlineScore(due: Date | null): number {
  if (!due) return 1

  const hoursUntilDue = (new Date(due).getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntilDue <= 48) return 3
  if (hoursUntilDue <= 168) return 2
  return 1
}

function calculateEnergyScore(energy: number, currentHour: number): number {
  if (currentHour >= 7 && currentHour < 12) {
    // Morning: favor deep energy
    return energy === 1 ? 3 : (energy === 2 ? 2 : 1)
  } else if (currentHour >= 12 && currentHour < 17) {
    // Afternoon: normal energy optimal
    return energy === 2 ? 3 : (energy === 1 ? 2 : 1)
  } else {
    // Evening: light energy
    return energy === 3 ? 3 : (energy === 2 ? 2 : 1)
  }
}

function calculateRecencyScore(createdAt: Date): number {
  const hoursOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  return hoursOld <= 24 ? 2 : 1
}

function generateFocusWindows(topTodos: any[], currentHour: number) {
  const now = new Date()
  const windows = []

  // Morning window (9-11 AM) - for deep work
  const morningStart = new Date(now.setHours(9, 0, 0, 0))
  const morningEnd = new Date(now.setHours(11, 0, 0, 0))
  const deepTasks = topTodos.filter(t => t.energy === 1).slice(0, 2)

  windows.push({
    type: 'deep',
    start: morningStart.toISOString(),
    end: morningEnd.toISOString(),
    duration: 120, // minutes
    tasks: deepTasks,
    description: 'Deep work window for high-concentration tasks'
  })

  // Afternoon window (2-3:30 PM) - for normal energy tasks
  const afternoonStart = new Date(now.setHours(14, 0, 0, 0))
  const afternoonEnd = new Date(now.setHours(15, 30, 0, 0))
  const normalTasks = topTodos.filter(t => t.energy === 2).slice(0, 2)

  windows.push({
    type: 'normal',
    start: afternoonStart.toISOString(),
    end: afternoonEnd.toISOString(),
    duration: 90, // minutes
    tasks: normalTasks,
    description: 'Regular work window for standard tasks'
  })

  return windows
}