import { NextRequest, NextResponse } from 'next/server'
import { aiSessionService, AIConversationSchema } from '@/services/aiSessions'
import { captureApiError } from '@/lib/sentry'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle single conversation or batch
    const conversations = Array.isArray(body) ? body : [body]

    let totalProcessed = 0
    let totalTasks = 0
    let totalKpis = 0
    let totalWorks = 0
    const results = []

    for (const conversationData of conversations) {
      try {
        // Validate conversation data
        const conversation = AIConversationSchema.parse(conversationData)

        // Process the conversation
        const result = await aiSessionService.processConversation(conversation)

        totalProcessed++
        totalTasks += result.itemsCreated.tasks
        totalKpis += result.itemsCreated.kpis
        totalWorks += result.itemsCreated.works

        results.push({
          sessionId: conversation.sessionId,
          source: conversation.source,
          success: true,
          intelligence: result.intelligence,
          itemsCreated: result.itemsCreated
        })

      } catch (convError) {
        console.error('Failed to process conversation:', convError)
        results.push({
          sessionId: conversationData.sessionId || 'unknown',
          source: conversationData.source || 'unknown',
          success: false,
          error: convError instanceof Error ? convError.message : 'Processing failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: totalProcessed,
        totalItemsCreated: {
          tasks: totalTasks,
          kpis: totalKpis,
          works: totalWorks
        },
        results
      },
      message: `Processed ${totalProcessed} AI conversations, created ${totalTasks} tasks, ${totalKpis} KPIs, ${totalWorks} works`
    })

  } catch (error) {
    console.error('AI session ingestion error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/ai-sessions/ingest',
      method: 'POST'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to process AI sessions' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get AI session statistics
    const result = await aiSessionService.syncAISessions()

    return NextResponse.json({
      success: true,
      data: {
        mockSyncResult: result
      },
      message: 'AI session sync completed (mock data for now)'
    })
  } catch (error) {
    console.error('AI session sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync AI sessions' },
      { status: 500 }
    )
  }
}