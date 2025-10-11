import { NextResponse } from 'next/server'
import { ritualScheduler } from '@/services/ritual-scheduler'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rituals/check
 *
 * Check and run scheduled rituals based on rituals.yaml
 * This endpoint is called by:
 * - Vercel cron job (production)
 * - Manual testing (development)
 * - External schedulers (alternative deployment)
 */
export async function GET() {
  try {
    console.log('[Ritual Scheduler] Running scheduled ritual check...')

    const result = await ritualScheduler.checkAndRunRituals()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checked: result.checked,
      executed: result.executed,
      results: result.results,
      message: result.executed > 0
        ? `Successfully executed ${result.executed} ritual(s)`
        : 'No rituals scheduled to run at this time'
    })

  } catch (error) {
    console.error('[Ritual Scheduler] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rituals/check
 *
 * Manually trigger ritual check (bypass time check for testing)
 */
export async function POST() {
  try {
    console.log('[Ritual Scheduler] Manual ritual check triggered...')

    // For manual triggers, we'll execute regardless of schedule
    // This is useful for testing
    const config = ritualScheduler.loadConfig()

    const results = []
    let executed = 0

    for (const ritual of config.rituals) {
      if (!ritual.enabled) continue

      console.log(`[Manual] Executing ritual: ${ritual.name}`)
      const result = await ritualScheduler.executeRitual(ritual)

      results.push({
        ritual: ritual.name,
        success: result.success,
        output: result.output,
        error: result.error
      })

      if (result.success) executed++
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: 'manual',
      checked: config.rituals.length,
      executed,
      results,
      message: `Manually executed ${executed} ritual(s)`
    })

  } catch (error) {
    console.error('[Ritual Scheduler] Manual trigger error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
