import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const miyomiPath = '/Users/seth/miyomi-vercel'

    // Read key files
    const strategicUpdates = fs.existsSync(path.join(miyomiPath, 'STRATEGIC_UPDATES_OCT_11_2025.md'))
      ? fs.readFileSync(path.join(miyomiPath, 'STRATEGIC_UPDATES_OCT_11_2025.md'), 'utf-8')
      : null

    const kalshiOutreach = fs.existsSync(path.join(miyomiPath, 'KALSHI_PARTNERSHIP_OUTREACH.md'))
      ? fs.readFileSync(path.join(miyomiPath, 'KALSHI_PARTNERSHIP_OUTREACH.md'), 'utf-8')
      : null

    const predictionFormat = fs.existsSync(path.join(miyomiPath, 'PREDICTION_PATH_SCREENSHOT_FORMAT.md'))
      ? fs.readFileSync(path.join(miyomiPath, 'PREDICTION_PATH_SCREENSHOT_FORMAT.md'), 'utf-8')
      : null

    const a16zStrategy = fs.existsSync(path.join(miyomiPath, 'A16Z_PREDICTION_MARKETS_STRATEGY.md'))
      ? fs.readFileSync(path.join(miyomiPath, 'A16Z_PREDICTION_MARKETS_STRATEGY.md'), 'utf-8')
      : null

    // Extract key info
    const updates = {
      lastUpdated: 'October 11, 2025',
      status: 'Strategic Repositioning Complete',

      keyChanges: [
        {
          title: 'Core Positioning',
          old: '"The crowd is always wrong at extremes" - contrarian trader',
          new: '"I teach you to be predictive, not predicted" - cultural movement leader'
        },
        {
          title: 'Value Proposition',
          old: 'I find the 8% who win',
          new: 'I teach you to be upstream in the AI era'
        },
        {
          title: 'Token Pitch',
          old: 'Own trading profits',
          new: 'Own cultural relevance and prediction artifacts'
        }
      ],

      newFormats: [
        {
          name: 'Prediction Path Screenshots',
          description: 'Three-panel triptych documenting entire prediction journey (setup → execution → resolution)',
          file: 'PREDICTION_PATH_SCREENSHOT_FORMAT.md'
        }
      ],

      partnerships: [
        {
          name: 'Kalshi',
          priority: 'HIGH',
          reason: 'a16z co-led Series D (Oct 10, 2025)',
          status: 'Outreach draft ready',
          file: 'KALSHI_PARTNERSHIP_OUTREACH.md'
        }
      ],

      nextActions: [
        {
          action: 'Review strategic updates document',
          file: 'STRATEGIC_UPDATES_OCT_11_2025.md',
          priority: 'IMMEDIATE'
        },
        {
          action: 'Create Figma template for Prediction Paths',
          timeline: 'This week (Oct 12-15)',
          priority: 'HIGH'
        },
        {
          action: 'Research Kalshi contacts',
          timeline: 'This week (Oct 12-15)',
          priority: 'HIGH'
        },
        {
          action: 'Send Kalshi outreach email',
          timeline: 'This week (Oct 12-15)',
          priority: 'HIGH'
        }
      ],

      docs: {
        strategicUpdates,
        kalshiOutreach,
        predictionFormat,
        a16zStrategy
      }
    }

    return NextResponse.json({
      success: true,
      data: updates
    })

  } catch (error) {
    console.error('MIYOMI API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
