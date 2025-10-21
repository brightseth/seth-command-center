import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { captureApiError } from '@/lib/sentry'

export async function GET() {
  try {
    const rituals = await prisma.ritual.findMany({
      include: {
        project: {
          select: { name: true, color: true }
        }
      },
      orderBy: [
        { enabled: 'desc' },
        { streak: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: rituals,
      meta: {
        total: rituals.length,
        enabled: rituals.filter(r => r.enabled).length,
        disabled: rituals.filter(r => r.enabled === false).length
      }
    })
  } catch (error) {
    console.error('Rituals fetch error:', error)
    captureApiError(error as Error, {
      endpoint: '/api/rituals',
      method: 'GET'
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch rituals' },
      { status: 500 }
    )
  }
}
