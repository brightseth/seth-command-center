import { NextRequest, NextResponse } from 'next/server'
import { ManifestService, ProjectParamsSchema, ManifestResponseSchema } from '@/services/manifest'
import { auditService } from '@/services/audit'

const manifestService = new ManifestService()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    // Validate parameters
    const { project } = ProjectParamsSchema.parse(await params)

    // Get manifest from service
    const manifest = await manifestService.getProjectManifest(project)

    // Validate response
    const validatedManifest = ManifestResponseSchema.parse(manifest)

    // Log successful manifest request
    await auditService.logManifestOperation('get', project, {
      total: validatedManifest.total,
      latestId: validatedManifest.latestId,
    })

    return NextResponse.json({
      success: true,
      data: validatedManifest,
    })
  } catch (error) {
    console.error('Manifest API error:', error)

    // Log error
    const resolvedParams = await params
    await auditService.log({
      actor: 'api',
      action: 'manifest.get',
      payload: { project: resolvedParams.project, error: String(error) },
      status: 'failure',
      error: String(error),
    })

    // Handle specific errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST for manifest recomputation (after backfill)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    const { project } = ProjectParamsSchema.parse(await params)

    // Only allow recomputation with proper authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Recompute manifest
    const result = await manifestService.recomputeManifest(project)

    // Log recomputation
    await auditService.logManifestOperation('recompute', project, {
      newTotal: result.newTotal,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Manifest recomputation error:', error)

    const resolvedParams = await params
    await auditService.log({
      actor: 'api',
      action: 'manifest.recompute',
      payload: { project: resolvedParams.project, error: String(error) },
      status: 'failure',
      error: String(error),
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}