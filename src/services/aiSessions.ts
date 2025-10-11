import { auditService } from './audit'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// AI Session schemas
export const AIConversationSchema = z.object({
  source: z.enum(['limitless', 'chatgpt', 'claude', 'granola']),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
  title: z.string().optional(),
  content: z.string(),
  participants: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export type AIConversation = z.infer<typeof AIConversationSchema>

// Extracted intelligence schema
export const SessionIntelligenceSchema = z.object({
  projects: z.array(z.string()),
  decisions: z.array(z.string()),
  tasks: z.array(z.string()),
  learnings: z.array(z.string()),
  themes: z.array(z.string()),
  mood: z.enum(['focused', 'creative', 'stressed', 'excited', 'confused', 'breakthrough']).optional(),
  energy: z.enum(['low', 'medium', 'high']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  nextActions: z.array(z.string()),
  mentions: z.object({
    people: z.array(z.string()),
    technologies: z.array(z.string()),
    companies: z.array(z.string())
  }).optional()
})

export type SessionIntelligence = z.infer<typeof SessionIntelligenceSchema>

export class AISessionService {

  /**
   * Parse conversation content to extract structured intelligence
   */
  async parseConversation(conversation: AIConversation): Promise<SessionIntelligence> {
    const content = conversation.content.toLowerCase()

    // Project detection (look for known project names + common patterns)
    const projectKeywords = ['seth-command-center', 'eden', 'vibecoding', 'automata', 'solienne', 'abraham']
    const projectPatterns = [
      /working on ([a-z-]+)/g,
      /building ([a-z-]+)/g,
      /project called ([a-z-]+)/g
    ]

    const projects = new Set<string>()

    // Add known projects
    projectKeywords.forEach(keyword => {
      if (content.includes(keyword)) projects.add(keyword)
    })

    // Extract project patterns
    projectPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => projects.add(match[1]))
    })

    // Decision detection
    const decisionPatterns = [
      /decided to ([^.!?]+)/g,
      /going with ([^.!?]+)/g,
      /chose to ([^.!?]+)/g,
      /switching to ([^.!?]+)/g
    ]

    const decisions: string[] = []
    decisionPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => decisions.push(match[1].trim()))
    })

    // Task detection
    const taskPatterns = [
      /need to ([^.!?]+)/g,
      /should ([^.!?]+)/g,
      /todo:?\s*([^.!?\n]+)/g,
      /action item:?\s*([^.!?\n]+)/g,
      /next:?\s*([^.!?\n]+)/g
    ]

    const tasks: string[] = []
    taskPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => tasks.push(match[1].trim()))
    })

    // Learning detection
    const learningPatterns = [
      /learned that ([^.!?]+)/g,
      /discovered ([^.!?]+)/g,
      /figured out ([^.!?]+)/g,
      /now understand ([^.!?]+)/g
    ]

    const learnings: string[] = []
    learningPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => learnings.push(match[1].trim()))
    })

    // Theme detection (common technical/business themes)
    const themeKeywords = [
      'architecture', 'design', 'api', 'database', 'frontend', 'backend',
      'automation', 'intelligence', 'workflow', 'productivity', 'ritual',
      'integration', 'deployment', 'testing', 'documentation', 'strategy'
    ]

    const themes = themeKeywords.filter(theme => content.includes(theme))

    // Mood detection (simple keyword matching)
    let mood: SessionIntelligence['mood'] = undefined
    if (content.includes('breakthrough') || content.includes('eureka')) mood = 'breakthrough'
    else if (content.includes('excited') || content.includes('amazing')) mood = 'excited'
    else if (content.includes('focused') || content.includes('deep work')) mood = 'focused'
    else if (content.includes('creative') || content.includes('inspiration')) mood = 'creative'
    else if (content.includes('stressed') || content.includes('overwhelmed')) mood = 'stressed'
    else if (content.includes('confused') || content.includes('stuck')) mood = 'confused'

    // Energy detection
    let energy: SessionIntelligence['energy'] = 'medium'
    if (content.includes('tired') || content.includes('drained')) energy = 'low'
    else if (content.includes('energized') || content.includes('pumped')) energy = 'high'

    // Priority detection
    let priority: SessionIntelligence['priority'] = 'medium'
    if (content.includes('urgent') || content.includes('asap')) priority = 'urgent'
    else if (content.includes('important') || content.includes('critical')) priority = 'high'
    else if (content.includes('nice to have') || content.includes('someday')) priority = 'low'

    // Next actions (more specific than tasks)
    const nextActionPatterns = [
      /next step:?\s*([^.!?\n]+)/g,
      /immediately:?\s*([^.!?\n]+)/g,
      /first:?\s*([^.!?\n]+)/g
    ]

    const nextActions: string[] = []
    nextActionPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => nextActions.push(match[1].trim()))
    })

    return {
      projects: Array.from(projects),
      decisions,
      tasks,
      learnings,
      themes,
      mood,
      energy,
      priority,
      nextActions
    }
  }

  /**
   * Process AI conversation and create actionable items
   */
  async processConversation(conversation: AIConversation): Promise<{
    intelligence: SessionIntelligence
    itemsCreated: {
      tasks: number
      kpis: number
      works: number
    }
  }> {
    const intelligence = await this.parseConversation(conversation)

    let tasksCreated = 0
    let kpisCreated = 0
    let worksCreated = 0

    // Create tasks from extracted tasks and next actions
    const allTasks = [...intelligence.tasks, ...intelligence.nextActions]

    for (const taskDescription of allTasks.slice(0, 5)) { // Limit to 5 tasks per session
      if (taskDescription.length > 10) { // Only meaningful tasks

        // Find or create appropriate project
        const projectName = intelligence.projects[0] || 'seth'
        const project = await prisma.project.upsert({
          where: { name: projectName },
          create: {
            name: projectName,
            type: 'ai-derived',
            status: 'active'
          },
          update: {}
        })

        await prisma.task.create({
          data: {
            projectId: project.id,
            title: taskDescription.substring(0, 100), // Truncate long titles
            priority: intelligence.priority === 'high' ? 1 : intelligence.priority === 'low' ? 3 : 2,
            status: 'open',
            tags: intelligence.themes.join(',')
          }
        })

        tasksCreated++
      }
    }

    // Create KPI for session intelligence metrics
    if (intelligence.mood || intelligence.energy || intelligence.themes.length > 0) {
      const sethProject = await prisma.project.upsert({
        where: { name: 'seth' },
        create: {
          name: 'seth',
          type: 'personal',
          status: 'active'
        },
        update: {}
      })

      // Track conversation intelligence as KPIs
      const kpiData = [
        {
          key: `ai.sessions.${conversation.source}`,
          value: 1, // Session count
          at: conversation.timestamp
        },
        {
          key: 'ai.intelligence.themes_per_session',
          value: intelligence.themes.length,
          at: conversation.timestamp
        },
        {
          key: 'ai.intelligence.tasks_extracted',
          value: allTasks.length,
          at: conversation.timestamp
        }
      ]

      for (const kpi of kpiData) {
        await prisma.kPI.create({
          data: {
            projectId: sethProject.id,
            key: kpi.key,
            value: kpi.value,
            at: kpi.at,
            source: `ai-session-${conversation.source}`
          }
        })

        kpisCreated++
      }
    }

    // Create Work entries for significant learnings/breakthroughs
    if (intelligence.learnings.length > 0 || intelligence.mood === 'breakthrough') {
      const projectName = intelligence.projects[0] || 'seth'
      const project = await prisma.project.findFirst({
        where: { name: projectName }
      })

      if (project) {
        await prisma.work.create({
          data: {
            projectId: project.id,
            workId: `ai-insight-${Date.now()}`,
            source: `ai-session-${conversation.source}`,
            createdAt: new Date(conversation.timestamp),
            contentHash: `hash-${Date.now()}`, // Simple hash for now
            metadata: JSON.stringify({
              sessionId: conversation.sessionId,
              type: 'ai-insight',
              title: `AI Session Insights: ${intelligence.themes.join(', ')}`,
              learnings: intelligence.learnings,
              decisions: intelligence.decisions,
              mood: intelligence.mood,
              themes: intelligence.themes
            })
          }
        })

        worksCreated++
      }
    }

    // Log the processing
    await auditService.log({
      actor: 'ai-session-bridge',
      action: 'conversation.processed',
      payload: {
        source: conversation.source,
        sessionId: conversation.sessionId,
        intelligence,
        itemsCreated: { tasks: tasksCreated, kpis: kpisCreated, works: worksCreated }
      },
      status: 'success'
    })

    return {
      intelligence,
      itemsCreated: {
        tasks: tasksCreated,
        kpis: kpisCreated,
        works: worksCreated
      }
    }
  }

  /**
   * Sync conversations from various AI platforms
   */
  async syncAISessions(): Promise<{
    success: boolean
    processed: number
    itemsCreated: { tasks: number, kpis: number, works: number }
  }> {
    let totalProcessed = 0
    let totalTasks = 0
    let totalKpis = 0
    let totalWorks = 0

    try {
      // TODO: Implement actual API connections
      // For now, this is the framework for real integrations

      // 1. Limitless.ai API (when available)
      // const limitlessSessions = await this.fetchLimitlessSessions()

      // 2. ChatGPT export parsing (user uploads JSON)
      // const chatgptSessions = await this.parseChatGPTExport()

      // 3. Claude conversation export
      // const claudeSessions = await this.parseClaudeExport()

      // Mock example conversation for testing
      const mockConversation: AIConversation = {
        source: 'claude',
        sessionId: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: 'Seth Command Center Development',
        content: `
          Working on seth-command-center project. Decided to use manifest-first architecture.
          Need to integrate GitHub API and connect real data sources.
          Learned that config-driven integration prevents schema coupling.
          Feeling focused and excited about the breakthrough in ritual automation.
          Next step: build AI session bridge for intelligence extraction.
          Important to make this workflow more intelligent and adaptive.
          Todo: add photolog integration, connect Limitless API.
        `
      }

      const result = await this.processConversation(mockConversation)
      totalProcessed++
      totalTasks += result.itemsCreated.tasks
      totalKpis += result.itemsCreated.kpis
      totalWorks += result.itemsCreated.works

      await auditService.log({
        actor: 'ai-session-sync',
        action: 'sync.completed',
        payload: {
          totalProcessed,
          totalTasks,
          totalKpis,
          totalWorks
        },
        status: 'success'
      })

      return {
        success: true,
        processed: totalProcessed,
        itemsCreated: {
          tasks: totalTasks,
          kpis: totalKpis,
          works: totalWorks
        }
      }

    } catch (error) {
      await auditService.log({
        actor: 'ai-session-sync',
        action: 'sync.failed',
        payload: { error: (error as Error).message },
        status: 'failure'
      })

      return {
        success: false,
        processed: 0,
        itemsCreated: { tasks: 0, kpis: 0, works: 0 }
      }
    }
  }
}

export const aiSessionService = new AISessionService()