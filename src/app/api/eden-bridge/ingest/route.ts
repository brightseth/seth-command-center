import { NextRequest, NextResponse } from 'next/server'
import { edenBridgeService, EdenEventSchema } from '@/services/edenBridge'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey || apiKey !== env.EDEN_BRIDGE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate event structure
    const event = EdenEventSchema.parse(body)

    // Process event through bridge service
    const result = await edenBridgeService.ingestEvent(event)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.processed.length} mappings: ${result.processed.join(', ')}`
    })

  } catch (error) {
    console.error('Eden bridge ingestion error:', error)

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: 'Invalid event format', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for bridge statistics
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for stats endpoint
    const stats = await edenBridgeService.getBridgeStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Bridge stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}